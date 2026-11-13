import sdk, {
    Camera,
    EventListenerRegister,
    FFmpegInput,
    MediaObject,
    MixinProvider,
    Notifier,
    ObjectDetectionResult,
    ObjectDetectionTypes,
    ObjectDetector,
    ObjectsDetected,
    ScryptedDeviceBase,
    ScryptedDeviceType,
    ScryptedInterface,
    ScryptedMimeTypes,
    Setting,
    Settings,
    SettingValue,
    VideoCamera,
    WritableDeviceState,
} from '@scrypted/sdk';
import { SettingsMixinDeviceBase, SettingsMixinDeviceOptions } from '@scrypted/sdk/settings-mixin';
import { StorageSettings } from '@scrypted/sdk/storage-settings';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

const { systemManager, mediaManager } = sdk;

/* ------------------------------------------------------------------ */
/* AI providers                                                         */
/* ------------------------------------------------------------------ */

type ProviderId = 'anthropic' | 'openai' | 'gemini' | 'ollama' | 'custom';

const PROVIDER_CHOICES = [
    'Anthropic (Claude)',
    'OpenAI',
    'Google Gemini',
    'Ollama (local)',
    'Custom endpoint (OpenAI-compatible)',
];

function providerId(choice?: string): ProviderId {
    const c = (choice ?? '').toLowerCase();
    if (c.includes('gemini') || c.includes('google')) return 'gemini';
    if (c.includes('ollama')) return 'ollama';
    if (c.includes('custom')) return 'custom';
    if (c.includes('openai')) return 'openai';
    return 'anthropic';
}

const PROVIDER_DEFAULTS: Record<ProviderId, { baseUrl: string; model: string }> = {
    anthropic: { baseUrl: 'https://api.anthropic.com', model: 'claude-haiku-4-5' },
    openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
    gemini: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-2.5-flash' },
    ollama: { baseUrl: 'http://localhost:11434', model: 'llama3.2-vision' },
    custom: { baseUrl: '', model: '' },
};

/** Returns true if the provider is local Ollama or points to a local/LAN server (never subject to daily quota limits). */
function isLocalProvider(cfg: ProviderConfig): boolean {
    if (cfg.provider === 'ollama')
        return true;
    const url = (cfg.baseUrl ?? '').trim().toLowerCase();
    if (!url)
        return false;
    return (
        url.includes('localhost') ||
        url.includes('127.0.0.1') ||
        url.includes(':11434') ||
        url.includes('.local') ||
        /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url)
    );
}

/** Returns a message if the provider is missing required settings, otherwise undefined. */
function validateConfig(cfg: ProviderConfig): string | undefined {
    switch (cfg.provider) {
        case 'anthropic':
        case 'openai':
        case 'gemini':
            return cfg.apiKey?.trim() ? undefined : 'API key is missing.';
        case 'ollama':
            return cfg.baseUrl?.trim()
                ? undefined
                : 'Ollama URL is missing (use the LAN IP of the machine running Ollama, e.g. http://192.168.100.20:11434).';
        case 'custom':
            return cfg.baseUrl?.trim() && cfg.model?.trim() ? undefined : 'Base URL and model are both required.';
    }
}

interface ProviderConfig {
    provider: ProviderId;
    apiKey?: string;
    baseUrl?: string;
    model?: string;
}

interface ModelRequest {
    system: string;
    prompt: string;
    jpegs: Buffer[];
    maxTokens: number;
    timeoutMs: number;
}

type SavePlan = 'none' | 'snapshot' | 'clip' | 'both';

/* ------------------------------------------------------------------ */
/* Object & Face Recognition types, quality gates & similarity math     */
/* ------------------------------------------------------------------ */

const OBJECT_FILTER_CHOICES = ['person', 'face', 'vehicle', 'package', 'animal'];

const TRIGGER_CHOICES = [
    'Smart Object/Face Detection (fallback to Motion if unsupported)',
    'Smart Object/Face Detection only',
    'Motion sensor only',
    'Both Motion and Smart Object/Face Detection',
];

const FACE_ALERT_MODES = [
    'Arrival alerts + identify in security alerts',
    'Suppress security alerts when only known faces are seen',
    'Only alert when a known face is recognized',
];

export interface FaceReference {
    name: string;
    jpeg: Buffer;
    source: string;
    embedding?: number[];
}

export interface DetectedFaceCandidate {
    frameIndex: number;
    /** Normalized bounding box [x, y, width, height] in 0..1 */
    box: [number, number, number, number];
    widthPx: number;
    heightPx: number;
    sharp: boolean;
    sharpnessScore: number;
    embedding?: number[];
    upstreamLabel?: string;
    upstreamScore?: number;
}

export interface EvaluatedFace {
    /** 'known' if matched an enrolled person, 'unknown' if passed unknown quality gates, 'rejected' otherwise */
    status: 'known' | 'unknown' | 'ambiguous' | 'rejected';
    name: string; // person name or 'unknown'
    bestMatchName?: string;
    bestSimilarity: number;
    runnerUpName?: string;
    runnerUpSimilarity: number;
    widthPx: number;
    sharp: boolean;
    sharpnessScore: number;
    frameIndex: number;
    embedding?: number[];
    rejectReason?: string;
}

interface DetectorHint {
    objects: string[];
    faces: DetectedFaceCandidate[];
    detectionId?: string;
    timestamp: number;
}

interface Verdict {
    alert: boolean;
    severity: 'low' | 'medium' | 'high';
    summary: string;
    save: SavePlan;
    objects: string[];
    faces: string[];
    evaluatedFaces: EvaluatedFace[];
    bestFrameIndex: number;
}

interface PendingConfirmation {
    key: string; // Lowercase person name or 'stranger:<clusterId>'
    isStranger: boolean;
    displayName: string;
    framesSeen: number;
    requiredFrames: number;
    firstSeen: number;
    lastSeen: number;
    bestSimilarity: number;
    closestName?: string;
    widthPx: number;
    bestJpeg: Buffer;
    summary: string;
    severity: 'low' | 'medium' | 'high';
    objects: string[];
    save: SavePlan;
    embedding?: number[];
}

interface StrangerCluster {
    id: number;
    embedding?: number[];
    firstSeen: number;
    lastSeen: number;
    lastAlerted: number;
    framesSeen: number;
}

/** Reads pixel dimensions [width, height] directly from a JPEG buffer's SOF marker. */
function getJpegDimensions(buf: Buffer): [number, number] {
    if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8)
        return [1024, 576];
    let offset = 2;
    while (offset + 9 < buf.length) {
        if (buf[offset] !== 0xff) {
            offset++;
            continue;
        }
        const marker = buf[offset + 1];
        if (marker === 0xff) {
            offset++;
            continue;
        }
        if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
            offset += 2;
            continue;
        }
        const len = buf.readUInt16BE(offset + 2);
        if (len < 2 || offset + 2 + len > buf.length)
            break;
        // SOF0..SOF3, SOF5..SOF7, SOF9..SOF11, SOF13..SOF15
        if (
            (marker >= 0xc0 && marker <= 0xc3) ||
            (marker >= 0xc5 && marker <= 0xc7) ||
            (marker >= 0xc9 && marker <= 0xcb) ||
            (marker >= 0xcd && marker <= 0xcf)
        ) {
            const height = buf.readUInt16BE(offset + 5);
            const width = buf.readUInt16BE(offset + 7);
            if (width > 0 && height > 0)
                return [width, height];
        }
        offset += 2 + len;
    }
    return [1024, 576];
}

/** Decodes base64 float32 embedding from Scrypted ObjectDetectionResult if present. */
function decodeBase64Float32(b64?: string): number[] | undefined {
    if (!b64)
        return undefined;
    try {
        const buf = Buffer.from(b64, 'base64');
        if (buf.byteLength < 16 || buf.byteLength % 4 !== 0)
            return undefined;
        const count = buf.byteLength / 4;
        const out: number[] = new Array(count);
        for (let i = 0; i < count; i++)
            out[i] = buf.readFloatLE(i * 4);
        return l2Normalize(out);
    } catch {
        return undefined;
    }
}

function l2Normalize(vec: number[]): number[] {
    let sum = 0;
    for (const v of vec)
        sum += v * v;
    const norm = Math.sqrt(sum);
    if (norm < 1e-8)
        return vec;
    return vec.map(v => v / norm);
}

function cosineSimilarity(a?: number[], b?: number[]): number {
    if (!a || !b || a.length !== b.length || a.length === 0)
        return 0;
    let dot = 0;
    for (let i = 0; i < a.length; i++)
        dot += a[i] * b[i];
    return Math.max(0, Math.min(1, dot));
}

/**
 * Extracts a 48x48 RGB face patch with ffmpeg, computes a real Laplacian sharpness score,
 * and builds a normalized visual descriptor vector for appearance/stranger grouping and similarity fallback.
 */
async function analyzeFacePatch(
    ffmpegPath: string,
    jpeg: Buffer,
    box: [number, number, number, number],
): Promise<{ sharpnessScore: number; embedding: number[] } | undefined> {
    const [imgW, imgH] = getJpegDimensions(jpeg);
    const x = Math.max(0, Math.min(imgW - 16, Math.round(box[0] * imgW)));
    const y = Math.max(0, Math.min(imgH - 16, Math.round(box[1] * imgH)));
    const w = Math.max(16, Math.min(imgW - x, Math.round(box[2] * imgW)));
    const h = Math.max(16, Math.min(imgH - y, Math.round(box[3] * imgH)));

    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-patch-'));
    try {
        const inFile = path.join(dir, 'in.jpg');
        await fs.writeFile(inFile, jpeg);
        const SIZE = 48;
        const raw = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            const p = spawn(
                ffmpegPath,
                [
                    '-nostdin',
                    '-hide_banner',
                    '-loglevel', 'error',
                    '-i', inFile,
                    '-vf', `crop=${w}:${h}:${x}:${y},scale=${SIZE}:${SIZE}`,
                    '-frames:v', '1',
                    '-f', 'rawvideo',
                    '-pix_fmt', 'rgb24',
                    'pipe:1',
                ],
                { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true },
            );
            p.stdout.on('data', d => chunks.push(Buffer.from(d)));
            const timer = setTimeout(() => p.kill('SIGKILL'), 6000);
            p.on('error', e => {
                clearTimeout(timer);
                reject(e);
            });
            p.on('close', () => {
                clearTimeout(timer);
                resolve(Buffer.concat(chunks));
            });
        });

        if (raw.length < SIZE * SIZE * 3)
            return undefined;

        // Convert to grayscale and compute 2D Laplacian variance for sharpness
        const gray = new Float32Array(SIZE * SIZE);
        for (let i = 0; i < SIZE * SIZE; i++) {
            const r = raw[i * 3];
            const g = raw[i * 3 + 1];
            const b = raw[i * 3 + 2];
            gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
        }

        let lapSum = 0;
        let lapSqSum = 0;
        let count = 0;
        for (let r = 1; r < SIZE - 1; r++) {
            for (let c = 1; c < SIZE - 1; c++) {
                const idx = r * SIZE + c;
                const lap =
                    -4 * gray[idx] +
                    gray[idx - 1] +
                    gray[idx + 1] +
                    gray[idx - SIZE] +
                    gray[idx + SIZE];
                lapSum += lap;
                lapSqSum += lap * lap;
                count++;
            }
        }
        const mean = lapSum / count;
        const variance = lapSqSum / count - mean * mean;
        // Normalize variance into a 0..100+ sharpness score (sharp faces typically >= 18)
        const sharpnessScore = Math.round((variance / 12) * 10) / 10;

        // Build a 12x12x3 spatial color + gradient descriptor (432-dim L2-normalized vector)
        const GRID = 12;
        const cell = SIZE / GRID;
        const desc: number[] = [];
        for (let gr = 0; gr < GRID; gr++) {
            for (let gc = 0; gc < GRID; gc++) {
                let rSum = 0;
                let gSum = 0;
                let bSum = 0;
                let n = 0;
                for (let py = gr * cell; py < (gr + 1) * cell; py++) {
                    for (let px = gc * cell; px < (gc + 1) * cell; px++) {
                        const base = (py * SIZE + px) * 3;
                        rSum += raw[base] / 255;
                        gSum += raw[base + 1] / 255;
                        bSum += raw[base + 2] / 255;
                        n++;
                    }
                }
                desc.push(rSum / n - 0.5, gSum / n - 0.5, bSum / n - 0.5);
            }
        }

        return {
            sharpnessScore,
            embedding: l2Normalize(desc),
        };
    } catch {
        return undefined;
    } finally {
        await fs.rm(dir, { recursive: true, force: true });
    }
}

/** Maps raw object labels (e.g. 'car', 'dog', 'parcel') into both specific labels and canonical categories. */
function normalizeObjects(rawObjects: unknown[], hasFace = false): string[] {
    const out = new Set<string>();
    for (const item of rawObjects) {
        const s = String(item ?? '').trim().toLowerCase();
        if (!s || s === 'none' || s === 'motion' || s === 'unknown')
            continue;
        out.add(s);
        if (['person', 'people', 'human', 'pedestrian', 'man', 'woman', 'child', 'adult', 'delivery person'].includes(s))
            out.add('person');
        if (['face', 'human face'].includes(s)) {
            out.add('face');
            out.add('person');
        }
        if (['vehicle', 'car', 'truck', 'van', 'suv', 'bus', 'motorcycle', 'motorbike', 'bicycle', 'bike', 'scooter'].includes(s))
            out.add('vehicle');
        if (['package', 'parcel', 'box', 'delivery', 'mail'].includes(s))
            out.add('package');
        if (['animal', 'dog', 'cat', 'pet', 'bird', 'deer', 'wildlife', 'raccoon', 'fox', 'coyote', 'bear', 'squirrel'].includes(s))
            out.add('animal');
    }
    if (hasFace) {
        out.add('face');
        out.add('person');
    }
    return Array.from(out);
}

const DEFAULT_SYSTEM_PROMPT =
    'You are a home security camera analyst. ' +
    'You receive still frames sampled from a camera\'s live stream right after activity was detected, oldest first. ' +
    'Decide whether the camera frames show something the homeowner should be alerted about, considering what changes between frames. ' +
    'Identify notable objects clearly visible in the frames (such as "person", "vehicle", "car", "truck", "bicycle", "motorcycle", "package", "animal", "dog", "cat"). ' +
    'Also locate any clearly visible human faces across the frames in "detectedFaces": ' +
    'for each face, provide {"frame": 1-based frame number, "box": [x, y, width, height] as normalized 0..1 coordinates of the head/face, "sharp": boolean}. ' +
    'Set "sharp": true ONLY if the face is in focus, front/three-quarter facing, unobstructed, and facial features (eyes, nose, mouth) are clearly distinguishable. ' +
    'Set "sharp": false if the face is blurry, motion-blurred, in shadow/silhouette, tiny, or turned away. ' +
    'Set "bestFrame" to the 1-based index of the frame with the clearest view. ' +
    'Reply with ONLY a JSON object, no markdown: ' +
    '{"alert": boolean, "severity": "low" | "medium" | "high", "summary": string, "save": "none" | "snapshot" | "clip" | "both", ' +
    '"objects": string[], "detectedFaces": [{"frame": number, "box": [number, number, number, number], "sharp": boolean}], "bestFrame": number}. ' +
    'Set "save" by following the evidence rules if they are given, otherwise use "none". ' +
    'The summary is one short sentence describing what is happening (people, what they are doing, vehicles, packages, animals). ' +
    'Never guess identities. Be conservative: routine activity such as pets, passing traffic on the street, passing shadows, ' +
    'headlights, trees/wind, insects, rain, or lighting changes is NOT an alert unless the homeowner rules below say otherwise.';

const FACE_SIMILARITY_SYSTEM_PROMPT =
    'You are a precise facial recognition scoring model. ' +
    'You receive labeled reference face photos of enrolled people followed by 1 cropped/live camera image containing a face. ' +
    'For EACH enrolled person name, estimate a visual facial similarity score between 0.00 and 1.00 comparing the target face in the last image against that person\'s reference photo(s): ' +
    '- 0.75 to 1.00: Unmistakably the same person (clear match of facial structure, eyes, nose, hair/features).\n' +
    '- 0.50 to 0.74: Likely match, strong resemblance.\n' +
    '- 0.25 to 0.49: Different person with some superficial similarity.\n' +
    '- 0.00 to 0.24: Clearly a different person.\n' +
    'Also set "sharp": true only if the target face in the last image has clear, non-blurry facial features. ' +
    'Reply with ONLY a JSON object, no markdown: {"scores": {"<Name>": number}, "sharp": boolean}.';

const DEFAULT_RULES =
    'Alert on any person near a door, window or garage, anyone carrying or taking a package, ' +
    'or anyone behaving suspiciously. Do not alert on people walking by on the street.';

const DEFAULT_EVIDENCE_RULES =
    'Save a clip when a person is near a door, window or garage or is carrying or taking something. ' +
    'Save only a snapshot for other alerts. Save nothing for non-alerts.';

function buildPrompt(
    cameraName: string,
    rules: string,
    frames: number,
    intervalSec: number,
    evidenceRules?: string,
    detectorHint?: DetectorHint,
): string {
    let hintLine = '';
    if (detectorHint && (detectorHint.objects.length || detectorHint.faces.length)) {
        const parts: string[] = [];
        if (detectorHint.objects.length)
            parts.push(`objects=[${detectorHint.objects.join(', ')}]`);
        const named = detectorHint.faces.map(f => f.upstreamLabel).filter(Boolean);
        if (named.length)
            parts.push(`detector_faces=[${named.join(', ')}]`);
        hintLine = `Camera smart detector reported: ${parts.join(' ')}.\n`;
    }

    return (
        `Camera: ${cameraName}\n` +
        `Trigger: ${detectorHint ? 'smart object detection' : 'motion detected'}\n` +
        `${frames} live camera frame(s), about ${intervalSec}s apart, oldest first.\n` +
        hintLine +
        `Homeowner rules: ${rules}\n` +
        (evidenceRules ? `Evidence rules (for the "save" field): ${evidenceRules}\n` : '') +
        'Respond with the JSON object only.'
    );
}

function buildFaceSimilarityPrompt(faceRefs: FaceReference[]): string {
    const refLabels = faceRefs.map((r, i) => `Image #${i + 1} = "${r.name}"`).join(', ');
    const targetIdx = faceRefs.length + 1;
    const uniqueNames = Array.from(new Set(faceRefs.map(r => r.name)));
    return (
        `Enrolled reference face photo(s): ${refLabels}.\n` +
        `Target camera image to score: Image #${targetIdx}.\n` +
        `Return the JSON object {"scores": {${uniqueNames.map(n => `"${n}": 0.0`).join(', ')}}, "sharp": true} with your real 0.00-1.00 similarity score for each enrolled person.`
    );
}

async function postJson(url: string, headers: Record<string, string>, body: unknown, timeoutMs: number): Promise<any> {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok)
        throw new Error(`${url} returned ${res.status}: ${(await res.text()).slice(0, 500)}`);
    return res.json();
}

/** Calls the selected provider and returns the model's raw text reply. */
async function callModel(cfg: ProviderConfig, req: ModelRequest): Promise<string> {
    const defaults = PROVIDER_DEFAULTS[cfg.provider];
    const base = (cfg.baseUrl?.trim() || defaults.baseUrl).replace(/\/+$/, '');
    const model = cfg.model?.trim() || defaults.model;
    if (!base || !model)
        throw new Error(`${cfg.provider}: base URL and model are required.`);
    const b64s = req.jpegs.map(j => j.toString('base64'));

    switch (cfg.provider) {
        case 'anthropic': {
            const content: any[] = b64s.map(data => ({
                type: 'image',
                source: { type: 'base64', media_type: 'image/jpeg', data },
            }));
            content.push({ type: 'text', text: req.prompt });
            const json = await postJson(
                `${base}/v1/messages`,
                { 'x-api-key': cfg.apiKey ?? '', 'anthropic-version': '2023-06-01' },
                { model, max_tokens: req.maxTokens, system: req.system, messages: [{ role: 'user', content }] },
                req.timeoutMs,
            );
            return (json.content ?? [])
                .filter((b: any) => b.type === 'text')
                .map((b: any) => b.text)
                .join('');
        }

        case 'gemini': {
            const parts: any[] = b64s.map(data => ({ inline_data: { mime_type: 'image/jpeg', data } }));
            parts.push({ text: req.prompt });
            const json = await postJson(
                `${base}/models/${model}:generateContent`,
                { 'x-goog-api-key': cfg.apiKey ?? '' },
                {
                    systemInstruction: { parts: [{ text: req.system }] },
                    contents: [{ role: 'user', parts }],
                    generationConfig: { maxOutputTokens: req.maxTokens, responseMimeType: 'application/json' },
                },
                req.timeoutMs,
            );
            const text = (json.candidates?.[0]?.content?.parts ?? [])
                .map((p: any) => p.text)
                .filter(Boolean)
                .join('');
            if (!text)
                throw new Error(`Gemini returned no text: ${JSON.stringify(json.promptFeedback ?? json).slice(0, 300)}`);
            return text;
        }

        case 'ollama': {
            const headers: Record<string, string> = {};
            if (cfg.apiKey)
                headers.authorization = `Bearer ${cfg.apiKey}`;
            // Stitch multi-frame / reference+target images into a single JPEG for all Ollama vision models
            // (llava, llama3.2-vision, qwen2.5vl, gemma3, minicpm-v, etc.) to avoid multi-image context/token limits.
            let ollamaImages = b64s;
            if (req.jpegs.length > 1) {
                const stitched = await stitchJpegsHorizontal(req.jpegs);
                if (stitched)
                    ollamaImages = [stitched.toString('base64')];
            }
            const user: any = { role: 'user', content: req.prompt };
            if (ollamaImages.length)
                user.images = ollamaImages;
            const json = await postJson(
                `${base}/api/chat`,
                headers,
                {
                    model,
                    stream: false,
                    format: 'json',
                    messages: [{ role: 'system', content: req.system }, user],
                    options: {
                        num_predict: Math.max(req.maxTokens, 1024),
                        num_ctx: 8192,
                        temperature: 0.1,
                    },
                },
                req.timeoutMs,
            );
            return json.message?.content ?? '';
        }

        case 'openai':
        case 'custom': {
            const headers: Record<string, string> = {};
            if (cfg.apiKey)
                headers.authorization = `Bearer ${cfg.apiKey}`;
            const content: any[] = [{ type: 'text', text: req.prompt }];
            for (const data of b64s)
                content.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${data}` } });
            const json = await postJson(
                `${base}/chat/completions`,
                headers,
                {
                    model,
                    max_tokens: req.maxTokens,
                    messages: [{ role: 'system', content: req.system }, { role: 'user', content }],
                },
                req.timeoutMs,
            );
            return json.choices?.[0]?.message?.content ?? '';
        }
    }
}

interface Stage1Parsed {
    alert: boolean;
    severity: 'low' | 'medium' | 'high';
    summary: string;
    save: SavePlan;
    objects: string[];
    aiFaces: DetectedFaceCandidate[];
    bestFrameIndex: number;
}

/** Pulls the Stage 1 JSON verdict and face bounding boxes out of a model reply. */
function parseStage1(
    text: string,
    cameraJpegs: Buffer[],
    upstreamObjects: string[] = [],
): Stage1Parsed {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match)
        throw new Error(`Model did not return JSON: ${text.slice(0, 200)}`);
    const parsed = JSON.parse(match[0]);
    const frameCount = cameraJpegs.length;

    const aiFaces: DetectedFaceCandidate[] = [];
    if (Array.isArray(parsed.detectedFaces)) {
        for (const df of parsed.detectedFaces) {
            if (!df || !Array.isArray(df.box) || df.box.length !== 4)
                continue;
            const fIdx = Math.max(0, Math.min(frameCount - 1, (Number(df.frame) || 1) - 1));
            const [imgW, imgH] = getJpegDimensions(cameraJpegs[fIdx]);
            let [bx, by, bw, bh] = df.box.map((n: unknown) => Number(n) || 0);
            // Handle models that return 0..1000 or pixel coords instead of 0..1
            if (bw > 1.5 || bh > 1.5) {
                if (bw <= imgW && bh <= imgH && (bx + bw <= imgW * 1.05)) {
                    bx /= imgW;
                    by /= imgH;
                    bw /= imgW;
                    bh /= imgH;
                } else {
                    bx /= 1000;
                    by /= 1000;
                    bw /= 1000;
                    bh /= 1000;
                }
            }
            bw = Math.max(0, Math.min(1, bw));
            bh = Math.max(0, Math.min(1, bh));
            bx = Math.max(0, Math.min(1 - bw, bx));
            by = Math.max(0, Math.min(1 - bh, by));
            const widthPx = Math.round(bw * imgW);
            const heightPx = Math.round(bh * imgH);
            if (widthPx <= 0 || heightPx <= 0)
                continue;
            aiFaces.push({
                frameIndex: fIdx,
                box: [bx, by, bw, bh],
                widthPx,
                heightPx,
                sharp: df.sharp === true || df.sharp === 'true',
                sharpnessScore: df.sharp ? 25 : 8,
            });
        }
    }

    const rawObjects = Array.isArray(parsed.objects) ? [...parsed.objects, ...upstreamObjects] : upstreamObjects;
    const objects = normalizeObjects(rawObjects, aiFaces.length > 0);
    const rawBest = Number(parsed.bestFrame);
    const bestFrameIndex =
        Number.isFinite(rawBest) && rawBest >= 1 && rawBest <= frameCount
            ? Math.round(rawBest) - 1
            : Math.floor(frameCount / 2);

    // Fallback for vision models like llava that report a person/face without returning bounding box coordinates
    if (aiFaces.length === 0 && (objects.includes('person') || objects.includes('face') || parsed.sharp === true)) {
        const [imgW, imgH] = getJpegDimensions(cameraJpegs[bestFrameIndex] ?? cameraJpegs[0]);
        aiFaces.push({
            frameIndex: bestFrameIndex,
            box: [0.25, 0.08, 0.5, 0.55],
            widthPx: Math.round(imgW * 0.25),
            heightPx: Math.round(imgH * 0.35),
            sharp: parsed.sharp !== false,
            sharpnessScore: 20,
        });
    }

    return {
        alert: parsed.alert === true || parsed.alert === 'true',
        severity: ['low', 'medium', 'high'].includes(parsed.severity) ? parsed.severity : 'medium',
        summary: String(parsed.summary ?? '').trim() || 'Activity detected.',
        save: ['none', 'snapshot', 'clip', 'both'].includes(parsed.save) ? parsed.save : 'none',
        objects,
        aiFaces,
        bestFrameIndex,
    };
}

function parseFaceSimilarityReply(text: string): { scores: Map<string, number>; sharp?: boolean } {
    const scores = new Map<string, number>();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match)
        return { scores };
    try {
        const parsed = JSON.parse(match[0]);
        if (parsed.scores && typeof parsed.scores === 'object') {
            for (const [k, v] of Object.entries(parsed.scores)) {
                const num = Number(v);
                if (Number.isFinite(num))
                    scores.set(k.trim(), Math.max(0, Math.min(1, num)));
            }
        }
        const sharp = typeof parsed.sharp === 'boolean' ? parsed.sharp : undefined;
        return { scores, sharp };
    } catch {
        return { scores };
    }
}

/* ------------------------------------------------------------------ */
/* Live stream frame sampling & image normalization (built-in ffmpeg)   */
/* ------------------------------------------------------------------ */

async function sampleFrames(
    ffmpegPath: string,
    inputArgs: string[],
    count: number,
    intervalSec: number,
    log: (msg: string) => void,
): Promise<Buffer[]> {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-alerts-'));
    try {
        const args = [
            '-nostdin',
            '-hide_banner',
            '-loglevel', 'error',
            ...inputArgs,
            '-an',
            '-vf', `fps=1/${intervalSec},scale=min(1024\\,iw):-2`,
            '-frames:v', String(count),
            '-q:v', '5',
            path.join(dir, 'frame_%02d.jpg'),
        ];

        const killAfterMs = (count * intervalSec + 20) * 1000;
        let stderr = '';
        await new Promise<void>((resolve, reject) => {
            const p = spawn(ffmpegPath, args, {
                stdio: ['ignore', 'ignore', 'pipe'],
                windowsHide: true,
            });
            p.stderr.on('data', d => (stderr += d.toString()));
            const timer = setTimeout(() => p.kill('SIGKILL'), killAfterMs);
            p.on('error', e => {
                clearTimeout(timer);
                reject(e);
            });
            p.on('close', () => {
                clearTimeout(timer);
                resolve();
            });
        });

        const files = (await fs.readdir(dir)).filter(f => f.endsWith('.jpg')).sort();
        if (!files.length)
            throw new Error(`ffmpeg produced no frames. ${stderr.slice(0, 300)}`);
        if (stderr)
            log(`ffmpeg: ${stderr.slice(0, 200)}`);
        return Promise.all(files.map(f => fs.readFile(path.join(dir, f))));
    } finally {
        await fs.rm(dir, { recursive: true, force: true });
    }
}

/** Converts/resizes a reference face image buffer to a compact JPEG (<= 512px wide) using Scrypted's ffmpeg. */
async function normalizeReferenceJpeg(raw: Buffer, extHint = '.jpg'): Promise<Buffer> {
    const isJpeg = raw.length >= 3 && raw[0] === 0xff && raw[1] === 0xd8 && raw[2] === 0xff;
    if (isJpeg && raw.length <= 150 * 1024)
        return raw;

    try {
        const ffmpegPath = await mediaManager.getFFmpegPath();
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-face-'));
        try {
            const safeExt = /^\.[a-z0-9]+$/i.test(extHint) ? extHint : '.img';
            const inFile = path.join(dir, `in${safeExt}`);
            const outFile = path.join(dir, 'out.jpg');
            await fs.writeFile(inFile, raw);
            await new Promise<void>((resolve, reject) => {
                const p = spawn(
                    ffmpegPath,
                    [
                        '-nostdin',
                        '-hide_banner',
                        '-loglevel', 'error',
                        '-i', inFile,
                        '-frames:v', '1',
                        '-vf', 'scale=min(512\\,iw):-2',
                        '-q:v', '5',
                        outFile,
                    ],
                    { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true },
                );
                const timer = setTimeout(() => p.kill('SIGKILL'), 10000);
                p.on('error', e => {
                    clearTimeout(timer);
                    reject(e);
                });
                p.on('close', () => {
                    clearTimeout(timer);
                    resolve();
                });
            });
            return await fs.readFile(outFile);
        } finally {
            await fs.rm(dir, { recursive: true, force: true });
        }
    } catch {
        if (isJpeg)
            return raw;
        throw new Error('Could not convert reference image to JPEG with ffmpeg.');
    }
}

/** Extracts a clean person name from a filename like "Alice_1.jpg" or "John-Smith-2.png" -> "Alice" / "John Smith". */
function personNameFromFilename(file: string): string {
    const base = path.basename(file, path.extname(file));
    return base
        .replace(/[_\-\s]+\d+$/, '')
        .replace(/[_]+/g, ' ')
        .trim();
}

/**
 * Stitches multiple JPEGs side-by-side into a single composite JPEG using Scrypted's ffmpeg.
 * Used for Ollama models like `llava` that only support a single image per request and to minimize vision tokens.
 */
async function stitchJpegsHorizontal(jpegs: Buffer[]): Promise<Buffer | undefined> {
    if (jpegs.length <= 1)
        return jpegs[0];
    try {
        const ffmpegPath = await mediaManager.getFFmpegPath();
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-stitch-'));
        try {
            const inputArgs: string[] = [];
            for (let i = 0; i < jpegs.length; i++) {
                const p = path.join(dir, `in_${i}.jpg`);
                await fs.writeFile(p, jpegs[i]);
                inputArgs.push('-i', p);
            }
            const n = jpegs.length;
            const scaleParts = jpegs.map((_, i) => `[${i}:v]scale=-2:384[v${i}]`).join(';');
            const stackInputs = jpegs.map((_, i) => `[v${i}]`).join('');
            const filterComplex = `${scaleParts};${stackInputs}hstack=inputs=${n}[out]`;
            const outFile = path.join(dir, 'stitched.jpg');

            await new Promise<void>((resolve, reject) => {
                const proc = spawn(
                    ffmpegPath,
                    [
                        '-nostdin',
                        '-hide_banner',
                        '-loglevel', 'error',
                        ...inputArgs,
                        '-filter_complex', filterComplex,
                        '-map', '[out]',
                        '-frames:v', '1',
                        '-q:v', '5',
                        outFile,
                    ],
                    { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true },
                );
                const timer = setTimeout(() => proc.kill('SIGKILL'), 10000);
                proc.on('error', e => {
                    clearTimeout(timer);
                    reject(e);
                });
                proc.on('close', () => {
                    clearTimeout(timer);
                    resolve();
                });
            });
            return await fs.readFile(outFile);
        } finally {
            await fs.rm(dir, { recursive: true, force: true });
        }
    } catch {
        return undefined;
    }
}

/* ------------------------------------------------------------------ */
/* Notification helpers                                                 */
/* ------------------------------------------------------------------ */

const CHANNELS = ['Home Assistant', 'ntfy', 'Pushover', 'Telegram'];

type Severity = 'low' | 'medium' | 'high';

interface AlertRequest {
    title: string;
    message: string;
    severity: Severity;
    channels: string[];
    jpeg?: Buffer;
    haCameraEntity?: string;
    tag?: string;
    objects?: string[];
    faces?: string[];
}

interface AlertResult {
    sent: string[];
    errors: string[];
    configured: number;
}

function errMsg(e: unknown): string {
    return e instanceof Error ? e.message : String(e);
}

function asList(v: unknown): string[] {
    if (Array.isArray(v)) return v.map(String);
    return v ? [String(v)] : [];
}

/** fetch that throws a readable error on non-2xx responses. */
async function fetchOk(url: string, init: RequestInit, timeoutMs = 20000): Promise<string> {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
    const text = await res.text();
    if (!res.ok)
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
    return text;
}

/** HTTP header values must be ASCII; encode anything else as an RFC 2047 word. */
function mimeHeader(s: string): string {
    const oneLine = s.replace(/[\r\n]+/g, ' ');
    return /^[\x20-\x7e]*$/.test(oneLine) ? oneLine : `=?UTF-8?B?${Buffer.from(oneLine).toString('base64')}?=`;
}

/* ------------------------------------------------------------------ */
/* Per-camera mixin                                                     */
/* ------------------------------------------------------------------ */

class AIAlertsMixin
    extends SettingsMixinDeviceBase<VideoCamera & Partial<Camera> & Partial<ObjectDetector>>
    implements Settings, ObjectDetector
{
    provider: AIAlertsPlugin;
    motionListener?: EventListenerRegister;
    objectListener?: EventListenerRegister;
    motionTimer?: ReturnType<typeof setTimeout>;
    recheckTimer?: ReturnType<typeof setTimeout>;
    busy = false;
    lastRun = 0;
    lastDetectionId?: string;
    lastDetectionJpeg?: Buffer;
    pendingHint?: DetectorHint;

    /** Multi-frame confirmation state within 30s window, keyed by person name or 'stranger:<id>' */
    pendingConfirmations = new Map<string, PendingConfirmation>();
    /** Cooldown timestamps per known person name (lowercase) */
    knownLastAlerted = new Map<string, number>();
    /** Grouped stranger clusters for deduplication across frames and 15-min cooldown */
    strangerClusters: StrangerCluster[] = [];
    nextStrangerId = 1;

    storageSettings = new StorageSettings(this, {
        enabled: {
            title: 'Enable AI alerts',
            type: 'boolean',
            defaultValue: false,
        },
        triggerSource: {
            title: 'Trigger source',
            description:
                'Smart Object/Face Detection avoids false motion triggers (trees, shadows, headlights). ' +
                'Automatically falls back to Motion if this camera does not have a smart detector.',
            type: 'string',
            choices: TRIGGER_CHOICES,
            defaultValue: TRIGGER_CHOICES[0],
        },
        minDetectorScore: {
            title: 'Minimum smart detector confidence (0.1 - 0.95)',
            description: 'Ignores low-confidence Scrypted ObjectDetector triggers to save AI tokens.',
            type: 'number',
            defaultValue: 0.6,
        },
        motionDelaySeconds: {
            title: 'Motion settle delay (seconds)',
            description:
                'When triggered by a raw motion sensor, waits briefly before sampling so the person/object is fully in frame.',
            type: 'number',
            defaultValue: 1.5,
        },
        frameCount: {
            title: 'Frames to analyze',
            description: 'Frames sampled from the live stream after motion starts. More frames give better context but cost more.',
            type: 'number',
            defaultValue: 3,
        },
        frameIntervalSeconds: {
            title: 'Seconds between frames',
            type: 'number',
            defaultValue: 2,
        },
        cooldownSeconds: {
            title: 'Scene cooldown (seconds)',
            description: 'Minimum time between general scene AI analyses for this camera (face confirmation re-checks still run).',
            type: 'number',
            defaultValue: 30,
        },
        rules: {
            title: 'What should trigger an alert?',
            description: 'Plain-English rules the AI uses to decide.',
            type: 'textarea',
            defaultValue: DEFAULT_RULES,
        },
        objectFilter: {
            title: 'Required object types (optional)',
            description:
                'Only send an alert if at least one of these object categories is detected. Leave empty to allow any alert.',
            type: 'string',
            multiple: true,
            choices: OBJECT_FILTER_CHOICES,
            defaultValue: [],
        },
        faceAlertMode: {
            title: 'Face recognition behavior',
            description:
                'Sends "<Name> arrived" alerts for confirmed known people (unless listed in "Never notify for these names" on the plugin page) ' +
                'and tracks strangers across frames with quality gates.',
            type: 'string',
            choices: FACE_ALERT_MODES,
            defaultValue: FACE_ALERT_MODES[0],
        },
        emitObjectDetections: {
            title: 'Emit Scrypted ObjectDetector events',
            description:
                'Publishes AI-detected objects (person, vehicle, package, animal) and confirmed face labels back to Scrypted.',
            type: 'boolean',
            defaultValue: true,
        },
        minSeverity: {
            title: 'Minimum severity to notify',
            type: 'string',
            choices: ['low', 'medium', 'high'],
            defaultValue: 'low',
        },
        channels: {
            title: 'Send alerts to',
            description:
                'Phone/app channels configured on the AI Vision Alerts plugin page. ' +
                'Leave empty to use every channel that is configured.',
            type: 'string',
            multiple: true,
            choices: CHANNELS,
            defaultValue: [],
        },
        haCameraEntity: {
            title: 'Home Assistant camera entity (optional)',
            description:
                'e.g. camera.front_door. If this camera also exists in Home Assistant, the phone notification ' +
                'will include a camera snapshot. Leave blank for text only.',
        },
        notifiers: {
            title: 'Also send to Scrypted notifiers (optional)',
            type: 'device',
            multiple: true,
            deviceFilter: `interfaces.includes('${ScryptedInterface.Notifier}')`,
        },
        attachSnapshot: {
            title: 'Attach a frame to notifications',
            description: 'Applies to ntfy, Pushover, Telegram and Scrypted notifiers. Home Assistant uses the camera entity above.',
            type: 'boolean',
            defaultValue: true,
        },
        saveEvidence: {
            title: 'Save evidence (needs the NVR Storage plugin)',
            description:
                'What to save when an alert fires. Add the NVR Storage plugin under "Also send to Scrypted notifiers" ' +
                'so it receives the request.',
            type: 'string',
            choices: ['Off', 'Snapshot', 'Clip', 'Snapshot + clip', 'Let the AI decide'],
            defaultValue: 'Off',
        },
        evidenceRules: {
            title: 'Evidence rules (used by "Let the AI decide")',
            description: 'Plain-English rules for when to save a snapshot, a clip, both or nothing.',
            type: 'textarea',
            defaultValue: DEFAULT_EVIDENCE_RULES,
        },
        analyzeNow: {
            title: 'Analyze now (test)',
            description: 'Samples the live stream, asks the AI, and sends a notification regardless of the verdict.',
            type: 'button',
            onPut: async () => {
                await this.analyze(true, undefined, false);
            },
        },
    });

    constructor(
        options: SettingsMixinDeviceOptions<VideoCamera & Partial<Camera> & Partial<ObjectDetector>>,
        provider: AIAlertsPlugin,
    ) {
        super(options);
        this.provider = provider;

        const hasObjectDetector = this.mixinDeviceInterfaces.includes(ScryptedInterface.ObjectDetector);

        if (this.mixinDeviceInterfaces.includes(ScryptedInterface.MotionSensor)) {
            this.motionListener = systemManager.listenDevice(
                this.id,
                ScryptedInterface.MotionSensor,
                (_source, _details, data: boolean) => {
                    if (data !== true)
                        return;
                    const trig = String(this.storageSettings.values.triggerSource ?? TRIGGER_CHOICES[0]);
                    if (trig === 'Smart Object/Face Detection only')
                        return;
                    if (trig.startsWith('Smart Object/Face Detection (fallback') && hasObjectDetector)
                        return;

                    const delayMs = Math.min(10, Math.max(0, Number(this.storageSettings.values.motionDelaySeconds ?? 1.5))) * 1000;
                    if (this.motionTimer)
                        return;
                    this.motionTimer = setTimeout(() => {
                        this.motionTimer = undefined;
                        this.analyze(false).catch(e => this.console.error('analyze failed', e));
                    }, delayMs);
                },
            );
        }

        if (hasObjectDetector) {
            this.objectListener = systemManager.listenDevice(
                this.id,
                ScryptedInterface.ObjectDetector,
                (_source, _details, data: ObjectsDetected) => {
                    this.onObjectsDetected(data);
                },
            );
        }
    }

    dispose() {
        if (this.motionTimer) {
            clearTimeout(this.motionTimer);
            this.motionTimer = undefined;
        }
        if (this.recheckTimer) {
            clearTimeout(this.recheckTimer);
            this.recheckTimer = undefined;
        }
        this.motionListener?.removeListener();
        this.motionListener = undefined;
        this.objectListener?.removeListener();
        this.objectListener = undefined;
    }

    onObjectsDetected(data?: ObjectsDetected) {
        if (!data || data.sourceId === 'ai-vision-alerts' || data.detectionId?.startsWith('ai-vision-alerts-'))
            return;
        const minScore = Math.min(0.95, Math.max(0.1, Number(this.storageSettings.values.minDetectorScore ?? 0.6)));
        const detections = data.detections ?? [];
        const rawClasses: string[] = [];
        const faceCandidates: DetectedFaceCandidate[] = [];
        const [dimW, dimH] = data.inputDimensions ?? [1024, 576];

        for (const d of detections) {
            if (!d.className || d.className === 'motion')
                continue;
            if (typeof d.score === 'number' && d.score < minScore)
                continue;

            let normBox: [number, number, number, number] = [0.25, 0.15, 0.25, 0.35];
            let widthPx = 96;
            let heightPx = 96;
            if (d.boundingBox && d.boundingBox.length === 4) {
                const [bx, by, bw, bh] = d.boundingBox;
                const normX = dimW > 1.5 ? bx / dimW : bx;
                const normY = dimH > 1.5 ? by / dimH : by;
                const normW = dimW > 1.5 ? bw / dimW : bw;
                const normH = dimH > 1.5 ? bh / dimH : bh;
                if (normW > 0 && normH > 0 && normW * normH < 0.01)
                    continue;
                normBox = [
                    Math.max(0, Math.min(1, normX)),
                    Math.max(0, Math.min(1, normY)),
                    Math.max(0, Math.min(1, normW)),
                    Math.max(0, Math.min(1, normH)),
                ];
                widthPx = Math.round(normW * (dimW > 1.5 ? dimW : 1024));
                heightPx = Math.round(normH * (dimH > 1.5 ? dimH : 576));
            }

            rawClasses.push(d.className);
            if (d.className === 'face' || (d.label && d.label.trim())) {
                faceCandidates.push({
                    frameIndex: 0,
                    box: normBox,
                    widthPx,
                    heightPx,
                    sharp: true,
                    sharpnessScore: 22,
                    embedding: decodeBase64Float32(d.embedding),
                    upstreamLabel: d.label?.trim() || undefined,
                    upstreamScore: d.labelScore ?? d.score,
                });
            }
        }

        const objects = normalizeObjects(rawClasses, faceCandidates.length > 0);
        if (!objects.length && !faceCandidates.length)
            return;

        this.pendingHint = {
            objects,
            faces: faceCandidates,
            detectionId: data.detectionId,
            timestamp: Date.now(),
        };

        const trig = String(this.storageSettings.values.triggerSource ?? TRIGGER_CHOICES[0]);
        if (trig === 'Motion sensor only')
            return;

        this.analyze(false, this.pendingHint).catch(e => this.console.error('analyze failed', e));
    }

    getMixinSettings(): Promise<Setting[]> {
        return this.storageSettings.getSettings();
    }

    putMixinSetting(key: string, value: SettingValue): Promise<void> {
        return this.storageSettings.putSetting(key, value);
    }

    /* ---------------- Scrypted ObjectDetector interface ---------------- */

    async getObjectTypes(): Promise<ObjectDetectionTypes> {
        const classes = new Set<string>(['person', 'face', 'vehicle', 'car', 'truck', 'bicycle', 'motorcycle', 'package', 'animal', 'dog', 'cat']);
        if (this.mixinDeviceInterfaces.includes(ScryptedInterface.ObjectDetector) && this.mixinDevice.getObjectTypes) {
            try {
                const upstream = await this.mixinDevice.getObjectTypes();
                for (const c of upstream?.classes ?? [])
                    classes.add(c);
            } catch {
                // ignore upstream errors
            }
        }
        const knownNames = await this.provider.getKnownFaceNames();
        for (const name of knownNames)
            classes.add(name);
        return { classes: Array.from(classes) };
    }

    async getDetectionInput(detectionId: string, eventId?: any): Promise<MediaObject> {
        if (detectionId === this.lastDetectionId && this.lastDetectionJpeg)
            return this.createMediaObject(this.lastDetectionJpeg, 'image/jpeg');
        if (this.mixinDeviceInterfaces.includes(ScryptedInterface.ObjectDetector) && this.mixinDevice.getDetectionInput)
            return this.mixinDevice.getDetectionInput(detectionId, eventId);
        throw new Error(`Detection input ${detectionId} is no longer available.`);
    }

    /** Emits an ObjectsDetected event onto Scrypted for automations, HomeKit, or NVR. */
    async emitDetections(verdict: Verdict, representativeJpeg?: Buffer) {
        if (!this.storageSettings.values.emitObjectDetections)
            return;
        if (!verdict.objects.length && !verdict.faces.length)
            return;

        const detectionId = `ai-vision-alerts-${Date.now()}`;
        this.lastDetectionId = detectionId;
        this.lastDetectionJpeg = representativeJpeg;

        const detections: ObjectDetectionResult[] = [];
        for (const obj of verdict.objects) {
            if (obj === 'face' && !verdict.faces.length)
                continue;
            detections.push({
                className: obj,
                score: 0.9,
                boundingBox: [0, 0, 1, 1],
            });
        }
        for (const face of verdict.faces) {
            if (face.toLowerCase() === 'unknown')
                continue;
            detections.push({
                className: 'face',
                label: face,
                score: 0.9,
                labelScore: 0.9,
                boundingBox: [0, 0, 1, 1],
            });
        }
        if (!detections.length)
            return;

        const event: ObjectsDetected = {
            timestamp: Date.now(),
            detectionId,
            sourceId: 'ai-vision-alerts',
            detections,
        };
        try {
            await this.onDeviceEvent(ScryptedInterface.ObjectDetector, event);
        } catch (e) {
            this.console.warn('Failed to emit ObjectDetector event:', errMsg(e));
        }
    }

    /** Grabs frames from the live stream (and optional detector frame); falls back to a snapshot if that fails. */
    async captureFrames(count: number, intervalSec: number, detectionId?: string): Promise<Buffer[]> {
        let detectorFrame: Buffer | undefined;
        if (
            detectionId &&
            this.mixinDeviceInterfaces.includes(ScryptedInterface.ObjectDetector) &&
            this.mixinDevice.getDetectionInput
        ) {
            try {
                const mo = await this.mixinDevice.getDetectionInput(detectionId);
                detectorFrame = await mediaManager.convertMediaObjectToBuffer(mo, 'image/jpeg');
            } catch {
                // fall back to live stream sampling
            }
        }

        try {
            let mo: MediaObject;
            try {
                mo = await this.mixinDevice.getVideoStream({ destination: 'low-resolution' });
            } catch {
                mo = await this.mixinDevice.getVideoStream();
            }
            const input = await mediaManager.convertMediaObjectToJSON<FFmpegInput>(mo, ScryptedMimeTypes.FFmpegInput);
            const inputArgs = input.inputArguments?.length
                ? input.inputArguments
                : input.url
                    ? ['-i', input.url]
                    : [];
            if (!inputArgs.length)
                throw new Error('Camera stream did not provide FFmpeg input arguments or URL.');
            const ffmpegPath = await mediaManager.getFFmpegPath();
            const sampled = await sampleFrames(ffmpegPath, inputArgs, count, intervalSec, m => this.console.warn(m));
            if (detectorFrame)
                return [detectorFrame, ...sampled.slice(0, Math.max(0, count - 1))];
            return sampled;
        } catch (e) {
            if (detectorFrame)
                return [detectorFrame];
            this.console.warn('Live stream sampling failed, trying a snapshot instead:', e);
            if (!this.mixinDevice.takePicture)
                throw e;
            const picture = await this.mixinDevice.takePicture!({ reason: 'event' });
            return [await mediaManager.convertMediaObjectToBuffer(picture, 'image/jpeg')];
        }
    }

    /** Calls the first working provider in the chain, enforcing daily quota only on paid cloud providers. */
    async runWithProviderChain(chain: ProviderConfig[], request: ModelRequest): Promise<{ text: string; used: ProviderId }> {
        let lastError: unknown;
        for (const cfg of chain) {
            if (!isLocalProvider(cfg) && !this.provider.tryConsumeQuota(cfg)) {
                lastError = new Error(
                    `${cfg.provider}: Daily cloud AI call limit reached (raise or set Daily AI call limit to 0 for unlimited).`,
                );
                this.console.warn(errMsg(lastError));
                continue;
            }
            try {
                const text = await callModel(cfg, request);
                return { text, used: cfg.provider };
            } catch (e) {
                lastError = e;
                this.console.warn(`${cfg.provider} failed: ${errMsg(e)}`);
            }
        }
        throw lastError;
    }

    /** Assigns or reuses a stranger cluster so the same stranger counts as one person across frames. */
    matchOrCreateStrangerCluster(embedding?: number[]): StrangerCluster {
        const now = Date.now();
        const cooldownMs = this.provider.strangerCooldownMs();
        // Prune expired stranger clusters older than max(cooldownMs, 30 min)
        this.strangerClusters = this.strangerClusters.filter(c => now - c.lastSeen < Math.max(cooldownMs, 30 * 60 * 1000));

        let bestCluster: StrangerCluster | undefined;
        let bestSim = 0;
        for (const cluster of this.strangerClusters) {
            if (embedding && cluster.embedding) {
                const sim = cosineSimilarity(embedding, cluster.embedding);
                // Same stranger appearance within session or recent frames
                const threshold = now - cluster.lastSeen < 45000 ? 0.62 : 0.74;
                if (sim >= threshold && sim > bestSim) {
                    bestSim = sim;
                    bestCluster = cluster;
                }
            } else if (now - cluster.lastSeen < 35000) {
                // Within the active 30s confirmation window on the same camera without embedding
                bestCluster = cluster;
                break;
            }
        }

        if (bestCluster) {
            bestCluster.lastSeen = now;
            if (embedding && bestCluster.embedding) {
                // Exponential moving average of appearance embedding
                const blended = bestCluster.embedding.map((v, i) => 0.7 * v + 0.3 * embedding[i]);
                bestCluster.embedding = l2Normalize(blended);
            } else if (embedding) {
                bestCluster.embedding = embedding;
            }
            return bestCluster;
        }

        const created: StrangerCluster = {
            id: this.nextStrangerId++,
            embedding,
            firstSeen: now,
            lastSeen: now,
            lastAlerted: 0,
            framesSeen: 0,
        };
        this.strangerClusters.push(created);
        return created;
    }

    /** Evaluates detected face candidates against quality gates, match threshold, and look-alike margin. */
    async evaluateFaces(
        candidates: DetectedFaceCandidate[],
        cameraJpegs: Buffer[],
        chain: ProviderConfig[],
    ): Promise<EvaluatedFace[]> {
        if (!candidates.length || !this.provider.isFaceRecognitionEnabled())
            return [];

        const ffmpegPath = await mediaManager.getFFmpegPath();
        const faceRefs = await this.provider.getKnownFaces();
        const minKnownWidth = this.provider.minFaceWidthPx(); // default 64 px
        const minUnknownWidth = this.provider.minUnknownFaceWidthPx(); // default 80 px
        const matchThreshold = this.provider.matchThreshold(); // default 0.5
        const lookAlikeMargin = this.provider.lookAlikeMargin(); // default 0.06

        // Enrich candidates with real pixel sharpness & patch embedding via ffmpeg
        for (const c of candidates) {
            const frame = cameraJpegs[c.frameIndex] ?? cameraJpegs[0];
            const patch = await analyzeFacePatch(ffmpegPath, frame, c.box);
            if (patch) {
                c.sharpnessScore = patch.sharpnessScore;
                // Must pass both AI sharpness check and Laplacian pixel sharpness (>= 14)
                c.sharp = c.sharp && patch.sharpnessScore >= 14;
                if (!c.embedding)
                    c.embedding = patch.embedding;
            }
        }

        // Group candidates by frame or pick best candidate per frame so we know how many frames saw each face
        const results: EvaluatedFace[] = [];

        // If we have at least one candidate >= minKnownWidth and faceRefs exist, query AI similarity once for the sharpest/largest frame
        let aiScoresByPerson = new Map<string, number>();
        let aiSharpOverride: boolean | undefined;
        const viableForAi = candidates
            .filter(c => c.widthPx >= minKnownWidth)
            .sort((a, b) => (Number(b.sharp) - Number(a.sharp)) || (b.widthPx - a.widthPx));

        if (viableForAi.length > 0 && faceRefs.length > 0) {
            try {
                const bestCand = viableForAi[0];
                const bestJpeg = cameraJpegs[bestCand.frameIndex] ?? cameraJpegs[0];
                const simReq: ModelRequest = {
                    system: FACE_SIMILARITY_SYSTEM_PROMPT,
                    prompt: buildFaceSimilarityPrompt(faceRefs),
                    jpegs: [...faceRefs.map(r => r.jpeg), bestJpeg],
                    maxTokens: 150,
                    timeoutMs: this.provider.timeoutMs(),
                };
                const { text: simText } = await this.runWithProviderChain(chain, simReq);
                const parsedSim = parseFaceSimilarityReply(simText);
                aiScoresByPerson = parsedSim.scores;
                aiSharpOverride = parsedSim.sharp;
            } catch (e) {
                this.console.warn('Face similarity scoring failed:', errMsg(e));
            }
        }

        // Group enrolled references by person name
        const refsByPerson = new Map<string, FaceReference[]>();
        for (const r of faceRefs) {
            const list = refsByPerson.get(r.name) ?? [];
            list.push(r);
            refsByPerson.set(r.name, list);
        }

        for (const cand of candidates) {
            const effectiveSharp = aiSharpOverride === false ? false : cand.sharp;

            // Compute similarity score for each enrolled person (combining AI score, upstream detector score, and patch cosine similarity)
            const personScores: { name: string; score: number }[] = [];
            for (const [personName, refs] of refsByPerson.entries()) {
                let aiScore = 0;
                for (const [k, v] of aiScoresByPerson.entries()) {
                    if (k.toLowerCase() === personName.toLowerCase()) {
                        aiScore = v;
                        break;
                    }
                }
                let patchSim = 0;
                for (const ref of refs) {
                    if (cand.embedding && ref.embedding)
                        patchSim = Math.max(patchSim, cosineSimilarity(cand.embedding, ref.embedding));
                }
                let upstreamSim = 0;
                if (cand.upstreamLabel && cand.upstreamLabel.toLowerCase() === personName.toLowerCase())
                    upstreamSim = cand.upstreamScore ?? 0.75;

                // Combine available signals into a calibrated 0.00..1.00 similarity score
                let combined = aiScore;
                if (upstreamSim > 0 && aiScore > 0)
                    combined = 0.65 * aiScore + 0.35 * upstreamSim;
                else if (upstreamSim > 0)
                    combined = upstreamSim;
                else if (aiScore > 0 && patchSim > 0)
                    combined = 0.85 * aiScore + 0.15 * patchSim;
                else if (patchSim > 0 && aiScoresByPerson.size === 0)
                    combined = patchSim * 0.75;

                personScores.push({ name: personName, score: Math.round(combined * 100) / 100 });
            }

            personScores.sort((a, b) => b.score - a.score);
            const best = personScores[0];
            const runnerUp = personScores[1];
            const bestSimilarity = best?.score ?? 0;
            const bestMatchName = best?.name;
            const runnerUpSimilarity = runnerUp?.score ?? 0;
            const runnerUpName = runnerUp?.name;
            const margin = Math.round((bestSimilarity - runnerUpSimilarity) * 100) / 100;

            // 1. Minimum face width gate for any face (default 64 px)
            if (cand.widthPx < minKnownWidth) {
                results.push({
                    status: 'rejected',
                    name: 'ignored',
                    bestMatchName,
                    bestSimilarity,
                    runnerUpName,
                    runnerUpSimilarity,
                    widthPx: cand.widthPx,
                    sharp: effectiveSharp,
                    sharpnessScore: cand.sharpnessScore,
                    frameIndex: cand.frameIndex,
                    embedding: cand.embedding,
                    rejectReason: `${cand.widthPx}px < ${minKnownWidth}px min width`,
                });
                continue;
            }

            // 2. Check if it meets known match threshold (default 0.5) and look-alike margin (default 0.06)
            if (bestMatchName && bestSimilarity >= matchThreshold) {
                if (runnerUp && margin < lookAlikeMargin) {
                    results.push({
                        status: 'ambiguous',
                        name: 'ambiguous',
                        bestMatchName,
                        bestSimilarity,
                        runnerUpName,
                        runnerUpSimilarity,
                        widthPx: cand.widthPx,
                        sharp: effectiveSharp,
                        sharpnessScore: cand.sharpnessScore,
                        frameIndex: cand.frameIndex,
                        embedding: cand.embedding,
                        rejectReason: `margin ${margin.toFixed(2)} < ${lookAlikeMargin} (${bestMatchName} ${bestSimilarity.toFixed(2)} vs ${runnerUpName} ${runnerUpSimilarity.toFixed(2)})`,
                    });
                    continue;
                }
                if (!effectiveSharp) {
                    results.push({
                        status: 'rejected',
                        name: 'ignored',
                        bestMatchName,
                        bestSimilarity,
                        runnerUpName,
                        runnerUpSimilarity,
                        widthPx: cand.widthPx,
                        sharp: false,
                        sharpnessScore: cand.sharpnessScore,
                        frameIndex: cand.frameIndex,
                        embedding: cand.embedding,
                        rejectReason: `blurry (sharpness ${cand.sharpnessScore})`,
                    });
                    continue;
                }
                results.push({
                    status: 'known',
                    name: bestMatchName,
                    bestMatchName,
                    bestSimilarity,
                    runnerUpName,
                    runnerUpSimilarity,
                    widthPx: cand.widthPx,
                    sharp: true,
                    sharpnessScore: cand.sharpnessScore,
                    frameIndex: cand.frameIndex,
                    embedding: cand.embedding,
                });
                continue;
            }

            // 3. Unmatched face quality gates: must be at least 80 px wide AND sharp before it counts as "unknown"
            if (cand.widthPx < minUnknownWidth) {
                results.push({
                    status: 'rejected',
                    name: 'ignored',
                    bestMatchName,
                    bestSimilarity,
                    runnerUpName,
                    runnerUpSimilarity,
                    widthPx: cand.widthPx,
                    sharp: effectiveSharp,
                    sharpnessScore: cand.sharpnessScore,
                    frameIndex: cand.frameIndex,
                    embedding: cand.embedding,
                    rejectReason: `unmatched face ${cand.widthPx}px < ${minUnknownWidth}px unknown gate`,
                });
                continue;
            }

            if (!effectiveSharp) {
                results.push({
                    status: 'rejected',
                    name: 'ignored',
                    bestMatchName,
                    bestSimilarity,
                    runnerUpName,
                    runnerUpSimilarity,
                    widthPx: cand.widthPx,
                    sharp: false,
                    sharpnessScore: cand.sharpnessScore,
                    frameIndex: cand.frameIndex,
                    embedding: cand.embedding,
                    rejectReason: `unmatched face blurry (sharpness ${cand.sharpnessScore})`,
                });
                continue;
            }

            results.push({
                status: 'unknown',
                name: 'unknown',
                bestMatchName,
                bestSimilarity,
                runnerUpName,
                runnerUpSimilarity,
                widthPx: cand.widthPx,
                sharp: true,
                sharpnessScore: cand.sharpnessScore,
                frameIndex: cand.frameIndex,
                embedding: cand.embedding,
            });
        }

        return results;
    }

    /** Schedules a ~3s confirmation re-check if there are pending multi-frame face confirmations within the 30s window. */
    scheduleConfirmationRecheckIfNeeded() {
        if (this.recheckTimer)
            return;
        const now = Date.now();
        const windowMs = this.provider.confirmationWindowMs(); // 30s
        let hasActivePending = false;
        for (const [k, p] of this.pendingConfirmations.entries()) {
            if (now - p.firstSeen > windowMs) {
                this.pendingConfirmations.delete(k);
                continue;
            }
            if (p.framesSeen < p.requiredFrames)
                hasActivePending = true;
        }
        if (!hasActivePending)
            return;

        this.recheckTimer = setTimeout(() => {
            this.recheckTimer = undefined;
            this.analyze(false, undefined, true).catch(e => this.console.error('confirmation re-check failed', e));
        }, 3000);
    }

    async analyze(force: boolean, triggerHint?: DetectorHint, isConfirmationRecheck = false) {
        const s = this.storageSettings.values;
        if (!s.enabled && !force)
            return;
        if (this.busy)
            return;

        const now = Date.now();
        if (!force && !isConfirmationRecheck && now - this.lastRun < Number(s.cooldownSeconds ?? 30) * 1000)
            return;

        const { chain, problems } = this.provider.getProviderChain();
        for (const p of problems)
            this.console.warn(`Skipping provider - ${p}`);
        if (!chain.length) {
            this.console.error('No usable AI provider. Fill in the provider settings on the AI Vision Alerts plugin page.');
            return;
        }

        this.busy = true;
        if (!isConfirmationRecheck)
            this.lastRun = now;

        try {
            const cameraName = systemManager.getDeviceById(this.id)?.name ?? 'Camera';
            // During a 3-second confirmation re-check, sample 1 quick frame to confirm the face fast and save tokens
            const count = isConfirmationRecheck
                ? 1
                : Math.min(8, Math.max(1, Math.round(Number(s.frameCount ?? 3))));
            const interval = Math.min(10, Math.max(1, Math.round(Number(s.frameIntervalSeconds ?? 2))));

            const activeHint =
                triggerHint ??
                (this.pendingHint && Date.now() - this.pendingHint.timestamp < 15000 ? this.pendingHint : undefined);
            this.pendingHint = undefined;

            const cameraJpegs = await this.captureFrames(count, interval, activeHint?.detectionId);

            // Stage 1: Analyze scene & locate faces
            const started = Date.now();
            const stage1Req: ModelRequest = {
                system: DEFAULT_SYSTEM_PROMPT,
                prompt: buildPrompt(
                    cameraName,
                    s.rules || DEFAULT_RULES,
                    cameraJpegs.length,
                    interval,
                    String(s.saveEvidence ?? '').startsWith('Let the AI')
                        ? s.evidenceRules || DEFAULT_EVIDENCE_RULES
                        : undefined,
                    activeHint,
                ),
                jpegs: cameraJpegs,
                maxTokens: 350,
                timeoutMs: this.provider.timeoutMs(),
            };

            const { text, used } = await this.runWithProviderChain(chain, stage1Req);
            const stage1 = parseStage1(text, cameraJpegs, activeHint?.objects ?? []);

            // Combine upstream Scrypted detector face candidates with AI-located face boxes
            const allCandidates: DetectedFaceCandidate[] = [...(activeHint?.faces ?? []), ...stage1.aiFaces];
            const evaluatedFaces = await this.evaluateFaces(allCandidates, cameraJpegs, chain);

            // Process multi-frame confirmations (2 frames in 30s for known, 3 frames in 30s for stranger)
            const windowMs = this.provider.confirmationWindowMs(); // 30s
            const knownReqFrames = this.provider.knownConfirmFrames(); // default 2
            const strangerReqFrames = this.provider.strangerConfirmFrames(); // default 3
            const knownCooldownMs = this.provider.knownCooldownMs(); // default 2 min
            const strangerCooldownMs = this.provider.strangerCooldownMs(); // default 15 min

            // Prune expired pending confirmations (> 30s old)
            for (const [k, p] of this.pendingConfirmations.entries()) {
                if (now - p.firstSeen > windowMs)
                    this.pendingConfirmations.delete(k);
            }

            // Deduplicate evaluations per frame so 1 frame = at most +1 confirmation count per person/stranger
            const seenInFramesByKey = new Map<string, { evalFace: EvaluatedFace; frames: Set<number>; cluster?: StrangerCluster }>();

            for (const ef of evaluatedFaces) {
                if (ef.status === 'known') {
                    const key = `known:${ef.name.toLowerCase()}`;
                    const existing = seenInFramesByKey.get(key);
                    if (existing) {
                        existing.frames.add(ef.frameIndex);
                        if (ef.bestSimilarity > existing.evalFace.bestSimilarity)
                            existing.evalFace = ef;
                    } else {
                        seenInFramesByKey.set(key, { evalFace: ef, frames: new Set([ef.frameIndex]) });
                    }
                } else if (ef.status === 'unknown') {
                    // Group the same stranger across frames into one cluster
                    const cluster = this.matchOrCreateStrangerCluster(ef.embedding);
                    const key = `stranger:${cluster.id}`;
                    const existing = seenInFramesByKey.get(key);
                    if (existing) {
                        existing.frames.add(ef.frameIndex);
                        if (ef.widthPx > existing.evalFace.widthPx)
                            existing.evalFace = ef;
                    } else {
                        seenInFramesByKey.set(key, { evalFace: ef, frames: new Set([ef.frameIndex]), cluster });
                    }
                } else {
                    // Record rejected / ambiguous faces in the Recent recognitions panel for tuning!
                    this.provider.recordRecognition(cameraName, ef, 0, 0, ef.rejectReason ?? ef.status);
                }
            }

            const confirmedKnownNames: string[] = [];
            const newlyConfirmedKnown: PendingConfirmation[] = [];
            const newlyConfirmedStrangers: { pending: PendingConfirmation; cluster: StrangerCluster }[] = [];

            for (const [key, item] of seenInFramesByKey.entries()) {
                const { evalFace, frames, cluster } = item;
                const isStranger = evalFace.status === 'unknown';
                const reqFrames = isStranger ? strangerReqFrames : knownReqFrames;
                const frameDelta = frames.size;
                const bestJpeg = cameraJpegs[evalFace.frameIndex] ?? cameraJpegs[stage1.bestFrameIndex] ?? cameraJpegs[0];

                let pending = this.pendingConfirmations.get(key);
                if (!pending || now - pending.firstSeen > windowMs) {
                    pending = {
                        key,
                        isStranger,
                        displayName: isStranger ? `unknown (stranger #${cluster!.id})` : evalFace.name,
                        framesSeen: frameDelta,
                        requiredFrames: reqFrames,
                        firstSeen: now,
                        lastSeen: now,
                        bestSimilarity: evalFace.bestSimilarity,
                        closestName: evalFace.bestMatchName,
                        widthPx: evalFace.widthPx,
                        bestJpeg,
                        summary: stage1.summary,
                        severity: stage1.severity,
                        objects: stage1.objects,
                        save: stage1.save,
                        embedding: evalFace.embedding,
                    };
                    this.pendingConfirmations.set(key, pending);
                } else {
                    pending.framesSeen += frameDelta;
                    pending.lastSeen = now;
                    if (evalFace.bestSimilarity > pending.bestSimilarity) {
                        pending.bestSimilarity = evalFace.bestSimilarity;
                        pending.closestName = evalFace.bestMatchName;
                    }
                    if (evalFace.widthPx > pending.widthPx) {
                        pending.widthPx = evalFace.widthPx;
                        pending.bestJpeg = bestJpeg;
                    }
                }

                if (cluster)
                    cluster.framesSeen = pending.framesSeen;

                const isConfirmed = pending.framesSeen >= pending.requiredFrames;
                let note = `confirming ${Math.min(pending.framesSeen, pending.requiredFrames)}/${pending.requiredFrames}`;

                if (isConfirmed) {
                    this.pendingConfirmations.delete(key);
                    if (isStranger && cluster) {
                        if (!force && cluster.lastAlerted > 0 && now - cluster.lastAlerted < strangerCooldownMs) {
                            const minsLeft = Math.ceil((strangerCooldownMs - (now - cluster.lastAlerted)) / 60000);
                            note = `confirmed (${minsLeft}m stranger cooldown active)`;
                        } else {
                            cluster.lastAlerted = now;
                            newlyConfirmedStrangers.push({ pending, cluster });
                            note = `confirmed ${pending.requiredFrames}/${pending.requiredFrames} (stranger #${cluster.id} alert)`;
                        }
                    } else {
                        confirmedKnownNames.push(evalFace.name);
                        const lastAlert = this.knownLastAlerted.get(evalFace.name.toLowerCase()) ?? 0;
                        if (this.provider.isNameSuppressed(evalFace.name)) {
                            note = `confirmed ${pending.requiredFrames}/${pending.requiredFrames} (muted by Never notify list)`;
                        } else if (!force && lastAlert > 0 && now - lastAlert < knownCooldownMs) {
                            const secsLeft = Math.ceil((knownCooldownMs - (now - lastAlert)) / 1000);
                            note = `confirmed (${secsLeft}s cooldown active)`;
                        } else {
                            this.knownLastAlerted.set(evalFace.name.toLowerCase(), now);
                            newlyConfirmedKnown.push(pending);
                            note = `confirmed ${pending.requiredFrames}/${pending.requiredFrames} (${evalFace.name} arrived)`;
                        }
                    }
                }

                this.provider.recordRecognition(
                    cameraName,
                    evalFace,
                    pending.framesSeen,
                    pending.requiredFrames,
                    note,
                );
            }

            // If any faces are still waiting for confirmation within the 30s window, schedule a 3s re-check
            this.scheduleConfirmationRecheckIfNeeded();

            const verdict: Verdict = {
                alert: stage1.alert,
                severity: stage1.severity,
                summary: stage1.summary,
                save: stage1.save,
                objects: stage1.objects,
                faces: confirmedKnownNames,
                evaluatedFaces,
                bestFrameIndex: stage1.bestFrameIndex,
            };

            const bestFrame = cameraJpegs[verdict.bestFrameIndex] ?? cameraJpegs[Math.floor(cameraJpegs.length / 2)];

            this.console.log(
                `${used} analyzed ${cameraJpegs.length} frame(s)${isConfirmationRecheck ? ' [re-check]' : ''} in ${Date.now() - started}ms:`,
                JSON.stringify({
                    alert: verdict.alert,
                    severity: verdict.severity,
                    summary: verdict.summary,
                    objects: verdict.objects,
                    confirmedFaces: verdict.faces,
                    facesEvaluated: evaluatedFaces.map(f => ({
                        status: f.status,
                        name: f.name,
                        sim: f.bestSimilarity,
                        closest: f.bestMatchName,
                        px: f.widthPx,
                        sharp: f.sharp,
                    })),
                }),
            );

            await this.emitDetections(verdict, bestFrame);

            // 1. Send "<Name> arrived" notifications for newly confirmed known people (not on the Never Notify list)
            for (const known of newlyConfirmedKnown) {
                await this.sendArrivalOrFaceAlert(
                    `${cameraName}: ${known.displayName} arrived`,
                    `${known.displayName} recognized at ${cameraName}. ${known.summary}`,
                    'low',
                    known.bestJpeg,
                    ['person', 'face'],
                    [known.displayName],
                    'none',
                    `ai-arrival-${this.id}-${known.displayName.toLowerCase()}`,
                );
            }

            // 2. Send confirmed Stranger alerts (seen in 3 frames within 30s, >= 80px wide & sharp, 15m cooldown)
            const faceMode = String(s.faceAlertMode ?? FACE_ALERT_MODES[0]);
            if (faceMode !== 'Only alert when a known face is recognized') {
                for (const { pending, cluster } of newlyConfirmedStrangers) {
                    const closestInfo = pending.closestName
                        ? ` (similarity ${pending.bestSimilarity.toFixed(2)}, closest ${pending.closestName})`
                        : '';
                    await this.sendArrivalOrFaceAlert(
                        `${cameraName}: Unrecognized person`,
                        `${pending.summary} [Confirmed in ${pending.framesSeen} frames, ${pending.widthPx}px${closestInfo}]`,
                        pending.severity,
                        pending.bestJpeg,
                        pending.objects,
                        ['unknown'],
                        pending.save,
                        `ai-stranger-${this.id}-${cluster.id}`,
                    );
                }
            }

            // If this run was solely a 3s face confirmation re-check or we already sent a face/stranger alert, skip duplicate scene alert
            if (isConfirmationRecheck || newlyConfirmedKnown.length > 0 || newlyConfirmedStrangers.length > 0)
                return;

            // If a face is currently mid-confirmation (e.g. 1/2 known or 1/3 stranger), wait for the 3s re-check before firing a person alert!
            if (!force && this.pendingConfirmations.size > 0) {
                this.console.log(
                    `Holding alert while confirming face across frames (${Array.from(this.pendingConfirmations.values())
                        .map(p => `${p.displayName} ${p.framesSeen}/${p.requiredFrames}`)
                        .join(', ')})...`,
                );
                return;
            }

            // If all detected people in this scene are on the "Never notify for these names" list (or suppressed household members), skip scene alert
            if (!force && confirmedKnownNames.length > 0) {
                const allMuted = confirmedKnownNames.every(n => this.provider.isNameSuppressed(n));
                if (allMuted || faceMode === 'Suppress security alerts when only known faces are seen') {
                    this.console.log(`Alert suppressed for known household member(s): ${confirmedKnownNames.join(', ')}`);
                    return;
                }
            }

            if (!force && faceMode === 'Only alert when a known face is recognized' && confirmedKnownNames.length === 0)
                return;

            // If a person was seen and already alerted inside theirknown/stranger cooldown window, do not re-announce
            if (!force && evaluatedFaces.some(f => f.status === 'known' || f.status === 'unknown'))
                return;

            const order = ['low', 'medium', 'high'];
            const meetsSeverity = order.indexOf(verdict.severity) >= order.indexOf(s.minSeverity || 'low');
            if (!force && !(verdict.alert && meetsSeverity))
                return;

            // Object filter check
            const requiredObjects = asList(s.objectFilter).map(x => x.toLowerCase());
            if (!force && requiredObjects.length > 0) {
                const hasRequired = requiredObjects.some(reqObj => verdict.objects.includes(reqObj));
                if (!hasRequired) {
                    this.console.log(
                        `Alert skipped: detected objects [${verdict.objects.join(', ')}] did not match filter [${requiredObjects.join(', ')}].`,
                    );
                    return;
                }
            }

            const choice = String(s.saveEvidence ?? 'Off');
            let plan: SavePlan = 'none';
            if (choice === 'Snapshot') plan = 'snapshot';
            else if (choice === 'Clip') plan = 'clip';
            else if (choice === 'Snapshot + clip') plan = 'both';
            else if (choice.startsWith('Let the AI')) plan = verdict.save;

            const metaTags: string[] = [];
            if (verdict.faces.length)
                metaTags.push(`Recognized: ${verdict.faces.join(', ')}`);
            const notableObjects = verdict.objects.filter(o => OBJECT_FILTER_CHOICES.includes(o) && o !== 'face');
            if (notableObjects.length)
                metaTags.push(`Objects: ${notableObjects.join(', ')}`);
            const enrichedMessage = metaTags.length
                ? `${verdict.summary} [${metaTags.join(' | ')}]`
                : verdict.summary;

            await this.sendArrivalOrFaceAlert(
                `${cameraName}: ${verdict.severity.toUpperCase()}`,
                enrichedMessage,
                verdict.severity,
                bestFrame,
                verdict.objects,
                verdict.faces,
                plan,
                `ai-alert-${this.id}`,
            );
        } catch (e) {
            this.console.error('AI analysis failed', e);
        } finally {
            this.busy = false;
        }
    }

    async sendArrivalOrFaceAlert(
        title: string,
        message: string,
        severity: Severity,
        frameJpeg: Buffer,
        objects: string[],
        faces: string[],
        plan: SavePlan,
        tag: string,
    ) {
        const s = this.storageSettings.values;
        const cameraName = systemManager.getDeviceById(this.id)?.name ?? 'Camera';
        const needsFrame = plan === 'snapshot' || plan === 'both';
        const media =
            s.attachSnapshot || needsFrame
                ? await mediaManager.createMediaObject(frameJpeg, 'image/jpeg')
                : undefined;

        const alert = await this.provider.sendAlert({
            title,
            message,
            severity,
            channels: asList(s.channels),
            jpeg: s.attachSnapshot ? frameJpeg : undefined,
            haCameraEntity: String(s.haCameraEntity ?? '').trim() || undefined,
            tag,
            objects,
            faces,
        });
        if (alert.sent.length)
            this.console.log(`Alert sent (${title}) via: ${alert.sent.join(', ')}`);
        for (const e of alert.errors)
            this.console.error(`Notification failed - ${e}`);
        if (!alert.configured)
            this.console.warn('No phone/app notification channel is configured on the AI Vision Alerts plugin page.');

        const notifierIds: string[] = Array.isArray(s.notifiers) ? s.notifiers : s.notifiers ? [s.notifiers] : [];
        for (const id of notifierIds) {
            const notifier = systemManager.getDeviceById<Notifier>(id);
            if (!notifier)
                continue;
            try {
                await notifier.sendNotification(
                    title,
                    {
                        body: message,
                        tag: 'ai-vision-alerts',
                        data: {
                            source: 'ai-vision-alerts',
                            cameraId: this.id,
                            cameraName,
                            severity,
                            summary: message,
                            objects,
                            faces,
                            save: plan,
                        },
                    },
                    media,
                );
            } catch (e) {
                this.console.error(`Notification to ${id} failed`, e);
            }
        }
    }
}

/* ------------------------------------------------------------------ */
/* Plugin (provider settings + face recognition + recent recognitions)  */
/* ------------------------------------------------------------------ */

export default class AIAlertsPlugin extends ScryptedDeviceBase implements MixinProvider, Settings {
    callsToday = 0;
    callsDay = new Date().toDateString();
    faceCacheKey = '';
    faceCache: FaceReference[] = [];
    recentLines: string[] = [];

    storageSettings = new StorageSettings(this, {
        /* ---------------- AI provider selection ---------------- */
        aiProvider: {
            group: 'AI provider',
            title: 'AI provider',
            description: 'The service that analyzes frames. Fill in that provider\'s section below.',
            type: 'string',
            choices: PROVIDER_CHOICES,
            defaultValue: PROVIDER_CHOICES[0],
        },
        fallbackProvider: {
            group: 'AI provider',
            title: 'Fallback provider (optional)',
            description: 'Used if the main provider fails or times out, e.g. local Ollama first, then a cloud model.',
            type: 'string',
            choices: ['None', ...PROVIDER_CHOICES],
            defaultValue: 'None',
        },
        timeoutSeconds: {
            group: 'AI provider',
            title: 'Request timeout (seconds)',
            description: 'Local models on CPU can be slow, so raise this for Ollama.',
            type: 'number',
            defaultValue: 60,
        },
        dailyLimit: {
            group: 'AI provider',
            title: 'Daily AI call limit (cloud providers only, 0 = unlimited)',
            description:
                'Optional safety cap for paid cloud providers. Local Ollama and LAN endpoints are ALWAYS unlimited and ignore this setting. Set to 0 for unlimited.',
            type: 'number',
            defaultValue: 0,
        },
        resetDailyQuota: {
            group: 'AI provider',
            title: 'Reset daily call counter',
            description: 'Resets today\'s cloud API call counter to 0 without restarting Scrypted.',
            type: 'button',
            onPut: async () => {
                this.callsToday = 0;
                this.callsDay = new Date().toDateString();
                this.console.log('Daily AI call counter reset to 0.');
            },
        },
        testProvider: {
            group: 'AI provider',
            title: 'Test provider connection',
            description:
                'Sends a text-only request to the main (and fallback) provider and logs the result in this plugin\'s ' +
                'console. Checks URL, key and model, but not image support.',
            type: 'button',
            onPut: async () => {
                const { chain, problems } = this.getProviderChain();
                for (const p of problems)
                    this.console.warn(`Not testing - ${p}`);
                for (const cfg of chain) {
                    try {
                        const text = await callModel(cfg, {
                            system: 'You reply with JSON only.',
                            prompt: 'Reply with exactly: {"alert": false, "severity": "low", "summary": "ok", "objects": [], "detectedFaces": [], "bestFrame": 1}',
                            jpegs: [],
                            maxTokens: 60,
                            timeoutMs: this.timeoutMs(),
                        });
                        this.console.log(`${cfg.provider} test OK:`, text);
                    } catch (e) {
                        this.console.error(`${cfg.provider} test failed:`, errMsg(e));
                    }
                }
            },
        },

        /* ---------------- Face & Object Recognition ---------------- */
        enableFaceRecognition: {
            group: 'Face & Object Recognition',
            title: 'Enable AI face recognition',
            description:
                'Enables quality gates, similarity scoring, multi-frame confirmation, and "<Name> arrived" / stranger alerts.',
            type: 'boolean',
            defaultValue: true,
        },
        knownFacesDir: {
            group: 'Face & Object Recognition',
            title: 'Known faces directory (optional)',
            description:
                'Folder path containing reference photos (.jpg, .png, .webp). On Home Assistant OS add-on, use /media/faces (mapped to HA\'s Media folder). ' +
                'Name files after the person (e.g. Alex.jpg, Alex_2.jpg) or place them in subfolders (e.g. /media/faces/Alex/1.jpg).',
            placeholder: '/media/faces',
        },
        knownFacesEntries: {
            group: 'Face & Object Recognition',
            title: 'Known faces list (optional)',
            description:
                'One person per line as "Name = <file path, http(s) URL, or data:image/... URI>". ' +
                'Example for Home Assistant add-on: Alex = /media/faces/Alex.jpg',
            type: 'textarea',
            placeholder: 'Alex = /media/faces/Alex.jpg\nBob = /media/faces/Bob.jpg',
        },
        neverNotifyNames: {
            group: 'Face & Object Recognition',
            title: 'Never notify for these names',
            description:
                'Comma-separated names to silence (e.g. "Sam, Taylor" or add "family" to silence all enrolled household members). ' +
                'Enrolled people NOT listed here trigger "<Name> arrived" alerts next to your normal alerts.',
            placeholder: 'family',
            defaultValue: '',
        },
        matchThreshold: {
            group: 'Face & Object Recognition',
            title: 'Match threshold (0.1 - 0.95)',
            description:
                'Minimum similarity score (default 0.5) required to recognize a known person. Use the "Recent recognitions" panel below to tune.',
            type: 'number',
            defaultValue: 0.5,
        },
        lookAlikeMargin: {
            group: 'Face & Object Recognition',
            title: 'Look-alike margin (0.0 - 0.3)',
            description:
                'How much higher the best match similarity must be over the second-closest person (default 0.06) to prevent look-alike mixups.',
            type: 'number',
            defaultValue: 0.06,
        },
        minFaceWidthPx: {
            group: 'Face & Object Recognition',
            title: 'Minimum face width for known matches (px)',
            description: 'Faces narrower than this (default 64 px) are ignored completely.',
            type: 'number',
            defaultValue: 64,
        },
        minUnknownFaceWidthPx: {
            group: 'Face & Object Recognition',
            title: 'Minimum face width for unknown strangers (px)',
            description:
                'Quality gate: a face that matches nobody must be at least this wide (default 80 px) and sharp before it counts as "unknown".',
            type: 'number',
            defaultValue: 80,
        },
        knownConfirmFrames: {
            group: 'Face & Object Recognition',
            title: 'Confirmation frames for known person (within 30s)',
            description: 'A known person must be seen in this many frames within 30 seconds before "<Name> arrived" fires (default 2).',
            type: 'number',
            defaultValue: 2,
        },
        strangerConfirmFrames: {
            group: 'Face & Object Recognition',
            title: 'Confirmation frames for stranger (within 30s)',
            description:
                'A stranger must be seen sharp and >= 80 px in this many frames within 30 seconds before an alert fires (default 3). Re-checks every ~3s while waiting.',
            type: 'number',
            defaultValue: 3,
        },
        knownCooldownMinutes: {
            group: 'Face & Object Recognition',
            title: 'Known person cooldown (minutes)',
            description: 'A confirmed known person will not re-alert for this many minutes (default 2).',
            type: 'number',
            defaultValue: 2,
        },
        strangerCooldownMinutes: {
            group: 'Face & Object Recognition',
            title: 'Stranger cooldown (minutes)',
            description: 'The same stranger is grouped across frames and will not re-alert for this many minutes (default 15).',
            type: 'number',
            defaultValue: 15,
        },
        maxFaceReferences: {
            group: 'Face & Object Recognition',
            title: 'Max reference face photos per AI call',
            description: 'Caps how many reference photos are sent when scoring a face.',
            type: 'number',
            defaultValue: 6,
        },
        testKnownFaces: {
            group: 'Face & Object Recognition',
            title: 'Load & verify enrolled faces',
            description: 'Reloads reference face photos from the directory and list above and logs the results in the console.',
            type: 'button',
            onPut: async () => {
                this.faceCacheKey = '';
                const refs = await this.getKnownFaces(true);
                if (!refs.length) {
                    this.console.warn(
                        'No reference face photos loaded. Set "Known faces directory" (e.g. /media/faces) or "Known faces list" above.',
                    );
                    return;
                }
                const byPerson = new Map<string, number>();
                for (const r of refs)
                    byPerson.set(r.name, (byPerson.get(r.name) ?? 0) + 1);
                const summary = Array.from(byPerson.entries())
                    .map(([name, cnt]) => `${name} (${cnt} photo${cnt > 1 ? 's' : ''})`)
                    .join(', ');
                this.console.log(`Loaded ${refs.length} reference face photo(s): ${summary}`);
            },
        },

        /* ---------------- Recent recognitions panel ---------------- */
        recentRecognitions: {
            group: 'Recent recognitions',
            title: 'Recent face recognitions & similarity scores',
            description:
                'Shows each recent face with its real similarity score, closest match, runner-up, pixel width, sharpness, and confirmation state ' +
                '(e.g. "unknown (similarity 0.42, closest Alex, 88px, sharp)"). Use this data to tune your thresholds.',
            type: 'textarea',
            readonly: true,
            defaultValue: 'No face recognitions recorded yet.',
        },
        clearRecentRecognitions: {
            group: 'Recent recognitions',
            title: 'Clear recent recognitions',
            type: 'button',
            onPut: async () => {
                this.recentLines = [];
                await this.storageSettings.putSetting('recentRecognitions', 'No face recognitions recorded yet.');
                this.console.log('Cleared recent recognitions history.');
            },
        },

        /* ---------------- Per-provider settings ---------------- */
        anthropicKey: { group: 'Anthropic (Claude)', title: 'API key', type: 'password' },
        anthropicModel: {
            group: 'Anthropic (Claude)',
            title: 'Model (optional)',
            description: 'Blank uses claude-haiku-4-5.',
            placeholder: 'claude-haiku-4-5',
        },

        openaiKey: { group: 'OpenAI', title: 'API key', type: 'password' },
        openaiModel: {
            group: 'OpenAI',
            title: 'Model (optional)',
            description: 'Must support image input. Blank uses gpt-4o-mini.',
            placeholder: 'gpt-4o-mini',
        },
        openaiBaseUrl: {
            group: 'OpenAI',
            title: 'Base URL (optional)',
            description: 'Blank uses https://api.openai.com/v1. Only change this to route through a proxy.',
        },

        geminiKey: { group: 'Google Gemini', title: 'API key', type: 'password' },
        geminiModel: {
            group: 'Google Gemini',
            title: 'Model (optional)',
            description: 'Blank uses gemini-2.5-flash.',
            placeholder: 'gemini-2.5-flash',
        },

        ollamaUrl: {
            group: 'Ollama (local)',
            title: 'Ollama URL',
            description:
                'e.g. http://192.168.100.20:11434. Use the LAN IP of the machine running Ollama, not localhost, ' +
                'and set OLLAMA_HOST=0.0.0.0 on that machine.',
            placeholder: 'http://192.168.100.20:11434',
        },
        ollamaModel: {
            group: 'Ollama (local)',
            title: 'Model (optional)',
            description: 'Must support images, e.g. llava, llama3.2-vision, qwen2.5vl, gemma3. Blank uses llava.',
            placeholder: 'llava',
        },
        ollamaKey: {
            group: 'Ollama (local)',
            title: 'API key (optional)',
            description: 'Only if your Ollama sits behind a proxy that needs a bearer token.',
            type: 'password',
        },

        customUrl: {
            group: 'Custom endpoint (OpenAI-compatible)',
            title: 'Base URL',
            description:
                'Any server with an OpenAI-style /chat/completions endpoint, including the /v1 part. ' +
                'Examples: LM Studio http://host:1234/v1, vLLM, LiteLLM, OpenRouter https://openrouter.ai/api/v1.',
        },
        customModel: {
            group: 'Custom endpoint (OpenAI-compatible)',
            title: 'Model',
            description: 'Required. The model must accept images.',
        },
        customKey: {
            group: 'Custom endpoint (OpenAI-compatible)',
            title: 'API key (optional)',
            type: 'password',
        },

        /* ---------------- Notification channels ---------------- */
        haUrl: {
            group: 'Notify: Home Assistant',
            title: 'Home Assistant URL',
            description: 'e.g. http://192.168.100.2:8123 (plain http is fine on your local network).',
            placeholder: 'http://192.168.100.2:8123',
        },
        haToken: {
            group: 'Notify: Home Assistant',
            title: 'Long-lived access token',
            description: 'Home Assistant > your profile > Security > Long-lived access tokens > Create token.',
            type: 'password',
        },
        haNotifyServices: {
            group: 'Notify: Home Assistant',
            title: 'Notify service(s)',
            description:
                'Comma-separated, without the "notify." prefix, e.g. mobile_app_pixel_9, mobile_app_iphone. ' +
                'Find yours in Home Assistant > Developer tools > Actions by searching "notify.mobile_app".',
        },

        ntfyUrl: {
            group: 'Notify: ntfy',
            title: 'Server URL',
            description: 'Blank uses https://ntfy.sh. Set this if you self-host ntfy (works fully locally).',
            placeholder: 'https://ntfy.sh',
        },
        ntfyTopic: {
            group: 'Notify: ntfy',
            title: 'Topic',
            description: 'Subscribe to the same topic in the ntfy phone app. Use a long, hard-to-guess name on ntfy.sh.',
        },
        ntfyToken: {
            group: 'Notify: ntfy',
            title: 'Access token (optional)',
            description: 'For protected topics on your own server.',
            type: 'password',
        },

        pushoverToken: {
            group: 'Notify: Pushover',
            title: 'Application token',
            description: 'Create an application at pushover.net/apps/build.',
            type: 'password',
        },
        pushoverUser: {
            group: 'Notify: Pushover',
            title: 'User key',
            description: 'Shown on your Pushover dashboard.',
            type: 'password',
        },
        pushoverDevice: {
            group: 'Notify: Pushover',
            title: 'Device name (optional)',
            description: 'Blank sends to all your devices.',
        },

        telegramToken: {
            group: 'Notify: Telegram',
            title: 'Bot token',
            description: 'Create a bot with @BotFather in Telegram.',
            type: 'password',
        },
        telegramChatId: {
            group: 'Notify: Telegram',
            title: 'Chat ID',
            description: 'Message your bot once, then find your chat ID (for example via @userinfobot).',
        },

        testNotifications: {
            group: 'Notify: test',
            title: 'Send test notification to all configured channels',
            description: 'Text only. Check this plugin\'s console for the result of each channel.',
            type: 'button',
            onPut: async () => {
                const result = await this.sendAlert({
                    title: 'AI Vision Alerts',
                    message: 'Test notification from Scrypted.',
                    severity: 'low',
                    channels: [],
                });
                if (!result.configured)
                    this.console.warn('No notification channel is configured yet.');
                if (result.sent.length)
                    this.console.log(`Test sent via: ${result.sent.join(', ')}`);
                for (const e of result.errors)
                    this.console.error(`Test failed - ${e}`);
            },
        },
    });

    /* ---------------- Settings plumbing ---------------- */

    getSettings(): Promise<Setting[]> {
        return this.storageSettings.getSettings();
    }

    async putSetting(key: string, value: SettingValue): Promise<void> {
        await this.storageSettings.putSetting(key, value);
        if (['enableFaceRecognition', 'knownFacesDir', 'knownFacesEntries', 'maxFaceReferences'].includes(key))
            this.faceCacheKey = '';
    }

    /* ---------------- Face recognition parameters & Recent Recognitions panel ---------------- */

    isFaceRecognitionEnabled(): boolean {
        return Boolean(this.storageSettings.values.enableFaceRecognition ?? true);
    }

    matchThreshold(): number {
        return Math.min(0.95, Math.max(0.1, Number(this.storageSettings.values.matchThreshold ?? 0.5)));
    }

    lookAlikeMargin(): number {
        return Math.min(0.3, Math.max(0, Number(this.storageSettings.values.lookAlikeMargin ?? 0.06)));
    }

    minFaceWidthPx(): number {
        return Math.max(24, Math.round(Number(this.storageSettings.values.minFaceWidthPx ?? 64)));
    }

    minUnknownFaceWidthPx(): number {
        return Math.max(this.minFaceWidthPx(), Math.round(Number(this.storageSettings.values.minUnknownFaceWidthPx ?? 80)));
    }

    knownConfirmFrames(): number {
        return Math.min(6, Math.max(1, Math.round(Number(this.storageSettings.values.knownConfirmFrames ?? 2))));
    }

    strangerConfirmFrames(): number {
        return Math.min(8, Math.max(1, Math.round(Number(this.storageSettings.values.strangerConfirmFrames ?? 3))));
    }

    confirmationWindowMs(): number {
        return 30 * 1000; // 30 seconds
    }

    knownCooldownMs(): number {
        return Math.max(0.5, Number(this.storageSettings.values.knownCooldownMinutes ?? 2)) * 60 * 1000;
    }

    strangerCooldownMs(): number {
        return Math.max(1, Number(this.storageSettings.values.strangerCooldownMinutes ?? 15)) * 60 * 1000;
    }

    /** Returns true if `personName` is listed in "Never notify for these names" (or if "family"/"all" is listed). */
    isNameSuppressed(personName: string): boolean {
        const raw = String(this.storageSettings.values.neverNotifyNames ?? '').trim();
        if (!raw)
            return false;
        const entries = raw
            .split(',')
            .map(s => s.trim().toLowerCase())
            .filter(Boolean);
        if (entries.includes('family') || entries.includes('all') || entries.includes('*'))
            return true;
        return entries.includes(personName.trim().toLowerCase());
    }

    /** Appends a formatted line to the "Recent recognitions" panel on the plugin settings page. */
    recordRecognition(
        cameraName: string,
        ef: EvaluatedFace,
        framesSeen: number,
        requiredFrames: number,
        statusNote: string,
    ) {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const ts = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        const simPart = ef.bestMatchName
            ? `similarity ${ef.bestSimilarity.toFixed(2)}, closest ${ef.bestMatchName}${
                  ef.runnerUpName ? `, 2nd ${ef.runnerUpName} ${ef.runnerUpSimilarity.toFixed(2)}` : ''
              }`
            : `similarity ${ef.bestSimilarity.toFixed(2)}`;
        const qualityPart = `${ef.widthPx}px, ${ef.sharp ? 'sharp' : 'blurry'}`;
        const label = ef.status === 'known' ? ef.name : ef.status === 'unknown' ? 'unknown' : ef.status;
        const line = `${ts} [${cameraName}] ${label} (${simPart}, ${qualityPart}) — ${statusNote}`;

        if (!this.recentLines.length) {
            const existing = String(this.storageSettings.values.recentRecognitions ?? '');
            if (existing && !existing.startsWith('No face recognitions'))
                this.recentLines = existing.split('\n').filter(Boolean);
        }
        this.recentLines.unshift(line);
        if (this.recentLines.length > 25)
            this.recentLines.length = 25;

        const text = this.recentLines.join('\n');
        this.storageSettings.putSetting('recentRecognitions', text).catch(() => {});
        this.console.log(`Face recognition: ${line}`);
    }

    /* ---------------- Known faces loading & caching ---------------- */

    async getKnownFaceNames(): Promise<string[]> {
        const refs = await this.getKnownFaces(false);
        return Array.from(new Set(refs.map(r => r.name)));
    }

    async getKnownFaces(forceReload = false): Promise<FaceReference[]> {
        const v = this.storageSettings.values;
        if (!v.enableFaceRecognition)
            return [];

        const dir = String(v.knownFacesDir ?? '').trim();
        const entriesText = String(v.knownFacesEntries ?? '').trim();
        const maxRefs = Math.min(20, Math.max(1, Math.round(Number(v.maxFaceReferences ?? 6))));
        const cacheKey = `${dir}|${entriesText}|${maxRefs}`;

        if (!forceReload && cacheKey === this.faceCacheKey)
            return this.faceCache;

        const loaded: FaceReference[] = [];
        const validExts = new Set(['.jpg', '.jpeg', '.png', '.webp']);
        let ffmpegPath: string | undefined;
        try {
            ffmpegPath = await mediaManager.getFFmpegPath();
        } catch {
            // optional
        }

        const buildRef = async (name: string, raw: Buffer, ext: string, source: string): Promise<FaceReference> => {
            const jpeg = await normalizeReferenceJpeg(raw, ext);
            let embedding: number[] | undefined;
            if (ffmpegPath) {
                const patch = await analyzeFacePatch(ffmpegPath, jpeg, [0.15, 0.1, 0.7, 0.8]);
                embedding = patch?.embedding;
            }
            return { name, jpeg, source, embedding };
        };

        // 1. Scan directory if configured
        if (dir) {
            try {
                const resolvedDir = path.resolve(dir);
                const dirEntries = await fs.readdir(resolvedDir, { withFileTypes: true });
                for (const entry of dirEntries) {
                    if (loaded.length >= maxRefs)
                        break;
                    const fullPath = path.join(resolvedDir, entry.name);
                    if (entry.isFile()) {
                        const ext = path.extname(entry.name).toLowerCase();
                        if (!validExts.has(ext))
                            continue;
                        const person = personNameFromFilename(entry.name);
                        if (!person)
                            continue;
                        try {
                            const raw = await fs.readFile(fullPath);
                            loaded.push(await buildRef(person, raw, ext, fullPath));
                        } catch (e) {
                            this.console.warn(`Could not load face image ${fullPath}: ${errMsg(e)}`);
                        }
                    } else if (entry.isDirectory()) {
                        const person = entry.name.trim();
                        if (!person || person.startsWith('.'))
                            continue;
                        try {
                            const subFiles = await fs.readdir(fullPath);
                            for (const sf of subFiles.sort()) {
                                if (loaded.length >= maxRefs)
                                    break;
                                const ext = path.extname(sf).toLowerCase();
                                if (!validExts.has(ext))
                                    continue;
                                const subPath = path.join(fullPath, sf);
                                try {
                                    const raw = await fs.readFile(subPath);
                                    loaded.push(await buildRef(person, raw, ext, subPath));
                                } catch (e) {
                                    this.console.warn(`Could not load face image ${subPath}: ${errMsg(e)}`);
                                }
                            }
                        } catch (e) {
                            this.console.warn(`Could not read face subfolder ${fullPath}: ${errMsg(e)}`);
                        }
                    }
                }
            } catch (e) {
                this.console.warn(`Could not read known faces directory "${dir}": ${errMsg(e)}`);
            }
        }

        // 2. Parse inline entries ("Name = URL / file path / data URI")
        if (entriesText && loaded.length < maxRefs) {
            const lines = entriesText.split(/\r?\n/);
            for (const line of lines) {
                if (loaded.length >= maxRefs)
                    break;
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#'))
                    continue;
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx <= 0) {
                    this.console.warn(`Skipping invalid known face entry (expected "Name = path or URL"): ${trimmed}`);
                    continue;
                }
                const name = trimmed.slice(0, eqIdx).trim();
                const target = trimmed.slice(eqIdx + 1).trim();
                if (!name || !target)
                    continue;
                try {
                    let raw: Buffer;
                    let ext = '.jpg';
                    if (target.startsWith('data:image/')) {
                        const comma = target.indexOf(',');
                        if (comma < 0)
                            throw new Error('Invalid data URI');
                        raw = Buffer.from(target.slice(comma + 1), 'base64');
                    } else if (/^https?:\/\//i.test(target)) {
                        const res = await fetch(target, { signal: AbortSignal.timeout(15000) });
                        if (!res.ok)
                            throw new Error(`HTTP ${res.status}`);
                        raw = Buffer.from(await res.arrayBuffer());
                        const urlPath = new URL(target).pathname;
                        ext = path.extname(urlPath).toLowerCase() || '.jpg';
                    } else {
                        const filePath = path.resolve(target);
                        ext = path.extname(filePath).toLowerCase() || '.jpg';
                        raw = await fs.readFile(filePath);
                    }
                    loaded.push(await buildRef(name, raw, ext, target));
                } catch (e) {
                    this.console.warn(`Could not load known face for "${name}" from "${target}": ${errMsg(e)}`);
                }
            }
        }

        this.faceCacheKey = cacheKey;
        this.faceCache = loaded;
        return loaded;
    }

    /* ---------------- AI providers ---------------- */

    getConfigFor(id: ProviderId): ProviderConfig {
        const v = this.storageSettings.values;
        switch (id) {
            case 'anthropic':
                return { provider: id, apiKey: v.anthropicKey, model: v.anthropicModel };
            case 'openai':
                return { provider: id, apiKey: v.openaiKey, model: v.openaiModel, baseUrl: v.openaiBaseUrl };
            case 'gemini':
                return { provider: id, apiKey: v.geminiKey, model: v.geminiModel };
            case 'ollama':
                return { provider: id, apiKey: v.ollamaKey, model: v.ollamaModel, baseUrl: v.ollamaUrl };
            case 'custom':
                return { provider: id, apiKey: v.customKey, model: v.customModel, baseUrl: v.customUrl };
        }
    }

    /** Main provider first, then the optional fallback. Unusable providers are reported in `problems`. */
    getProviderChain(): { chain: ProviderConfig[]; problems: string[] } {
        const v = this.storageSettings.values;
        const ids: ProviderId[] = [providerId(v.aiProvider)];
        if (v.fallbackProvider && v.fallbackProvider !== 'None') {
            const fallback = providerId(v.fallbackProvider);
            if (fallback !== ids[0])
                ids.push(fallback);
        }

        const chain: ProviderConfig[] = [];
        const problems: string[] = [];
        for (const id of ids) {
            const cfg = this.getConfigFor(id);
            const problem = validateConfig(cfg);
            if (problem)
                problems.push(`${id}: ${problem}`);
            else
                chain.push(cfg);
        }
        return { chain, problems };
    }

    timeoutMs(): number {
        return Math.max(5, Number(this.storageSettings.values.timeoutSeconds ?? 60)) * 1000;
    }

    tryConsumeQuota(cfg?: ProviderConfig): boolean {
        const targetCfg = cfg ?? this.getConfigFor(providerId(this.storageSettings.values.aiProvider));
        // Local Ollama (any model) and local LAN endpoints have no cloud billing quota—never block them
        if (isLocalProvider(targetCfg))
            return true;
        const limit = Number(this.storageSettings.values.dailyLimit ?? 0);
        if (limit <= 0)
            return true; // 0 = unlimited
        const today = new Date().toDateString();
        if (today !== this.callsDay) {
            this.callsDay = today;
            this.callsToday = 0;
        }
        if (this.callsToday >= limit)
            return false;
        this.callsToday++;
        return true;
    }

    /* ---------------- Notifications ---------------- */

    haConfigured(): boolean {
        const v = this.storageSettings.values;
        return !!(String(v.haUrl ?? '').trim() && String(v.haToken ?? '').trim() && String(v.haNotifyServices ?? '').trim());
    }

    ntfyConfigured(): boolean {
        return !!String(this.storageSettings.values.ntfyTopic ?? '').trim();
    }

    pushoverConfigured(): boolean {
        const v = this.storageSettings.values;
        return !!(String(v.pushoverToken ?? '').trim() && String(v.pushoverUser ?? '').trim());
    }

    telegramConfigured(): boolean {
        const v = this.storageSettings.values;
        return !!(String(v.telegramToken ?? '').trim() && String(v.telegramChatId ?? '').trim());
    }

    /** Sends to every selected channel that is configured (all of them if none are selected). */
    async sendAlert(req: AlertRequest): Promise<AlertResult> {
        const selected = req.channels.length ? req.channels : CHANNELS;
        const jobs: [string, () => Promise<unknown>][] = [];

        if (selected.includes('Home Assistant') && this.haConfigured())
            jobs.push([
                'Home Assistant',
                () =>
                    this.sendHomeAssistantNotification(
                        req.title,
                        req.message,
                        req.haCameraEntity,
                        req.tag,
                        req.objects,
                        req.faces,
                    ),
            ]);
        if (selected.includes('ntfy') && this.ntfyConfigured())
            jobs.push(['ntfy', () => this.sendNtfy(req)]);
        if (selected.includes('Pushover') && this.pushoverConfigured())
            jobs.push(['Pushover', () => this.sendPushover(req)]);
        if (selected.includes('Telegram') && this.telegramConfigured())
            jobs.push(['Telegram', () => this.sendTelegram(req)]);

        const result: AlertResult = { sent: [], errors: [], configured: jobs.length };
        await Promise.all(
            jobs.map(async ([name, job]) => {
                try {
                    await job();
                    result.sent.push(name);
                } catch (e) {
                    result.errors.push(`${name}: ${errMsg(e)}`);
                }
            }),
        );
        return result;
    }

    /** Pushes a notification through Home Assistant's notify service (phone Companion app). */
    async sendHomeAssistantNotification(
        title: string,
        message: string,
        cameraEntity?: string,
        tag?: string,
        objects?: string[],
        faces?: string[],
    ): Promise<boolean> {
        const v = this.storageSettings.values;
        const base = String(v.haUrl ?? '').trim().replace(/\/+$/, '');
        const token = String(v.haToken ?? '').trim();
        const services = String(v.haNotifyServices ?? '')
            .split(',')
            .map(x => x.trim().replace(/^notify\./, ''))
            .filter(Boolean);
        if (!base || !token || !services.length)
            return false;

        // Keys for both Android and iOS Companion apps; each app ignores the other's.
        const data: Record<string, unknown> = {
            channel: 'AI Vision Alerts',
            importance: 'high',
            priority: 'high',
            ttl: 0,
        };
        if (tag)
            data.tag = tag;
        if (objects?.length)
            data.objects = objects;
        if (faces?.length)
            data.faces = faces;
        if (cameraEntity) {
            data.image = `/api/camera_proxy/${cameraEntity}`; // Android
            data.entity_id = cameraEntity; // iOS
        }

        const errors: string[] = [];
        for (const service of services) {
            try {
                await postJson(
                    `${base}/api/services/notify/${service}`,
                    { authorization: `Bearer ${token}` },
                    { title, message, data },
                    15000,
                );
            } catch (e) {
                errors.push(`${service}: ${errMsg(e)}`);
            }
        }
        if (errors.length)
            throw new Error(errors.join('; '));
        return true;
    }

    async sendNtfy(req: AlertRequest): Promise<void> {
        const v = this.storageSettings.values;
        const base = String(v.ntfyUrl ?? '').trim().replace(/\/+$/, '') || 'https://ntfy.sh';
        const topic = String(v.ntfyTopic ?? '').trim();
        const priority = { low: 3, medium: 4, high: 5 }[req.severity];
        const auth: Record<string, string> = {};
        if (v.ntfyToken)
            auth.authorization = `Bearer ${String(v.ntfyToken).trim()}`;

        if (req.jpeg) {
            // Publishing a file: the message travels in headers.
            await fetchOk(`${base}/${encodeURIComponent(topic)}`, {
                method: 'PUT',
                headers: {
                    ...auth,
                    filename: 'frame.jpg',
                    title: mimeHeader(req.title),
                    message: mimeHeader(req.message),
                    priority: String(priority),
                    tags: 'rotating_light',
                },
                body: new Uint8Array(req.jpeg),
            });
        } else {
            await postJson(base, auth, { topic, title: req.title, message: req.message, priority, tags: ['rotating_light'] }, 15000);
        }
    }

    async sendPushover(req: AlertRequest): Promise<void> {
        const v = this.storageSettings.values;
        const form = new FormData();
        form.append('token', String(v.pushoverToken).trim());
        form.append('user', String(v.pushoverUser).trim());
        form.append('title', req.title);
        form.append('message', req.message);
        form.append('priority', String({ low: -1, medium: 0, high: 1 }[req.severity]));
        if (String(v.pushoverDevice ?? '').trim())
            form.append('device', String(v.pushoverDevice).trim());
        if (req.jpeg)
            form.append('attachment', new Blob([new Uint8Array(req.jpeg)], { type: 'image/jpeg' }), 'frame.jpg');
        await fetchOk('https://api.pushover.net/1/messages.json', { method: 'POST', body: form });
    }

    async sendTelegram(req: AlertRequest): Promise<void> {
        const v = this.storageSettings.values;
        const token = String(v.telegramToken).trim();
        const chatId = String(v.telegramChatId).trim();
        const silent = req.severity === 'low' ? 'true' : 'false';
        try {
            if (req.jpeg) {
                const form = new FormData();
                form.append('chat_id', chatId);
                form.append('caption', `${req.title}\n${req.message}`.slice(0, 1000));
                form.append('disable_notification', silent);
                form.append('photo', new Blob([new Uint8Array(req.jpeg)], { type: 'image/jpeg' }), 'frame.jpg');
                await fetchOk(`https://api.telegram.org/bot${token}/sendPhoto`, { method: 'POST', body: form });
            } else {
                await fetchOk(`https://api.telegram.org/bot${token}/sendMessage`, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `${req.title}\n${req.message}`,
                        disable_notification: silent === 'true',
                    }),
                });
            }
        } catch (e) {
            throw new Error(errMsg(e).split(token).join('***')); // never leak the bot token into logs
        }
    }

    /* ---------------- Mixin registration ---------------- */

    async canMixin(type: ScryptedDeviceType, interfaces: string[]): Promise<string[] | null | undefined | void> {
        if (type !== ScryptedDeviceType.Camera && type !== ScryptedDeviceType.Doorbell)
            return;
        if (
            !interfaces.includes(ScryptedInterface.VideoCamera) ||
            (!interfaces.includes(ScryptedInterface.MotionSensor) && !interfaces.includes(ScryptedInterface.ObjectDetector))
        )
            return;
        return [ScryptedInterface.Settings, ScryptedInterface.ObjectDetector];
    }

    async getMixin(
        mixinDevice: any,
        mixinDeviceInterfaces: ScryptedInterface[],
        mixinDeviceState: WritableDeviceState,
    ): Promise<any> {
        return new AIAlertsMixin(
            {
                mixinDevice,
                mixinDeviceInterfaces,
                mixinDeviceState,
                mixinProviderNativeId: this.nativeId,
                group: 'AI Vision Alerts',
                groupKey: 'ai-vision-alerts',
            },
            this,
        );
    }

    async releaseMixin(id: string, mixinDevice: any): Promise<void> {
        (mixinDevice as AIAlertsMixin).dispose();
    }
}
