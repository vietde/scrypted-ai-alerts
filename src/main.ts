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
/* AI providers (Universal: Claude, OpenAI, Gemini, Ollama, Custom)     */
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

/** Returns true if the provider is local Ollama or points to a local/LAN server (never subject to cloud billing quota). */
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

/** Returns true only for older single-image-only models (e.g. llava 1.5/1.6, bakllava, moondream). */
function isSingleImageOnlyModel(modelName: string): boolean {
    const m = modelName.toLowerCase();
    return m.includes('llava') || m.includes('bakllava') || m.includes('moondream');
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
    /** When true, enforces JSON output mode on providers like Gemini and Ollama (used for face similarity scoring). */
    jsonMode?: boolean;
    /** When true on single-image Ollama models, stitches reference faces + target face into 1 strip. */
    stitchForSingleImageModel?: boolean;
}

type SavePlan = 'none' | 'snapshot' | 'clip' | 'both';

/* ------------------------------------------------------------------ */
/* Date & Time formatting based on device / configured timezone         */
/* ------------------------------------------------------------------ */

function formatDeviceDateTime(date: Date, timeZone?: string): string {
    const tz = timeZone?.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
    try {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZoneName: 'short',
        }).format(date);
    } catch {
        return date.toLocaleString();
    }
}

function formatSafeFileTimestamp(date: Date, timeZone?: string): { dateFolder: string; fileStamp: string } {
    const tz = timeZone?.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
    try {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).formatToParts(date);
        const get = (t: string) => parts.find(p => p.type === t)?.value ?? '00';
        const dateFolder = `${get('year')}-${get('month')}-${get('day')}`;
        const fileStamp = `${dateFolder}_${get('hour')}-${get('minute')}-${get('second')}`;
        return { dateFolder, fileStamp };
    } catch {
        const iso = date.toISOString();
        return {
            dateFolder: iso.slice(0, 10),
            fileStamp: iso.slice(0, 19).replace(/[:T]/g, '-'),
        };
    }
}

/* ------------------------------------------------------------------ */
/* Object, Courier, License Plate & Face Recognition types              */
/* ------------------------------------------------------------------ */

const OBJECT_FILTER_CHOICES = ['person', 'face', 'vehicle', 'package', 'animal'];

const TRIGGER_CHOICES = [
    'Both Motion and Smart Object/Face Detection',
    'Motion sensor only',
    'Smart Object/Face Detection only',
];

const FACE_ALERT_MODES = [
    'Alert on both recognized faces and unrecognized faces',
    'Suppress alerts when only recognized known faces are seen',
    'Only alert when a recognized known face is seen',
    'Only alert when an unrecognized face/stranger is seen',
];

const DELIVERY_CARRIERS = ['Amazon', 'FedEx', 'UPS', 'USPS', 'DHL'];

export interface FaceReference {
    name: string;
    jpeg: Buffer;
    source: string;
    embedding?: number[];
    isLearned?: boolean;
}

export interface KnownPlateEntry {
    plate: string;
    normalizedKey: string;
    label: string;
    isLearned?: boolean;
    firstSeen?: string;
}

export interface EvaluatedPlate {
    plate: string;
    status: 'known' | 'learned' | 'new';
    label: string; // e.g. "Tai's Red Tesla" or "Red Tesla (learned)"
    vehicleDesc?: string;
    confidence: number;
    box?: [number, number, number, number];
    savedPath?: string;
}

/** Normalizes a license plate string to uppercase alphanumeric only. */
function cleanPlateString(raw: string): string {
    return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Maps OCR-confusable characters (0/O/Q/D, 1/I/L, 8/B, 5/S, 2/Z, 6/G) to a canonical skeleton for fuzzy plate matching. */
function canonicalPlateSkeleton(plate: string): string {
    return cleanPlateString(plate)
        .replace(/[OQD]/g, '0')
        .replace(/[IL]/g, '1')
        .replace(/B/g, '8')
        .replace(/S/g, '5')
        .replace(/Z/g, '2')
        .replace(/G/g, '6');
}

/** Returns similarity 0..1 between two license plate strings, accounting for OCR-confusable characters. */
function plateSimilarity(a: string, b: string): number {
    const ca = cleanPlateString(a);
    const cb = cleanPlateString(b);
    if (!ca || !cb)
        return 0;
    if (ca === cb)
        return 1.0;
    const sa = canonicalPlateSkeleton(ca);
    const sb = canonicalPlateSkeleton(cb);
    if (sa === sb)
        return 0.96;
    if (Math.abs(sa.length - sb.length) > 1)
        return 0;
    // Levenshtein distance on canonical skeleton
    const m = sa.length;
    const n = sb.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = sa[i - 1] === sb[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        }
    }
    const dist = dp[m][n];
    const maxLen = Math.max(m, n);
    return Math.max(0, 1 - dist / maxLen);
}

/** Returns true if a string looks like a real license plate number (3..8 chars, contains at least one digit, and is not a generic English word). */
function isValidPlateCandidate(raw: string): boolean {
    const cleaned = cleanPlateString(raw);
    if (cleaned.length < 3 || cleaned.length > 8)
        return false;
    // Standard vehicle license plates almost always contain at least one digit (0-9).
    // Requiring a digit prevents English words like "OFFOOD" (from "plate of food") or "PORCH" from being treated as license plates!
    if (!/\d/.test(cleaned))
        return false;
    const blockedWords = new Set([
        'NONE', 'UNKNOWN', 'NULL', 'VISIBLE', 'LICENSE', 'PLATE', 'TESLA', 'TOYOTA', 'HONDA', 'FORD',
        'CHEVY', 'BMW', 'MERCEDES', 'AUDI', 'SUBARU', 'NISSAN', 'HYUNDAI', 'KIA', 'AMAZON', 'FEDEX',
        'USPS', 'DHL', 'UPS', 'VEHICLE', 'SEDAN', 'TRUCK', 'SUV', 'VAN', 'CAR', 'BLURRY', 'UNREADABLE',
        'NOTVISIBLE', 'NA', 'YES', 'TRUE', 'FALSE', 'OFFOOD',
    ]);
    if (blockedWords.has(cleaned))
        return false;
    return true;
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
    box: [number, number, number, number];
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
    unknownFacesCount: number;
    evaluatedFaces: EvaluatedFace[];
    licensePlates: string[];
    evaluatedPlates: EvaluatedPlate[];
    vehicles: string[];
    deliveryCarrier?: string;
    carriedItems: string[];
    bestFrameIndex: number;
}

interface PendingConfirmation {
    key: string;
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
    faceBox: [number, number, number, number];
    summary: string;
    severity: 'low' | 'medium' | 'high';
    objects: string[];
    save: SavePlan;
    embedding?: number[];
}

interface StrangerCluster {
    id: number;
    learnedName?: string;
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
        const sharpnessScore = Math.round((variance / 12) * 10) / 10;

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

/** Crops a face from a full frame with 25% margin around the bounding box and saves as a clean JPEG for auto-learning. */
async function cropFaceJpeg(
    ffmpegPath: string,
    jpeg: Buffer,
    box: [number, number, number, number],
): Promise<Buffer> {
    const [imgW, imgH] = getJpegDimensions(jpeg);
    const padX = box[2] * 0.25;
    const padY = box[3] * 0.25;
    const nx = Math.max(0, box[0] - padX);
    const ny = Math.max(0, box[1] - padY);
    const nw = Math.min(1 - nx, box[2] + padX * 2);
    const nh = Math.min(1 - ny, box[3] + padY * 2);

    const x = Math.max(0, Math.min(imgW - 32, Math.round(nx * imgW)));
    const y = Math.max(0, Math.min(imgH - 32, Math.round(ny * imgH)));
    const w = Math.max(32, Math.min(imgW - x, Math.round(nw * imgW)));
    const h = Math.max(32, Math.min(imgH - y, Math.round(nh * imgH)));

    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-learn-'));
    try {
        const inFile = path.join(dir, 'in.jpg');
        const outFile = path.join(dir, 'crop.jpg');
        await fs.writeFile(inFile, jpeg);
        await new Promise<void>((resolve, reject) => {
            const p = spawn(
                ffmpegPath,
                [
                    '-nostdin',
                    '-hide_banner',
                    '-loglevel',
                    'error',
                    '-i',
                    inFile,
                    '-vf',
                    `crop=${w}:${h}:${x}:${y},scale=min(384\\,iw):-2`,
                    '-frames:v',
                    '1',
                    '-q:v',
                    '4',
                    outFile,
                ],
                { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true },
            );
            const timer = setTimeout(() => p.kill('SIGKILL'), 8000);
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
    } catch {
        return jpeg;
    } finally {
        await fs.rm(dir, { recursive: true, force: true });
    }
}

/** Maps raw object labels into both specific labels and canonical categories ('person', 'face', 'vehicle', 'package', 'animal'). */
function normalizeObjects(rawObjects: unknown[], hasFace = false): string[] {
    const out = new Set<string>();
    for (const item of rawObjects) {
        const s = String(item ?? '').trim().toLowerCase();
        if (!s || s === 'none' || s === 'motion' || s === 'unknown')
            continue;
        out.add(s);
        if (['person', 'people', 'human', 'pedestrian', 'man', 'woman', 'child', 'adult', 'delivery person', 'courier'].includes(s))
            out.add('person');
        if (['face', 'human face'].includes(s)) {
            out.add('face');
            out.add('person');
        }
        if (['vehicle', 'car', 'truck', 'van', 'suv', 'bus', 'motorcycle', 'motorbike', 'bicycle', 'bike', 'scooter', 'sedan', 'pickup'].includes(s))
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

interface FrameDiffResult {
    /** Percentage (0..100) of 32x32 spatial blocks that changed in luminance or RGB color */
    changedPercent: number;
    /** Largest contiguous 4-connected cluster of changed blocks (out of 1024 blocks) */
    largestClusterBlocks: number;
    /** True if changes are mostly tiny 1-2 block scattered speckles typical of rain, snow, or falling leaves */
    isScatteredWeatherNoise: boolean;
    /** True if there is a coherent localized change (including color change such as black car -> red car) */
    hasMeaningfulChange: boolean;
}

/**
 * Compares the previous baseline frame and current frame on a 32x32 RGB grid using Scrypted's ffmpeg.
 * Detects both structural/luminance movement AND color changes (e.g. a black car replaced by a red car),
 * while filtering out global illumination shifts and scattered rain/leaf/wind speckles.
 */
async function computeFrameChange(
    ffmpegPath: string,
    prevJpeg: Buffer,
    currJpeg: Buffer,
): Promise<FrameDiffResult | undefined> {
    const GRID = 32;
    const decodeRgbGrid = async (jpeg: Buffer): Promise<Uint8Array | undefined> => {
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-diff-'));
        try {
            const inFile = path.join(dir, 'in.jpg');
            await fs.writeFile(inFile, jpeg);
            const raw = await new Promise<Buffer>((resolve, reject) => {
                const chunks: Buffer[] = [];
                const p = spawn(
                    ffmpegPath,
                    [
                        '-nostdin',
                        '-hide_banner',
                        '-loglevel',
                        'error',
                        '-i',
                        inFile,
                        '-vf',
                        `scale=${GRID}:${GRID}`,
                        '-frames:v',
                        '1',
                        '-f',
                        'rawvideo',
                        '-pix_fmt',
                        'rgb24',
                        'pipe:1',
                    ],
                    { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true },
                );
                p.stdout.on('data', d => chunks.push(Buffer.from(d)));
                const timer = setTimeout(() => p.kill('SIGKILL'), 5000);
                p.on('error', e => {
                    clearTimeout(timer);
                    reject(e);
                });
                p.on('close', () => {
                    clearTimeout(timer);
                    resolve(Buffer.concat(chunks));
                });
            });
            if (raw.length < GRID * GRID * 3)
                return undefined;
            return new Uint8Array(raw.buffer, raw.byteOffset, GRID * GRID * 3);
        } catch {
            return undefined;
        } finally {
            await fs.rm(dir, { recursive: true, force: true });
        }
    };

    const [rgb1, rgb2] = await Promise.all([decodeRgbGrid(prevJpeg), decodeRgbGrid(currJpeg)]);
    if (!rgb1 || !rgb2)
        return undefined;

    const total = GRID * GRID;
    let sumLumDiff = 0;
    const lum1 = new Float32Array(total);
    const lum2 = new Float32Array(total);
    for (let i = 0; i < total; i++) {
        const idx = i * 3;
        lum1[i] = 0.299 * rgb1[idx] + 0.587 * rgb1[idx + 1] + 0.114 * rgb1[idx + 2];
        lum2[i] = 0.299 * rgb2[idx] + 0.587 * rgb2[idx + 1] + 0.114 * rgb2[idx + 2];
        sumLumDiff += lum2[i] - lum1[i];
    }
    const meanLumShift = sumLumDiff / total;

    // A block counts as changed if its illumination-compensated luminance changed >= 18 OR its RGB chroma changed >= 26
    // (catches a black car replaced by a red car or an object changing color/position)
    const mask = new Uint8Array(total);
    let changedCount = 0;
    for (let i = 0; i < total; i++) {
        const idx = i * 3;
        const lumDiff = Math.abs(lum2[i] - lum1[i] - meanLumShift);
        const rDiff = Math.abs(rgb2[idx] - rgb1[idx] - meanLumShift);
        const gDiff = Math.abs(rgb2[idx + 1] - rgb1[idx + 1] - meanLumShift);
        const bDiff = Math.abs(rgb2[idx + 2] - rgb1[idx + 2] - meanLumShift);
        const colorDiff = (rDiff + gDiff + bDiff) / 3;
        if (lumDiff >= 18 || colorDiff >= 24) {
            mask[i] = 1;
            changedCount++;
        }
    }

    const visited = new Uint8Array(total);
    let largestClusterBlocks = 0;
    let smallSpeckleBlocks = 0;
    const queue = new Int32Array(total);
    for (let i = 0; i < total; i++) {
        if (!mask[i] || visited[i])
            continue;
        visited[i] = 1;
        let head = 0;
        let tail = 0;
        queue[tail++] = i;
        let clusterSize = 0;
        while (head < tail) {
            const curr = queue[head++];
            clusterSize++;
            const r = Math.floor(curr / GRID);
            const c = curr % GRID;
            const neighbors = [
                r > 0 ? curr - GRID : -1,
                r < GRID - 1 ? curr + GRID : -1,
                c > 0 ? curr - 1 : -1,
                c < GRID - 1 ? curr + 1 : -1,
            ];
            for (const nb of neighbors) {
                if (nb >= 0 && mask[nb] && !visited[nb]) {
                    visited[nb] = 1;
                    queue[tail++] = nb;
                }
            }
        }
        if (clusterSize <= 2)
            smallSpeckleBlocks += clusterSize;
        if (clusterSize > largestClusterBlocks)
            largestClusterBlocks = clusterSize;
    }

    const changedPercent = Math.round((changedCount / total) * 1000) / 10;
    const isScatteredWeatherNoise =
        changedCount > 0 && largestClusterBlocks < 5 && smallSpeckleBlocks / changedCount >= 0.55;
    const hasMeaningfulChange = largestClusterBlocks >= 5 && changedPercent >= 1.8 && !isScatteredWeatherNoise;
    return {
        changedPercent,
        largestClusterBlocks,
        isScatteredWeatherNoise,
        hasMeaningfulChange,
    };
}

const LEGACY_BUILT_IN_PROMPTS = [
    'SYSTEM INSTRUCTION: You are a highly strict security analysis AI.',
    'Alert on any person near a door, window or garage, anyone carrying or taking a package, or anyone behaving suspiciously.',
    'Alert on any person, animal, package delivery, moving or changed vehicle, or any obvious change in the scene.',
];

function getCleanUserPrompt(rules?: string): string {
    const trimmed = (rules ?? '').trim();
    if (!trimmed)
        return '';
    for (const legacyPrefix of LEGACY_BUILT_IN_PROMPTS) {
        if (trimmed.startsWith(legacyPrefix))
            return '';
    }
    return trimmed;
}

const PLATE_OCR_SYSTEM_PROMPT =
    'You are a specialized Automatic License Plate Reader (ALPR / OCR). ' +
    'Examine all vehicles in the image closely and read the exact alphanumeric characters on any visible license plate. ' +
    'Only report a plate if you can actually read the letters/numbers on the plate (do not guess or invent characters). ' +
    'Reply with ONLY a JSON object, no markdown: ' +
    '{"plates": [{"plate": "exact uppercase characters", "vehicle": "color make/type", "box": [x, y, width, height], "confidence": 0.95}]}. ' +
    'If no license plate characters are readable, reply with: {"plates": []}.';

const FACE_SIMILARITY_SYSTEM_PROMPT =
    'You are a precise facial recognition scoring model. ' +
    'You receive labeled reference face photos of known people followed by 1 target camera image containing a face. ' +
    'For EACH enrolled person name, estimate a visual facial similarity score between 0.00 and 1.00 comparing the target face in the last image against that person\'s reference photo(s): ' +
    '- 0.75 to 1.00: Unmistakably the same person (clear match of facial structure, eyes, nose, hair/features).\n' +
    '- 0.50 to 0.74: Likely match, strong resemblance.\n' +
    '- 0.25 to 0.49: Different person with some superficial similarity.\n' +
    '- 0.00 to 0.24: Clearly a different person.\n' +
    'Also set "sharp": true only if the target face in the last image has clear, non-blurry facial features. ' +
    'Reply with ONLY a JSON object, no markdown: {"scores": {"<Name>": number}, "sharp": boolean}.';

const DEFAULT_EVIDENCE_RULES = '';

function buildPrompt(
    cameraName: string,
    userRules: string | undefined,
    frames: number,
    intervalSec: number,
    evidenceRules?: string,
    detectorHint?: DetectorHint,
    diffInfo?: FrameDiffResult,
    previousSceneSummary?: string,
    hasBaselineImage = false,
): { system: string; prompt: string } {
    const activePrompt = getCleanUserPrompt(userRules);

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

    const prevLine = previousSceneSummary
        ? `Previous event summary: "${previousSceneSummary}".\n`
        : '';

    const frameLine = hasBaselineImage
        ? `Image #1 is the previous baseline frame; Image #${frames} is the current live frame.\n`
        : `${frames} current live camera frame(s), about ${intervalSec}s apart.\n`;

    let diffLine = '';
    if (diffInfo) {
        if (diffInfo.isScatteredWeatherNoise) {
            diffLine = `Pixel comparison with previous frame: only ${diffInfo.changedPercent}% scattered speckles changed (typical of falling leaves, wind, or rain).\n`;
        } else if (!diffInfo.hasMeaningfulChange) {
            diffLine = `Pixel comparison with previous frame: scene is nearly identical (${diffInfo.changedPercent}% diff).\n`;
        } else {
            diffLine = `Pixel comparison with previous frame: ${diffInfo.changedPercent}% of the frame changed (contiguous moving/changed cluster of ${diffInfo.largestClusterBlocks} blocks).\n`;
        }
    }

    // Only add a lightweight NO_ALERT instruction if the user's prompt does not already specify NO_ALERT, [ALERT_START], or JSON
    const formatHint =
        activePrompt && !/\[ALERT_START\]|NO_ALERT|\{/i.test(activePrompt)
            ? '\nFollow the user rules above strictly. If your rules for an alert are NOT met, reply with exactly: "NO_ALERT". ' +
              'If your rules ARE met, describe the alert clearly (including what the person is doing, their surroundings, any delivery/package, and any readable vehicle license plate).'
            : !activePrompt
                ? 'Describe any active human activity (including what the person is doing and their surroundings), delivery packages, or moving/arriving vehicles (including any readable license plate). If nothing notable is happening, reply with "NO_ALERT".'
                : '';

    const contextBlock =
        `Camera: ${cameraName}\n` +
        frameLine +
        prevLine +
        diffLine +
        hintLine +
        (evidenceRules ? `Evidence rules: ${evidenceRules}\n` : '');

    return {
        system: (activePrompt + formatHint).trim(),
        prompt: contextBlock.trim(),
    };
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

/** Calls the selected provider (works across all AI providers and all vision models). */
async function callModel(cfg: ProviderConfig, req: ModelRequest): Promise<string> {
    const defaults = PROVIDER_DEFAULTS[cfg.provider];
    const base = (cfg.baseUrl?.trim() || defaults.baseUrl).replace(/\/+$/, '');
    const model = cfg.model?.trim() || defaults.model;
    if (!base || !model)
        throw new Error(`${cfg.provider}: base URL and model are required.`);
    const b64s = req.jpegs.map(j => j.toString('base64'));
    const combinedPrompt = `${req.system}\n\n${req.prompt}`;

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
            const generationConfig: Record<string, unknown> = { maxOutputTokens: req.maxTokens };
            if (req.jsonMode)
                generationConfig.responseMimeType = 'application/json';
            const json = await postJson(
                `${base}/models/${model}:generateContent`,
                { 'x-goog-api-key': cfg.apiKey ?? '' },
                {
                    systemInstruction: { parts: [{ text: req.system }] },
                    contents: [{ role: 'user', parts }],
                    generationConfig,
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
            let ollamaImages = b64s;
            if (req.jpegs.length > 1 && isSingleImageOnlyModel(model)) {
                if (req.stitchForSingleImageModel) {
                    const stitched = await stitchJpegsHorizontal(req.jpegs, 384);
                    if (stitched)
                        ollamaImages = [stitched.toString('base64')];
                } else {
                    const latest = req.jpegs[req.jpegs.length - 1];
                    ollamaImages = [latest.toString('base64')];
                }
            }
            const user: any = { role: 'user', content: combinedPrompt };
            if (ollamaImages.length)
                user.images = ollamaImages;
            const body: Record<string, unknown> = {
                model,
                stream: false,
                messages: [{ role: 'system', content: req.system }, user],
                options: {
                    num_predict: Math.max(req.maxTokens, 1024),
                    num_ctx: 8192,
                    temperature: 0.1,
                },
            };
            if (req.jsonMode)
                body.format = 'json';
            const json = await postJson(`${base}/api/chat`, headers, body, req.timeoutMs);
            return json.message?.content ?? '';
        }

        case 'openai':
        case 'custom': {
            const headers: Record<string, string> = {};
            if (cfg.apiKey)
                headers.authorization = `Bearer ${cfg.apiKey}`;
            const content: any[] = [{ type: 'text', text: combinedPrompt }];
            for (const data of b64s)
                content.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${data}` } });
            const json = await postJson(
                `${base}/chat/completions`,
                headers,
                {
                    model,
                    max_tokens: Math.max(req.maxTokens, 500),
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
    sceneChanged: boolean;
    weatherOrIdleOnly: boolean;
    severity: 'low' | 'medium' | 'high';
    summary: string;
    save: SavePlan;
    objects: string[];
    licensePlates: string[];
    vehicles: string[];
    deliveryCarrier?: string;
    carriedItems: string[];
    aiFaces: DetectedFaceCandidate[];
    bestFrameIndex: number;
}

/**
 * Parses Stage 1 model replies in ANY format:
 * 1. The default [ALERT_START] ... [ALERT_END] block or "NO_ALERT" / "NO_ALERT_DUPLICATE"
 * 2. A JSON object {...} (if the user's custom prompt or model uses JSON)
 * 3. Free-form text (if the user's custom prompt uses plain text)
 */
function parseStage1(
    text: string,
    cameraJpegs: Buffer[],
    upstreamObjects: string[] = [],
    diffInfo?: FrameDiffResult,
): Stage1Parsed {
    const trimmed = text.trim();
    const frameCount = cameraJpegs.length;
    const defaultBestIdx = Math.floor(frameCount / 2);

    // 1. Check for explicit NO_ALERT or NO_ALERT_DUPLICATE when [ALERT_START] is not present
    if (
        !/\[ALERT_START\]/i.test(trimmed) &&
        (/\bNO_ALERT_DUPLICATE\b/i.test(trimmed) || /\bNO_ALERT\b/i.test(trimmed))
    ) {
        const isDup = /\bNO_ALERT_DUPLICATE\b/i.test(trimmed);
        return {
            alert: false,
            sceneChanged: false,
            weatherOrIdleOnly: true,
            severity: 'low',
            summary: isDup ? 'NO_ALERT_DUPLICATE (duplicate activity ignored)' : 'NO_ALERT',
            save: 'none',
            objects: [],
            licensePlates: [],
            vehicles: [],
            carriedItems: [],
            aiFaces: [],
            bestFrameIndex: defaultBestIdx,
        };
    }

    // 2. Check for [ALERT_START] ... [ALERT_END] format (or structured Severity:/Event Type:/Description: lines)
    const alertBlockMatch = trimmed.match(/\[ALERT_START\]([\s\S]*?)(?:\[ALERT_END\]|$)/i);
    const hasStructuredFields = /^\s*(?:Severity|Event\s*Type|Description)\s*:/im.test(trimmed);
    if (alertBlockMatch || hasStructuredFields) {
        const block = (alertBlockMatch ? alertBlockMatch[1] : trimmed).trim();
        const getField = (name: string): string => {
            const m = block.match(new RegExp(`^\\s*${name}\\s*:\\s*(.+)$`, 'im'));
            return m ? m[1].trim().replace(/^\[|\]$/g, '').trim() : '';
        };

        const sevRaw = getField('Severity').toLowerCase();
        const eventType = getField('Event Type');
        const description = getField('Description');
        const surrounding = getField('Surrounding') || getField('Surroundings');
        const subjects = getField('Subjects');
        const vehicleField = getField('Vehicle');
        const licensePlateField = getField('License Plate');
        const faceBoxField = getField('Face Box');
        const confidence = getField('Confidence');

        let severity: 'low' | 'medium' | 'high' = 'medium';
        if (sevRaw.includes('high') || /HIGH\s+SEVERITY/i.test(eventType))
            severity = 'high';
        else if (sevRaw.includes('low'))
            severity = 'low';

        const cleanField = (val: string) =>
            /^(none|n\/a|not\s+applicable|unknown|null|-|no\s+(vehicle|car|person|people|subject|items?)\b.*)$/i.test(val.trim())
                ? ''
                : val.trim();

        const descClean = cleanField(description);
        const surrClean = cleanField(surrounding);
        const subjClean = cleanField(subjects);
        const vehClean = cleanField(vehicleField);
        const evtClean = cleanField(eventType);
        const confClean = cleanField(confidence);

        const summaryParts: string[] = [];
        if (evtClean)
            summaryParts.push(`[${evtClean}]`);
        if (descClean)
            summaryParts.push(descClean);
        if (surrClean)
            summaryParts.push(`Surrounding: ${surrClean}`);
        if (subjClean)
            summaryParts.push(`Subjects: ${subjClean}`);
        if (vehClean)
            summaryParts.push(`Vehicle: ${vehClean}`);
        if (confClean)
            summaryParts.push(`(${confClean})`);

        const combinedSummary = summaryParts.join(' ').trim() || block.replace(/\s+/g, ' ').slice(0, 240);
        const lowerAll = `${evtClean} ${descClean} ${surrClean} ${subjClean} ${vehClean}`.toLowerCase();

        // Extract license plates from License Plate field, Vehicle field, or Description
        const licensePlates: string[] = [];
        const plateClean = cleanField(licensePlateField);
        if (plateClean && isValidPlateCandidate(plateClean)) {
            licensePlates.push(cleanPlateString(plateClean));
        }
        const plateRegexMatch = `${plateClean} ${vehClean}`.match(
            /\b(?:license\s+plate|plate\s*(?:number|#|is))\s*[:#]?\s*([A-Z0-9]{2,4}[-\s]?[A-Z0-9]{2,5})\b/i,
        );
        if (plateRegexMatch?.[1] && isValidPlateCandidate(plateRegexMatch[1])) {
            const norm = cleanPlateString(plateRegexMatch[1]);
            if (!licensePlates.includes(norm))
                licensePlates.push(norm);
        }

        // Extract delivery carrier
        let deliveryCarrier: string | undefined;
        for (const c of DELIVERY_CARRIERS) {
            if (new RegExp(`\\b${c}\\b`, 'i').test(lowerAll)) {
                deliveryCarrier = c;
                break;
            }
        }

        // Extract carried personal items vs delivery packages
        const carriedItems: string[] = [];
        for (const item of ['handbag', 'purse', 'backpack', 'trash', 'trash bag', 'garbage', 'groceries', 'umbrella', 'briefcase']) {
            if (new RegExp(`\\b${item}\\b`, 'i').test(lowerAll))
                carriedItems.push(item);
        }
        const onlyPersonalItem =
            carriedItems.length > 0 &&
            !deliveryCarrier &&
            !/\b(package|parcel|delivery\s+box|cardboard\s+box|amazon|fedex|ups|usps|dhl)\b/.test(lowerAll);

        const rawObjects: string[] = [...upstreamObjects];
        if (
            /human|delivery|security|vehicle\s+arrival/i.test(evtClean) ||
            subjClean ||
            /\b(person|people|human|man|woman|individual|subject|driver|courier|walking|standing|exiting|loitering)\b/.test(lowerAll)
        ) {
            rawObjects.push('person');
        }
        if (/delivery/i.test(evtClean) || deliveryCarrier || (!onlyPersonalItem && /\b(package|parcel|box)\b/.test(lowerAll))) {
            rawObjects.push('package');
        }
        if (
            /vehicle/i.test(evtClean) ||
            (vehClean && !/\bno\s+(vehicle|car|truck|van|suv)\b/i.test(vehClean)) ||
            (!/\bno\s+(vehicle|car|truck|van|suv)\b/i.test(lowerAll) &&
                /\b(car|truck|van|suv|vehicle|sedan|pickup)\b/.test(lowerAll))
        ) {
            rawObjects.push('vehicle');
        }
        if (/\b(dog|cat|animal|pet|deer|wildlife)\b/.test(lowerAll)) {
            rawObjects.push('animal');
        }

        const objects = normalizeObjects(rawObjects, false);
        const aiFaces: DetectedFaceCandidate[] = [];
        // Only add an AI face candidate if an explicit Face Box [x, y, w, h] was provided or Subjects mentions a clear/close face
        if (faceBoxField) {
            const nums = faceBoxField.match(/[\d.]+/g)?.map(Number);
            if (nums && nums.length === 4) {
                const [imgW, imgH] = getJpegDimensions(cameraJpegs[defaultBestIdx] ?? cameraJpegs[0]);
                const [bx, by, bw, bh] = nums;
                const widthPx = Math.round(bw * imgW);
                const heightPx = Math.round(bh * imgH);
                if (widthPx >= 48 && heightPx >= 48) {
                    aiFaces.push({
                        frameIndex: defaultBestIdx,
                        box: [bx, by, bw, bh],
                        widthPx,
                        heightPx,
                        sharp: !/\b(blurry|obscured|hidden|unknown)\b/i.test(subjClean),
                        sharpnessScore: 20,
                    });
                }
            }
        }

        const save: SavePlan =
            severity === 'high' || /delivery|security/i.test(evtClean) ? 'clip' : 'snapshot';

        return {
            alert: true,
            sceneChanged: true,
            weatherOrIdleOnly: false,
            severity,
            summary: combinedSummary,
            save,
            objects,
            licensePlates,
            vehicles: vehClean ? [vehClean] : [],
            deliveryCarrier,
            carriedItems,
            aiFaces,
            bestFrameIndex: defaultBestIdx,
        };
    }

    // 3. Check for JSON object {...} (custom prompts or JSON-mode replies)
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
        // 4. Plain-text fallback for custom user prompts
        const lowerTrim = trimmed.toLowerCase();
        const isNegative =
            /^(no\b|none\b|false\b|nothing\b|empty\b|no\s+alert)/i.test(trimmed) ||
            /\b(no\s+(person|people|human|vehicle|activity|movement|change|alert)|nothing\s+(notable|happening|detected|to\s+report)|empty\s+(porch|driveway|yard|scene))\b/i.test(
                lowerTrim,
            );
        const rawObjects = [...upstreamObjects];
        if (!isNegative) {
            if (/\b(person|people|human|man|woman|someone|individual|visitor|courier)\b/i.test(lowerTrim))
                rawObjects.push('person');
            if (/\b(car|truck|van|suv|vehicle|sedan|tesla|pickup)\b/i.test(lowerTrim) && !/\bno\s+(vehicle|car)\b/i.test(lowerTrim))
                rawObjects.push('vehicle');
            if (/\b(package|parcel|delivery|amazon|fedex|ups|usps|dhl)\b/i.test(lowerTrim))
                rawObjects.push('package');
            if (/\b(dog|cat|animal|pet|deer|wildlife)\b/i.test(lowerTrim))
                rawObjects.push('animal');
        }
        const licensePlates: string[] = [];
        const plateMatchPlain = trimmed.match(
            /\b(?:license\s+plate|plate\s*(?:number|#|is))\s*[:#]?\s*([A-Z0-9]{2,4}[-\s]?[A-Z0-9]{2,5})\b/i,
        );
        if (plateMatchPlain?.[1] && isValidPlateCandidate(plateMatchPlain[1]))
            licensePlates.push(cleanPlateString(plateMatchPlain[1]));

        let deliveryCarrier: string | undefined;
        for (const c of DELIVERY_CARRIERS) {
            if (new RegExp(`\\b${c}\\b`, 'i').test(lowerTrim)) {
                deliveryCarrier = c;
                break;
            }
        }
        const carriedItems: string[] = [];
        for (const item of ['handbag', 'purse', 'backpack', 'trash', 'trash bag', 'garbage', 'groceries', 'umbrella', 'briefcase']) {
            if (new RegExp(`\\b${item}\\b`, 'i').test(lowerTrim))
                carriedItems.push(item);
        }

        const objects = normalizeObjects(rawObjects, false);
        return {
            alert: !isNegative && trimmed.length > 0,
            sceneChanged: !isNegative,
            weatherOrIdleOnly: isNegative,
            severity: 'medium',
            summary: trimmed.replace(/\s+/g, ' ').slice(0, 320) || 'NO_ALERT',
            save: 'snapshot',
            objects,
            licensePlates,
            vehicles: [],
            deliveryCarrier,
            carriedItems,
            aiFaces: [],
            bestFrameIndex: defaultBestIdx,
        };
    }
    const parsed = JSON.parse(match[0]);
    const frameCountJson = cameraJpegs.length;

    const aiFaces: DetectedFaceCandidate[] = [];
    if (Array.isArray(parsed.detectedFaces)) {
        for (const df of parsed.detectedFaces) {
            if (!df || !Array.isArray(df.box) || df.box.length !== 4)
                continue;
            const fIdx = Math.max(0, Math.min(frameCount - 1, (Number(df.frame) || 1) - 1));
            const [imgW, imgH] = getJpegDimensions(cameraJpegs[fIdx]);
            let [bx, by, bw, bh] = df.box.map((n: unknown) => Number(n) || 0);
            if (bw > 1.5 || bh > 1.5) {
                if (bw <= imgW && bh <= imgH && bx + bw <= imgW * 1.05) {
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

    let rawSummary = String(
        parsed.summary ?? parsed.description ?? parsed.caption ?? parsed.message ?? parsed.reason ?? parsed.activity ?? parsed.scene ?? '',
    ).trim();
    const jsonSurrounding = String(parsed.surrounding ?? parsed.surroundings ?? '').trim();
    if (jsonSurrounding && !/^(none|n\/a|unknown|null|-)$/i.test(jsonSurrounding) && !rawSummary.includes(jsonSurrounding)) {
        rawSummary = rawSummary ? `${rawSummary} Surrounding: ${jsonSurrounding}` : `Surrounding: ${jsonSurrounding}`;
    }
    if (!rawSummary) {
        for (const [k, v] of Object.entries(parsed)) {
            if (typeof v === 'string' && v.trim().length > 6 && !['severity', 'save', 'confidence', 'deliveryCarrier'].includes(k)) {
                rawSummary = v.trim();
                break;
            }
        }
    }
    const summary = rawSummary || 'Motion activity detected.';
    const lowerSummary = summary.toLowerCase();

    // Parse license plates (from parsed.licensePlates or regex in summary like "plate ABC-1234")
    const licensePlates: string[] = [];
    const seenPlates = new Set<string>();
    const addPlate = (p: unknown) => {
        const clean = String(p ?? '').trim().toUpperCase().replace(/[^A-Z0-9\-\s]/g, '');
        if (clean.length >= 3 && clean.length <= 12 && !['NONE', 'UNKNOWN', 'NULL', 'N/A'].includes(clean) && !seenPlates.has(clean)) {
            seenPlates.add(clean);
            licensePlates.push(clean);
        }
    };
    if (Array.isArray(parsed.licensePlates)) {
        for (const p of parsed.licensePlates)
            addPlate(p);
    } else if (typeof parsed.licensePlate === 'string') {
        addPlate(parsed.licensePlate);
    }
    const plateMatch = summary.match(/\b(?:license\s+plate|plate\s*(?:number|#|is))\s*[:#]?\s*([A-Z0-9]{2,4}[-\s]?[A-Z0-9]{2,5})\b/i);
    if (plateMatch?.[1] && isValidPlateCandidate(plateMatch[1]))
        addPlate(plateMatch[1]);

    // Parse vehicles descriptions
    const vehicles: string[] = Array.isArray(parsed.vehicles)
        ? parsed.vehicles.map((v: unknown) => String(v ?? '').trim()).filter(Boolean)
        : [];

    // Parse delivery carrier (DHL, Amazon, FedEx, USPS, UPS)
    let deliveryCarrier = String(parsed.deliveryCarrier ?? '').trim();
    if (!deliveryCarrier || /^(none|null|n\/a|unknown|false)$/i.test(deliveryCarrier)) {
        deliveryCarrier = '';
        for (const c of DELIVERY_CARRIERS) {
            if (new RegExp(`\\b${c}\\b`, 'i').test(summary)) {
                deliveryCarrier = c;
                break;
            }
        }
    }

    // Parse carried personal/household items (handbag, purse, backpack, trash, groceries) vs delivery package
    const carriedItems: string[] = Array.isArray(parsed.carriedItems)
        ? parsed.carriedItems.map((x: unknown) => String(x ?? '').trim().toLowerCase()).filter(Boolean)
        : [];
    for (const item of ['handbag', 'purse', 'backpack', 'trash', 'trash bag', 'garbage', 'groceries', 'umbrella', 'briefcase']) {
        if (new RegExp(`\\b${item}\\b`, 'i').test(lowerSummary) && !carriedItems.includes(item))
            carriedItems.push(item);
    }
    const onlyCarryingPersonalItem =
        carriedItems.length > 0 &&
        !deliveryCarrier &&
        !/\b(package|parcel|delivery\s+box|cardboard\s+box|amazon|fedex|ups|usps|dhl)\b/.test(lowerSummary);

    const mentionsActiveHuman =
        !/\b(no\s+(person|people|human|one|activity|movement)|empty|nobody|without\s+any\s+person)\b/.test(lowerSummary) &&
        /\b(person|people|human|man|woman|boy|girl|child|adult|visitor|someone|individual|figure|courier|driver|standing|walking|approaching|running|entering|exiting|delivering|carrying)\b/.test(
            lowerSummary,
        );

    const mentionsRealActivity =
        mentionsActiveHuman ||
        aiFaces.length > 0 ||
        licensePlates.length > 0 ||
        Boolean(deliveryCarrier) ||
        /\b(arrived|departed|left|pulled\s+(in|up|out)|replaced|changed|driving|moving|moved|knocked|opened|closed|delivered|dropped\s+off|picked\s+up|dog|cat|animal|pet|deer|package|parcel|activity\s+detected)\b/.test(
            lowerSummary,
        );

    const mentionsWeatherOnly =
        !mentionsRealActivity &&
        /\b(only\s+(falling\s+lea(f|ves)|wind|rain|snow|shadows?|trees?)|caused\s+by\s+(wind|rain|leaves|shadows?)|falling\s+lea(f|ves)|lea(f|ves)\s+(blowing|falling)|swaying\s+(tree|branch|bush|plant)|rain(ing|drops)?\s+only)\b/.test(
            lowerSummary,
        );
    const hasLargePixelChange =
        !!diffInfo && diffInfo.hasMeaningfulChange && diffInfo.changedPercent >= 5.0 && diffInfo.largestClusterBlocks >= 6;
    const mentionsIdleOnly =
        !mentionsRealActivity &&
        !hasLargePixelChange &&
        /\b(no\s+(significant\s+)?(change|movement|activity|motion|difference)\s+detected|scene\s+is\s+unchanged|nothing\s+(changed|moved|new)|(parked|stationary|idle|unmoving)\s+(car|vehicle|truck|suv|van|chair|furniture|bicycle|bike|object)s?\s+(only|with\s+no|and\s+no)|empty\s+(porch|driveway|yard|scene|walkway|street))\b/.test(
            lowerSummary,
        );

    let rawObjects = Array.isArray(parsed.objects) ? [...parsed.objects, ...upstreamObjects] : [...upstreamObjects];
    if (mentionsActiveHuman || deliveryCarrier)
        rawObjects.push('person');
    if (deliveryCarrier)
        rawObjects.push('package');
    if (licensePlates.length > 0 || vehicles.length > 0)
        rawObjects.push('vehicle');

    // If person is only carrying a handbag/backpack/trash (not a package), remove accidental 'package' tag
    if (onlyCarryingPersonalItem)
        rawObjects = rawObjects.filter(o => !['package', 'parcel', 'box'].includes(String(o).toLowerCase()));

    if (mentionsIdleOnly || mentionsWeatherOnly) {
        rawObjects = [];
    } else {
        if (
            /\b(car|truck|vehicle|van|suv|sedan|pickup|motorcycle|bicycle|bike)\b/.test(lowerSummary) &&
            (!/\b(parked|stationary|idle|unchanged)\b/.test(lowerSummary) ||
                /\b(arrived|left|moved|pulled|driving|replaced|different)\b/.test(lowerSummary))
        ) {
            rawObjects.push('vehicle');
        }
        if (!onlyCarryingPersonalItem && /\b(package|parcel|delivery|cardboard\s+box)\b/.test(lowerSummary))
            rawObjects.push('package');
        if (/\b(dog|cat|animal|pet|deer|wildlife|raccoon|fox|coyote|bear)\b/.test(lowerSummary))
            rawObjects.push('animal');
    }

    const objects = normalizeObjects(rawObjects, aiFaces.length > 0);
    const rawBest = Number(parsed.bestFrame);
    const bestFrameIndex =
        Number.isFinite(rawBest) && rawBest >= 1 && rawBest <= frameCount
            ? Math.round(rawBest) - 1
            : Math.floor(frameCount / 2);

    if (aiFaces.length === 0 && objects.includes('person')) {
        const [imgW, imgH] = getJpegDimensions(cameraJpegs[bestFrameIndex] ?? cameraJpegs[0]);
        aiFaces.push({
            frameIndex: bestFrameIndex,
            box: [0.25, 0.08, 0.5, 0.5],
            widthPx: Math.round(imgW * 0.25),
            heightPx: Math.round(imgH * 0.35),
            sharp: true,
            sharpnessScore: 20,
        });
    }

    const hasNotableObject = objects.length > 0;
    const weatherOrIdleOnly = (mentionsWeatherOnly || mentionsIdleOnly) && !mentionsRealActivity && !hasNotableObject && !hasLargePixelChange;
    const sceneChanged = !weatherOrIdleOnly;

    const rawAlert = parsed.alert === true || parsed.alert === 'true';
    const shouldAlert = (rawAlert || mentionsRealActivity || hasNotableObject || hasLargePixelChange) && !weatherOrIdleOnly;

    return {
        alert: shouldAlert,
        sceneChanged,
        weatherOrIdleOnly,
        severity: ['low', 'medium', 'high'].includes(parsed.severity) ? parsed.severity : 'medium',
        summary: hasLargePixelChange && /no\s+change\s+detected/i.test(summary) ? 'Significant scene change detected in camera view.' : summary,
        save: ['none', 'snapshot', 'clip', 'both'].includes(parsed.save) ? parsed.save : 'none',
        objects,
        licensePlates,
        vehicles,
        deliveryCarrier: deliveryCarrier || undefined,
        carriedItems,
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
            '-loglevel',
            'error',
            ...inputArgs,
            '-an',
            '-vf',
            `fps=1/${intervalSec},scale=min(1024\\,iw):-2`,
            '-frames:v',
            String(count),
            '-q:v',
            '5',
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
                        '-loglevel',
                        'error',
                        '-i',
                        inFile,
                        '-frames:v',
                        '1',
                        '-vf',
                        'scale=min(512\\,iw):-2',
                        '-q:v',
                        '5',
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

/** Stitches multiple JPEGs side-by-side into a single composite JPEG using Scrypted's ffmpeg. */
async function stitchJpegsHorizontal(jpegs: Buffer[], heightPx = 384): Promise<Buffer | undefined> {
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
            const scaleParts = jpegs.map((_, i) => `[${i}:v]scale=-2:${heightPx}[v${i}]`).join(';');
            const stackInputs = jpegs.map((_, i) => `[v${i}]`).join('');
            const filterComplex = `${scaleParts};${stackInputs}hstack=inputs=${n}[out]`;
            const outFile = path.join(dir, 'stitched.jpg');

            await new Promise<void>((resolve, reject) => {
                const proc = spawn(
                    ffmpegPath,
                    [
                        '-nostdin',
                        '-hide_banner',
                        '-loglevel',
                        'error',
                        ...inputArgs,
                        '-filter_complex',
                        filterComplex,
                        '-map',
                        '[out]',
                        '-frames:v',
                        '1',
                        '-q:v',
                        '5',
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
/* Notification & Storage helpers                                       */
/* ------------------------------------------------------------------ */

const CHANNELS = ['Home Assistant', 'Webhook', 'ntfy', 'Pushover', 'Telegram'];

type Severity = 'low' | 'medium' | 'high';

interface SavedSnapshotInfo {
    localPath?: string;
    haMediaUrl?: string;
    uploadedDestinations: string[];
    errors: string[];
}

interface AlertRequest {
    title: string;
    message: string;
    rawSummary?: string;
    timestampText: string;
    isoTimestamp: string;
    cameraId?: string;
    cameraName?: string;
    severity: Severity;
    channels: string[];
    jpeg?: Buffer;
    haCameraEntity?: string;
    haImageUrl?: string;
    savedSnapshotPath?: string;
    tag?: string;
    objects?: string[];
    faces?: string[];
    unknownFacesCount?: number;
    licensePlates?: string[];
    vehicles?: string[];
    deliveryCarrier?: string;
    carriedItems?: string[];
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
    /** Previous analysis baseline frame & summary used to detect if cars, chairs, or background changed */
    lastBaselineJpeg?: Buffer;
    lastBaselineTime = 0;
    lastBaselineSummary = '';

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
                'When to run AI analysis: on Motion events, Scrypted smart ObjectDetector events, or both (recommended).',
            type: 'string',
            choices: TRIGGER_CHOICES,
            defaultValue: TRIGGER_CHOICES[0],
        },
        /* ---------------- On / Off Switches for People, Animals, Vehicles, Packages ---------------- */
        detectPeople: {
            title: 'Detect & alert on People',
            description: 'Switch On/Off alerts for people (known faces, strangers, couriers, visitors).',
            type: 'boolean',
            defaultValue: true,
        },
        detectVehicles: {
            title: 'Detect & alert on Vehicles & License Plates',
            description: 'Switch On/Off alerts for arriving/departing/changed vehicles and license plates.',
            type: 'boolean',
            defaultValue: true,
        },
        detectPackages: {
            title: 'Detect & alert on Packages & Couriers',
            description: 'Switch On/Off alerts for packages and DHL, Amazon, FedEx, USPS, UPS deliveries.',
            type: 'boolean',
            defaultValue: true,
        },
        detectAnimals: {
            title: 'Detect & alert on Animals',
            description: 'Switch On/Off alerts for pets and wildlife (dogs, cats, deer, etc.).',
            type: 'boolean',
            defaultValue: true,
        },
        ignoreStationaryAndWeather: {
            title: 'Ignore idle objects (parked cars, chairs) & weather (leaves, wind, rain)',
            description:
                'Compares the previous baseline frame against the current frame. Suppresses false alarms from falling leaves, wind, or rain, ' +
                'while alerting whenever a car arrives/leaves, a black car is replaced by a red car, an idle object moves, or a person appears.',
            type: 'boolean',
            defaultValue: true,
        },
        minDetectorScore: {
            title: 'Minimum smart detector confidence (0.1 - 0.95)',
            description: 'Minimum confidence for Scrypted ObjectDetector triggers.',
            type: 'number',
            defaultValue: 0.5,
        },
        motionDelaySeconds: {
            title: 'Motion settle delay (seconds)',
            description:
                'Brief pause after motion starts so the person/object is in frame before sampling.',
            type: 'number',
            defaultValue: 0.5,
        },
        frameCount: {
            title: 'Frames to analyze',
            description: 'Frames sampled from the live stream after motion starts. More frames give better movement context.',
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
            title: 'Alert prompt / rules',
            description:
                'Write your own prompt and rules for when to trigger an alert and what to include in the alert message.',
            type: 'textarea',
            defaultValue: '',
            placeholder:
                'Write your own rules here (e.g. Alert when a person, delivery, or vehicle is on the property, and describe their activity and surroundings)...',
        },
        clearRules: {
            title: 'Clear prompt',
            description: 'Clears the alert prompt box above so you can write a fresh prompt.',
            type: 'button',
            onPut: async () => {
                await this.storageSettings.putSetting('rules', '');
                this.console.log('Cleared alert prompt.');
            },
        },
        objectFilter: {
            title: 'Additional required object filter (optional)',
            description:
                'Leave empty to use the People / Vehicles / Packages / Animals On/Off switches above.',
            type: 'string',
            multiple: true,
            choices: OBJECT_FILTER_CHOICES,
            defaultValue: [],
        },
        faceAlertMode: {
            title: 'Face recognition behavior',
            description:
                'Distinguishes recognized known faces from non-recognized stranger faces and alerts on their movements and activity.',
            type: 'string',
            choices: FACE_ALERT_MODES,
            defaultValue: FACE_ALERT_MODES[0],
        },
        emitObjectDetections: {
            title: 'Emit Scrypted ObjectDetector events',
            description:
                'Publishes AI-detected objects (person, vehicle, package, animal), license plates, and face labels back to Scrypted.',
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
                'Channels configured on the AI Vision Alerts plugin page (Home Assistant, Webhook, ntfy, Pushover, Telegram). ' +
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
                'will include a camera snapshot.',
        },
        notifiers: {
            title: 'Also send to Scrypted notifiers (optional)',
            type: 'device',
            multiple: true,
            deviceFilter: `interfaces.includes('${ScryptedInterface.Notifier}')`,
        },
        attachSnapshot: {
            title: 'Attach a frame to notifications',
            description: 'Applies to Home Assistant, Webhook, ntfy, Pushover, Telegram and Scrypted notifiers.',
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
            description: 'Samples the live stream, asks the AI, saves the snapshot, and sends a notification.',
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

        // If the camera still had an old built-in default prompt saved in storage, clear it so the user starts with a clean box
        const currentRules = String(this.storageSettings.values.rules ?? '').trim();
        if (currentRules && !getCleanUserPrompt(currentRules)) {
            this.storageSettings.putSetting('rules', '').catch(() => {});
        }

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

                    const delayMs = Math.min(10, Math.max(0, Number(this.storageSettings.values.motionDelaySeconds ?? 0.5))) * 1000;
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
        const trig = String(this.storageSettings.values.triggerSource ?? TRIGGER_CHOICES[0]);
        if (trig === 'Motion sensor only')
            return;

        const minScore = Math.min(0.95, Math.max(0.1, Number(this.storageSettings.values.minDetectorScore ?? 0.5)));
        const detections = data.detections ?? [];
        const rawClasses: string[] = [];
        const faceCandidates: DetectedFaceCandidate[] = [];
        const [dimW, dimH] = data.inputDimensions ?? [1024, 576];
        let sawMotionDetection = false;

        for (const d of detections) {
            if (!d.className)
                continue;
            if (d.className === 'motion') {
                sawMotionDetection = true;
                continue;
            }
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
                if (normW > 0 && normH > 0 && normW * normH < 0.005)
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
        if (!objects.length && !faceCandidates.length) {
            if (sawMotionDetection && trig !== 'Smart Object/Face Detection only') {
                this.analyze(false).catch(e => this.console.error('analyze failed', e));
            }
            return;
        }

        this.pendingHint = {
            objects,
            faces: faceCandidates,
            detectionId: data.detectionId,
            timestamp: Date.now(),
        };

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
        const classes = new Set<string>([
            'person',
            'face',
            'vehicle',
            'car',
            'truck',
            'bicycle',
            'motorcycle',
            'package',
            'animal',
            'dog',
            'cat',
            'plate',
        ]);
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
        if (!verdict.objects.length && !verdict.faces.length && !verdict.licensePlates.length)
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
        for (const plate of verdict.licensePlates) {
            detections.push({
                className: 'plate',
                label: plate,
                score: 0.95,
                labelScore: 0.95,
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

        // Prefer instant camera snapshots via takePicture() when count === 1 or when RTSP/H.264 stream sampling
        // fails on cameras that start mid-GOP without an IDR keyframe ("No start code is found").
        if (count === 1 && !detectorFrame && this.mixinDevice.takePicture) {
            try {
                const picture = await this.mixinDevice.takePicture({ reason: 'event' });
                return [await mediaManager.convertMediaObjectToBuffer(picture, 'image/jpeg')];
            } catch {
                // fall through to stream sampling
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
            if (!this.mixinDevice.takePicture) {
                this.console.warn('Live stream sampling failed and camera has no takePicture():', e);
                throw e;
            }
            const picture = await this.mixinDevice.takePicture!({ reason: 'event' });
            return [await mediaManager.convertMediaObjectToBuffer(picture, 'image/jpeg')];
        }
    }

    /** Calls the first working provider in the chain, enforcing daily quota only on paid cloud providers. */
    async runWithProviderChain(
        chain: ProviderConfig[],
        request: ModelRequest,
    ): Promise<{ text: string; used: ProviderId; model: string }> {
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
                const model = cfg.model?.trim() || PROVIDER_DEFAULTS[cfg.provider].model;
                return { text, used: cfg.provider, model };
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
        this.strangerClusters = this.strangerClusters.filter(c => now - c.lastSeen < Math.max(cooldownMs, 30 * 60 * 1000));

        let bestCluster: StrangerCluster | undefined;
        let bestSim = 0;
        for (const cluster of this.strangerClusters) {
            if (embedding && cluster.embedding) {
                const sim = cosineSimilarity(embedding, cluster.embedding);
                const threshold = now - cluster.lastSeen < 45000 ? 0.62 : 0.74;
                if (sim >= threshold && sim > bestSim) {
                    bestSim = sim;
                    bestCluster = cluster;
                }
            } else if (now - cluster.lastSeen < 35000) {
                bestCluster = cluster;
                break;
            }
        }

        if (bestCluster) {
            bestCluster.lastSeen = now;
            if (embedding && bestCluster.embedding) {
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

        for (const c of candidates) {
            const frame = cameraJpegs[c.frameIndex] ?? cameraJpegs[0];
            const patch = await analyzeFacePatch(ffmpegPath, frame, c.box);
            if (patch) {
                c.sharpnessScore = patch.sharpnessScore;
                c.sharp = c.sharp && patch.sharpnessScore >= 14;
                if (!c.embedding)
                    c.embedding = patch.embedding;
            }
        }

        const results: EvaluatedFace[] = [];

        let aiScoresByPerson = new Map<string, number>();
        let aiSharpOverride: boolean | undefined;
        const viableForAi = candidates
            .filter(c => c.widthPx >= minKnownWidth)
            .sort((a, b) => Number(b.sharp) - Number(a.sharp) || b.widthPx - a.widthPx);

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
                    jsonMode: true,
                    stitchForSingleImageModel: true,
                };
                const { text: simText } = await this.runWithProviderChain(chain, simReq);
                const parsedSim = parseFaceSimilarityReply(simText);
                aiScoresByPerson = parsedSim.scores;
                aiSharpOverride = parsedSim.sharp;
            } catch (e) {
                this.console.warn('Face similarity scoring failed:', errMsg(e));
            }
        }

        const refsByPerson = new Map<string, FaceReference[]>();
        for (const r of faceRefs) {
            const list = refsByPerson.get(r.name) ?? [];
            list.push(r);
            refsByPerson.set(r.name, list);
        }

        for (const cand of candidates) {
            const effectiveSharp = aiSharpOverride === false ? false : cand.sharp;

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
                    box: cand.box,
                    embedding: cand.embedding,
                    rejectReason: `${cand.widthPx}px < ${minKnownWidth}px min width`,
                });
                continue;
            }

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
                        box: cand.box,
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
                        box: cand.box,
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
                    box: cand.box,
                    embedding: cand.embedding,
                });
                continue;
            }

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
                    box: cand.box,
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
                    box: cand.box,
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
                box: cand.box,
                embedding: cand.embedding,
            });
        }

        return results;
    }

    /**
     * Reads license plates from the camera frame (using native high-res snapshot if available when a vehicle is seen),
     * matches them against Known & Learned plates, and auto-learns new plates to disk & storage.
     */
    async evaluateAndLearnPlates(
        cameraName: string,
        stage1: Stage1Parsed,
        bestFrame: Buffer,
        chain: ProviderConfig[],
    ): Promise<EvaluatedPlate[]> {
        if (!this.provider.isPlateRecognitionEnabled() || !stage1.alert)
            return [];

        const hasVehicle =
            stage1.objects.includes('vehicle') ||
            stage1.vehicles.length > 0 ||
            stage1.licensePlates.length > 0 ||
            /\b(vehicle|car|truck|suv|van|sedan|tesla|pickup|license\s+plate)\b/i.test(stage1.summary);
        if (!hasVehicle)
            return [];

        // Grab a full-resolution picture from the camera if available so small license plate characters are readable
        let hiResFrame = bestFrame;
        if (this.mixinDevice.takePicture) {
            try {
                const pic = await this.mixinDevice.takePicture({ reason: 'event' });
                const buf = await mediaManager.convertMediaObjectToBuffer(pic, 'image/jpeg');
                if (buf.length > bestFrame.length)
                    hiResFrame = buf;
            } catch {
                // use bestFrame
            }
        }

        const rawPlates = new Map<string, { vehicleDesc?: string; box?: [number, number, number, number]; confidence: number }>();
        for (const p of stage1.licensePlates) {
            if (isValidPlateCandidate(p)) {
                rawPlates.set(cleanPlateString(p), {
                    vehicleDesc: stage1.vehicles[0],
                    confidence: 0.9,
                });
            }
        }

        // If Stage 1 saw a vehicle (e.g. "a red Tesla with a visible license plate") but didn't read the characters yet,
        // run a dedicated high-resolution ALPR / OCR pass!
        if (rawPlates.size === 0) {
            try {
                const ocrReq: ModelRequest = {
                    system: PLATE_OCR_SYSTEM_PROMPT,
                    prompt:
                        `Camera: ${cameraName}\n` +
                        `Vehicle context: ${stage1.vehicles.join(', ') || stage1.summary}\n` +
                        'Read the exact alphanumeric characters on any visible license plate on the vehicle(s). ' +
                        'Return JSON only: {"plates": [{"plate": "ABC1234", "vehicle": "red Tesla", "box": [0.3, 0.5, 0.2, 0.1], "confidence": 0.9}]}',
                    jpegs: [hiResFrame],
                    maxTokens: 160,
                    timeoutMs: this.provider.timeoutMs(),
                    jsonMode: true,
                };
                const { text: ocrText } = await this.runWithProviderChain(chain, ocrReq);
                const m = ocrText.match(/\{[\s\S]*\}/);
                if (m) {
                    const parsed = JSON.parse(m[0]);
                    if (Array.isArray(parsed.plates)) {
                        for (const item of parsed.plates) {
                            const cand = String(item?.plate ?? '').trim();
                            if (!isValidPlateCandidate(cand))
                                continue;
                            const norm = cleanPlateString(cand);
                            let box: [number, number, number, number] | undefined;
                            if (Array.isArray(item.box) && item.box.length === 4) {
                                const nums = item.box.map((n: unknown) => Math.max(0, Math.min(1, Number(n) || 0)));
                                if (nums[2] > 0 && nums[3] > 0)
                                    box = [nums[0], nums[1], nums[2], nums[3]];
                            }
                            rawPlates.set(norm, {
                                vehicleDesc: String(item?.vehicle ?? stage1.vehicles[0] ?? '').trim() || undefined,
                                box,
                                confidence: Math.max(0.5, Math.min(1, Number(item?.confidence) || 0.9)),
                            });
                        }
                    }
                }
            } catch (e) {
                this.console.warn('License plate OCR pass failed:', errMsg(e));
            }
        }

        if (rawPlates.size === 0)
            return [];

        const out: EvaluatedPlate[] = [];
        for (const [plateNum, info] of rawPlates.entries()) {
            const evaluated = await this.provider.matchOrLearnPlate(
                cameraName,
                plateNum,
                info.vehicleDesc,
                info.confidence,
                hiResFrame,
                info.box,
            );
            out.push(evaluated);
        }
        return out;
    }

    /** Schedules a ~3s confirmation re-check if there are pending multi-frame face confirmations within the 30s window. */
    scheduleConfirmationRecheckIfNeeded() {
        if (this.recheckTimer)
            return;
        const now = Date.now();
        const windowMs = this.provider.confirmationWindowMs();
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

    /** Checks if any detected object category is enabled via the People / Animals / Vehicles / Packages switches. */
    passesCategorySwitches(objects: string[], hasConfirmedFace: boolean, hasUnrecognizedPerson: boolean): boolean {
        const s = this.storageSettings.values;
        const peopleOn = Boolean(s.detectPeople ?? true);
        const vehiclesOn = Boolean(s.detectVehicles ?? true);
        const packagesOn = Boolean(s.detectPackages ?? true);
        const animalsOn = Boolean(s.detectAnimals ?? true);

        const hasPerson = objects.includes('person') || objects.includes('face') || hasConfirmedFace || hasUnrecognizedPerson;
        const hasVehicle = objects.includes('vehicle');
        const hasPackage = objects.includes('package');
        const hasAnimal = objects.includes('animal');

        // If none of the 4 categories were specifically tagged, allow general scene change alerts if any switch is on
        if (!hasPerson && !hasVehicle && !hasPackage && !hasAnimal)
            return peopleOn || vehiclesOn || packagesOn || animalsOn;

        if (hasPerson && peopleOn) return true;
        if (hasVehicle && vehiclesOn) return true;
        if (hasPackage && packagesOn) return true;
        if (hasAnimal && animalsOn) return true;
        return false;
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
            const count = isConfirmationRecheck
                ? 1
                : Math.min(8, Math.max(1, Math.round(Number(s.frameCount ?? 3))));
            const interval = Math.min(10, Math.max(1, Math.round(Number(s.frameIntervalSeconds ?? 2))));

            const activeHint =
                triggerHint ??
                (this.pendingHint && Date.now() - this.pendingHint.timestamp < 15000 ? this.pendingHint : undefined);
            this.pendingHint = undefined;

            const cameraJpegs = await this.captureFrames(count, interval, activeHint?.detectionId);
            const ignoreIdleAndWeather = Boolean(s.ignoreStationaryAndWeather ?? true);

            const hasPrevBaseline =
                ignoreIdleAndWeather &&
                !isConfirmationRecheck &&
                !!this.lastBaselineJpeg &&
                now - this.lastBaselineTime < 6 * 60 * 60 * 1000;
            const prevRefJpeg = hasPrevBaseline ? this.lastBaselineJpeg! : cameraJpegs[0];
            const latestJpeg = cameraJpegs[cameraJpegs.length - 1];

            let diffInfo: FrameDiffResult | undefined;
            if (ignoreIdleAndWeather && (hasPrevBaseline || cameraJpegs.length > 1)) {
                try {
                    const ffmpegPath = await mediaManager.getFFmpegPath();
                    diffInfo = await computeFrameChange(ffmpegPath, prevRefJpeg, latestJpeg);
                } catch {
                    // optional
                }
            }

            // Only attach the previous baseline image into Stage 1 for large cloud models (>10B).
            // Compact local Ollama vision models (llava, qwen2.5vl:3b/7b, minicpm-v, moondream, etc.) frequently report a person
            // from the OLD baseline Image #1 as if they are still standing there in the current frame after they walked away!
            // Instead, we compute the pixel diff in code (computeFrameChange) and pass only the CURRENT live frame(s) to Ollama.
            const primaryProvider = chain[0]?.provider;
            const primaryModel = chain[0]?.model?.trim() || PROVIDER_DEFAULTS[chain[0].provider].model;
            const includeBaselineImage =
                hasPrevBaseline &&
                primaryProvider !== 'ollama' &&
                !isSingleImageOnlyModel(primaryModel) &&
                !/\b([1-8]b|mini|nano|small|tiny)\b/i.test(primaryModel);
            const stage1Frames = includeBaselineImage
                ? [this.lastBaselineJpeg!, ...cameraJpegs]
                : primaryProvider === 'ollama'
                    ? [latestJpeg]
                    : cameraJpegs;

            const started = Date.now();
            const built = buildPrompt(
                cameraName,
                s.rules,
                stage1Frames.length,
                interval,
                String(s.saveEvidence ?? '').startsWith('Let the AI')
                    ? s.evidenceRules || DEFAULT_EVIDENCE_RULES
                    : undefined,
                activeHint,
                diffInfo,
                hasPrevBaseline ? this.lastBaselineSummary : undefined,
                includeBaselineImage,
            );
            const stage1Req: ModelRequest = {
                system: built.system,
                prompt: built.prompt,
                jpegs: stage1Frames,
                maxTokens: 450,
                timeoutMs: this.provider.timeoutMs(),
            };

            const { text, used } = await this.runWithProviderChain(chain, stage1Req);
            const stage1 = parseStage1(text, cameraJpegs, activeHint?.objects ?? [], diffInfo);

            const bestFrame = cameraJpegs[stage1.bestFrameIndex] ?? latestJpeg;
            if (!isConfirmationRecheck) {
                this.lastBaselineJpeg = bestFrame;
                this.lastBaselineTime = now;
                this.lastBaselineSummary = stage1.summary;
            }

            const allCandidates: DetectedFaceCandidate[] = [...(activeHint?.faces ?? []), ...stage1.aiFaces];
            const evaluatedFaces = await this.evaluateFaces(allCandidates, cameraJpegs, chain);
            const evaluatedPlates = await this.evaluateAndLearnPlates(cameraName, stage1, bestFrame, chain);
            const allPlateNumbers = Array.from(new Set([...stage1.licensePlates, ...evaluatedPlates.map(p => p.plate)]));

            const windowMs = this.provider.confirmationWindowMs(); // 30s
            const knownReqFrames = this.provider.knownConfirmFrames(); // default 2
            const strangerReqFrames = this.provider.strangerConfirmFrames(); // default 3
            const knownCooldownMs = this.provider.knownCooldownMs(); // default 2 min
            const strangerCooldownMs = this.provider.strangerCooldownMs(); // default 15 min

            for (const [k, p] of this.pendingConfirmations.entries()) {
                if (now - p.firstSeen > windowMs)
                    this.pendingConfirmations.delete(k);
            }

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
                const bestJpeg = cameraJpegs[evalFace.frameIndex] ?? bestFrame;

                let pending = this.pendingConfirmations.get(key);
                if (!pending || now - pending.firstSeen > windowMs) {
                    pending = {
                        key,
                        isStranger,
                        displayName: isStranger ? `Stranger #${cluster!.id}` : evalFace.name,
                        framesSeen: frameDelta,
                        requiredFrames: reqFrames,
                        firstSeen: now,
                        lastSeen: now,
                        bestSimilarity: evalFace.bestSimilarity,
                        closestName: evalFace.bestMatchName,
                        widthPx: evalFace.widthPx,
                        bestJpeg,
                        faceBox: evalFace.box,
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
                    pending.summary = stage1.summary;
                    if (evalFace.bestSimilarity > pending.bestSimilarity) {
                        pending.bestSimilarity = evalFace.bestSimilarity;
                        pending.closestName = evalFace.bestMatchName;
                    }
                    if (evalFace.widthPx > pending.widthPx) {
                        pending.widthPx = evalFace.widthPx;
                        pending.bestJpeg = bestJpeg;
                        pending.faceBox = evalFace.box;
                    }
                }

                if (cluster)
                    cluster.framesSeen = pending.framesSeen;

                const isConfirmed = pending.framesSeen >= pending.requiredFrames;
                let note = `confirming ${Math.min(pending.framesSeen, pending.requiredFrames)}/${pending.requiredFrames}`;

                if (isConfirmed) {
                    this.pendingConfirmations.delete(key);
                    if (isStranger && cluster) {
                        // Requirement 8: Auto-learn confirmed non-recognized faces for future reference
                        if (!cluster.learnedName) {
                            const learned = await this.provider.learnUnknownFace(
                                cameraName,
                                cluster.id,
                                pending.bestJpeg,
                                pending.faceBox,
                                pending.embedding,
                            );
                            if (learned)
                                cluster.learnedName = learned;
                        }
                        if (!force && cluster.lastAlerted > 0 && now - cluster.lastAlerted < strangerCooldownMs) {
                            const minsLeft = Math.ceil((strangerCooldownMs - (now - cluster.lastAlerted)) / 60000);
                            note = `confirmed (${minsLeft}m stranger cooldown active)`;
                        } else {
                            cluster.lastAlerted = now;
                            newlyConfirmedStrangers.push({ pending, cluster });
                            note = `confirmed ${pending.requiredFrames}/${pending.requiredFrames} (${cluster.learnedName ?? `stranger #${cluster.id}`} alert)`;
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

            this.scheduleConfirmationRecheckIfNeeded();

            const unknownFacesCount = evaluatedFaces.filter(f => f.status === 'unknown').length;
            const verdict: Verdict = {
                alert: stage1.alert,
                severity: stage1.severity,
                summary: stage1.summary,
                save: stage1.save,
                objects: stage1.objects,
                faces: confirmedKnownNames,
                unknownFacesCount,
                evaluatedFaces,
                licensePlates: allPlateNumbers,
                evaluatedPlates,
                vehicles: stage1.vehicles,
                deliveryCarrier: stage1.deliveryCarrier,
                carriedItems: stage1.carriedItems,
                bestFrameIndex: stage1.bestFrameIndex,
            };

            this.console.log(
                `${used} analyzed ${cameraJpegs.length} frame(s)${hasPrevBaseline ? ' (+baseline)' : ''}${isConfirmationRecheck ? ' [re-check]' : ''} in ${Date.now() - started}ms:`,
                JSON.stringify({
                    alert: verdict.alert,
                    sceneChanged: stage1.sceneChanged,
                    pixelDiff: diffInfo ? `${diffInfo.changedPercent}% (cluster ${diffInfo.largestClusterBlocks})` : 'n/a',
                    severity: verdict.severity,
                    summary: verdict.summary,
                    objects: verdict.objects,
                    licensePlates: evaluatedPlates.map(p => `${p.plate} (${p.status}: ${p.label})`),
                    deliveryCarrier: verdict.deliveryCarrier,
                    carriedItems: verdict.carriedItems,
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

            const faceMode = String(s.faceAlertMode ?? FACE_ALERT_MODES[0]);
            const peopleEnabled = Boolean(s.detectPeople ?? true);

            // 1. Send "<Name> arrived" notifications for newly confirmed known people
            if (peopleEnabled && faceMode !== 'Only alert when an unrecognized face/stranger is seen') {
                for (const known of newlyConfirmedKnown) {
                    await this.sendArrivalOrFaceAlert(
                        `${cameraName}: ${known.displayName} arrived`,
                        `${known.displayName} recognized at ${cameraName}. ${known.summary}`,
                        'low',
                        known.bestJpeg,
                        verdict,
                        ['person', 'face'],
                        [known.displayName],
                        'none',
                        `ai-arrival-${this.id}-${known.displayName.toLowerCase()}`,
                    );
                }
            }

            // 2. Send confirmed Unrecognized Face / Stranger alerts (and auto-learned reference tag)
            if (peopleEnabled && faceMode !== 'Only alert when a recognized known face is seen') {
                for (const { pending, cluster } of newlyConfirmedStrangers) {
                    const closestInfo = pending.closestName
                        ? ` (similarity ${pending.bestSimilarity.toFixed(2)}, closest ${pending.closestName})`
                        : '';
                    const learnedTag = cluster.learnedName ? ` | Saved as ${cluster.learnedName}` : '';
                    await this.sendArrivalOrFaceAlert(
                        `${cameraName}: Unrecognized person`,
                        `Unrecognized person at ${cameraName}: ${pending.summary} [Confirmed in ${pending.framesSeen} frames, ${pending.widthPx}px${closestInfo}${learnedTag}]`,
                        pending.severity,
                        pending.bestJpeg,
                        verdict,
                        pending.objects,
                        ['unknown'],
                        pending.save,
                        `ai-stranger-${this.id}-${cluster.id}`,
                    );
                }
            }

            if (isConfirmationRecheck || newlyConfirmedKnown.length > 0 || newlyConfirmedStrangers.length > 0)
                return;

            // Filter out weather-only (falling leaves, wind, rain) and unchanged idle scenes (parked car, chair)
            if (!force && ignoreIdleAndWeather && !verdict.objects.includes('person') && confirmedKnownNames.length === 0) {
                if (stage1.weatherOrIdleOnly && (!diffInfo || !diffInfo.hasMeaningfulChange)) {
                    this.console.log(`Alert skipped (idle object or weather only): ${verdict.summary}`);
                    return;
                }
                if (hasPrevBaseline && diffInfo && !diffInfo.hasMeaningfulChange) {
                    this.console.log(
                        `Alert skipped: frame unchanged from previous (${diffInfo.changedPercent}% changed, cluster ${diffInfo.largestClusterBlocks} blocks) — idle scene.`,
                    );
                    return;
                }
            }

            // Check On/Off switches for People, Animals, Vehicles, Packages
            if (!force && !this.passesCategorySwitches(verdict.objects, confirmedKnownNames.length > 0, unknownFacesCount > 0)) {
                this.console.log(`Alert skipped: detected category [${verdict.objects.join(', ')}] is turned Off on this camera.`);
                return;
            }

            if (!force && confirmedKnownNames.length > 0) {
                const allMuted = confirmedKnownNames.every(n => this.provider.isNameSuppressed(n));
                if (allMuted || faceMode === 'Suppress alerts when only recognized known faces are seen') {
                    this.console.log(`Alert suppressed for known household member(s): ${confirmedKnownNames.join(', ')}`);
                    return;
                }
            }

            // If a known license plate is on the "Never notify for these license plates" list and no unknown person is seen, suppress alert
            if (!force && evaluatedPlates.length > 0 && !verdict.objects.includes('person')) {
                const allPlatesMuted = evaluatedPlates.every(p => this.provider.isPlateSuppressed(p.plate, p.label));
                if (allPlatesMuted) {
                    this.console.log(
                        `Alert suppressed for muted license plate(s): ${evaluatedPlates.map(p => `${p.plate} (${p.label})`).join(', ')}`,
                    );
                    return;
                }
            }

            if (!force && faceMode === 'Only alert when a recognized known face is seen' && confirmedKnownNames.length === 0)
                return;

            const order = ['low', 'medium', 'high'];
            const meetsSeverity = order.indexOf(verdict.severity) >= order.indexOf(s.minSeverity || 'low');
            if (!force && !(verdict.alert && meetsSeverity))
                return;

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

            // Build rich metadata tags (Known vs Unrecognized face, Courier, Carried items, Recognized/Learned License Plates, Objects)
            const metaTags: string[] = [];
            if (verdict.faces.length)
                metaTags.push(`Recognized: ${verdict.faces.join(', ')}`);
            else if (verdict.objects.includes('person'))
                metaTags.push('Person: Unrecognized');
            if (verdict.deliveryCarrier)
                metaTags.push(`Courier: ${verdict.deliveryCarrier}`);
            if (verdict.carriedItems.length)
                metaTags.push(`Carrying: ${verdict.carriedItems.join(', ')}`);
            if (verdict.evaluatedPlates.length) {
                const plateLabels = verdict.evaluatedPlates.map(p =>
                    p.status === 'known'
                        ? `${p.plate} (${p.label})`
                        : p.status === 'learned'
                            ? `${p.plate} (Recognized: ${p.label})`
                            : `${p.plate} (New plate saved: ${p.label})`,
                );
                metaTags.push(`Plate: ${plateLabels.join(', ')}`);
            } else if (verdict.licensePlates.length) {
                metaTags.push(`Plate: ${verdict.licensePlates.join(', ')}`);
            }
            if (verdict.vehicles.length && !verdict.summary.includes('Vehicle:'))
                metaTags.push(`Vehicle: ${verdict.vehicles.join(', ')}`);
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
                verdict,
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
        verdict: Verdict,
        objects: string[],
        faces: string[],
        plan: SavePlan,
        tag: string,
    ) {
        const s = this.storageSettings.values;
        const cameraName = systemManager.getDeviceById(this.id)?.name ?? 'Camera';
        const now = new Date();
        const timestampText = this.provider.formatTimestamp(now);
        const isoTimestamp = now.toISOString();
        const messageWithTime = `${message} (${timestampText})`;

        // Requirement 10: Save alert snapshot to destination drive (HA /media, network share, Google Drive, Dropbox, WebDAV)
        const savedInfo = await this.provider.saveAlertSnapshot(cameraName, frameJpeg, {
            title,
            message: messageWithTime,
            timestamp: timestampText,
            isoTimestamp,
            cameraId: this.id,
            cameraName,
            severity,
            objects,
            faces,
            licensePlates: verdict.licensePlates,
            vehicles: verdict.vehicles,
            deliveryCarrier: verdict.deliveryCarrier,
            carriedItems: verdict.carriedItems,
        });
        if (savedInfo.uploadedDestinations.length)
            this.console.log(`Snapshot saved to: ${savedInfo.uploadedDestinations.join(', ')}`);
        for (const err of savedInfo.errors)
            this.console.warn(`Snapshot storage warning: ${err}`);

        const needsFrame = plan === 'snapshot' || plan === 'both';
        const media =
            s.attachSnapshot || needsFrame
                ? await mediaManager.createMediaObject(frameJpeg, 'image/jpeg')
                : undefined;

        const alert = await this.provider.sendAlert({
            title,
            message: messageWithTime,
            rawSummary: verdict.summary,
            timestampText,
            isoTimestamp,
            cameraId: this.id,
            cameraName,
            severity,
            channels: asList(s.channels),
            jpeg: s.attachSnapshot ? frameJpeg : undefined,
            haCameraEntity: String(s.haCameraEntity ?? '').trim() || undefined,
            haImageUrl: savedInfo.haMediaUrl,
            savedSnapshotPath: savedInfo.localPath,
            tag,
            objects,
            faces,
            unknownFacesCount: verdict.unknownFacesCount,
            licensePlates: verdict.licensePlates,
            vehicles: verdict.vehicles,
            deliveryCarrier: verdict.deliveryCarrier,
            carriedItems: verdict.carriedItems,
        });
        if (alert.sent.length)
            this.console.log(`Alert sent (${title}) via: ${alert.sent.join(', ')}`);
        for (const e of alert.errors)
            this.console.error(`Notification failed - ${e}`);
        if (!alert.configured)
            this.console.warn('No notification channel is configured on the AI Vision Alerts plugin page.');

        const notifierIds: string[] = Array.isArray(s.notifiers) ? s.notifiers : s.notifiers ? [s.notifiers] : [];
        for (const id of notifierIds) {
            const notifier = systemManager.getDeviceById<Notifier>(id);
            if (!notifier)
                continue;
            const devInfo = systemManager.getDeviceById(id);
            const isHomeAssistantNotifier =
                (devInfo?.pluginId === '@scrypted/homeassistant' ||
                    /home\s*assistant|ha\s*notify|mobile_app|iphone|ipad/i.test(
                        `${devInfo?.name ?? ''} ${devInfo?.nativeId ?? ''} ${devInfo?.type ?? ''}`,
                    )) &&
                this.provider.haConfigured();
            if (isHomeAssistantNotifier && alert.sent.includes('Home Assistant')) {
                // Already delivered via our built-in Home Assistant channel (Persistent + Mobile App);
                // skip duplicate call to @scrypted/homeassistant Notifier which often throws HTTP 400 on custom options/media.
                continue;
            }
            try {
                await notifier.sendNotification(
                    title,
                    {
                        body: messageWithTime,
                        tag: 'ai-vision-alerts',
                        data: {
                            source: 'ai-vision-alerts',
                            cameraId: this.id,
                            cameraName,
                            timestamp: timestampText,
                            isoTimestamp,
                            severity,
                            summary: messageWithTime,
                            objects,
                            faces,
                            licensePlates: verdict.licensePlates,
                            vehicles: verdict.vehicles,
                            deliveryCarrier: verdict.deliveryCarrier,
                            carriedItems: verdict.carriedItems,
                            savedSnapshotPath: savedInfo.localPath,
                            save: plan,
                        },
                    },
                    media,
                );
            } catch (e) {
                // Retry with minimal payload if the notifier rejected custom data/media
                try {
                    await notifier.sendNotification(title, { body: messageWithTime });
                } catch {
                    if (!alert.sent.includes('Home Assistant'))
                        this.console.error(`Notification to ${id} failed`, e);
                }
            }
        }
    }
}

/* ------------------------------------------------------------------ */
/* Plugin (provider, face learning, storage, webhook, notifications)    */
/* ------------------------------------------------------------------ */

export default class AIAlertsPlugin extends ScryptedDeviceBase implements MixinProvider, Settings {
    callsToday = 0;
    callsDay = new Date().toDateString();
    faceCacheKey = '';
    faceCache: FaceReference[] = [];
    recentLines: string[] = [];
    recentPlateLines: string[] = [];
    learnedPlatesMap = new Map<string, KnownPlateEntry>();
    learnedPlatesLoaded = false;
    lastSnapshotCleanup = 0;

    storageSettings = new StorageSettings(this, {
        /* ---------------- AI provider selection ---------------- */
        aiProvider: {
            group: 'AI provider',
            title: 'AI provider',
            description: 'Works with all AI providers and vision models (Claude, OpenAI, Gemini, local Ollama, and any OpenAI-compatible server).',
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
        locationTimeZone: {
            group: 'AI provider',
            title: 'Device / Location time zone (optional)',
            description:
                'IANA time zone used to stamp date & time on every alert (e.g. America/Los_Angeles, America/New_York, Europe/London). ' +
                'Leave blank to automatically use your server/device local time zone.',
            placeholder: 'America/Los_Angeles',
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
                'Sends a text-only request to the main (and fallback) provider and logs the result in this plugin\'s console.',
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
                'Distinguishes known faces from unrecognized faces, auto-learns new faces, and alerts on both.',
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
            defaultValue: '/media/faces',
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
        autoLearnUnknownFaces: {
            group: 'Face & Object Recognition',
            title: 'Auto-learn non-recognized faces for future reference',
            description:
                'Automatically crops and saves confirmed unrecognized faces to the Learned faces directory below so they can be recognized on future visits (rename the saved .jpg file to the person\'s name anytime).',
            type: 'boolean',
            defaultValue: true,
        },
        learnedFacesDir: {
            group: 'Face & Object Recognition',
            title: 'Learned faces directory',
            description:
                'Where newly learned non-recognized faces are saved and loaded from. On Home Assistant OS add-on, /media/faces/learned is accessible directly in HA Media.',
            placeholder: '/media/faces/learned',
            defaultValue: '/media/faces/learned',
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
            defaultValue: 8,
        },
        testKnownFaces: {
            group: 'Face & Object Recognition',
            title: 'Load & verify enrolled + learned faces',
            description: 'Reloads reference face photos from the known and learned directories/list and logs the results in the console.',
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

        /* ---------------- License Plate Recognition (LPR / ALPR) ---------------- */
        enablePlateRecognition: {
            group: 'License Plate Recognition (LPR)',
            title: 'Enable license plate reading & recognition',
            description:
                'Reads license plate numbers on vehicles, matches them against known & learned plates, and saves new plates for future reference.',
            type: 'boolean',
            defaultValue: true,
        },
        knownPlatesEntries: {
            group: 'License Plate Recognition (LPR)',
            title: 'Known license plates (Owner / Vehicle Label = PLATE)',
            description:
                'One vehicle per line as "Label = PLATE_NUMBER" (spaces/hyphens ignored; handles OCR-confusable characters like 0/O and 8/B). ' +
                'Example: Red Tesla (Tai) = 8ABC123',
            type: 'textarea',
            placeholder: 'Red Tesla (Tai) = 8ABC123\nFamily SUV = 7XYZ999',
        },
        autoLearnUnknownPlates: {
            group: 'License Plate Recognition (LPR)',
            title: 'Auto-learn & save unrecognized license plates for future reference',
            description:
                'Automatically saves every new license plate number and vehicle snapshot to the Learned plates directory below so returning vehicles are recognized.',
            type: 'boolean',
            defaultValue: true,
        },
        learnedPlatesDir: {
            group: 'License Plate Recognition (LPR)',
            title: 'Learned license plates directory',
            description:
                'Where snapshots and the learned license plate database (plates_db.json) are stored. On Home Assistant OS add-on, /media/plates/learned is in HA Media.',
            placeholder: '/media/plates/learned',
            defaultValue: '/media/plates/learned',
        },
        neverNotifyPlates: {
            group: 'License Plate Recognition (LPR)',
            title: 'Never notify for these license plates / owners',
            description:
                'Comma-separated plate numbers or owner labels to silence when no stranger is present (or type "family" to silence all Known license plates above).',
            placeholder: '8ABC123, Red Tesla (Tai)',
            defaultValue: '',
        },
        recentPlates: {
            group: 'License Plate Recognition (LPR)',
            title: 'Learned & recent license plates',
            description:
                'Lists every read license plate with timestamp, camera, plate number, matched owner or auto-learned vehicle description.',
            type: 'textarea',
            readonly: true,
            defaultValue: 'No license plates recorded yet.',
        },
        clearRecentPlates: {
            group: 'License Plate Recognition (LPR)',
            title: 'Clear recent license plates log',
            type: 'button',
            onPut: async () => {
                this.recentPlateLines = [];
                await this.storageSettings.putSetting('recentPlates', 'No license plates recorded yet.');
                this.console.log('Cleared recent license plates log.');
            },
        },

        /* ---------------- Snapshot Storage (HA Disk, Network Drive, Google Drive, Dropbox, WebDAV) ---------------- */
        saveSnapshots: {
            group: 'Snapshot Storage & Cloud Backup',
            title: 'Save notification snapshots to destination drive',
            description: 'Automatically saves a JPEG snapshot (and metadata JSON) for every alert to the destination folder and/or cloud storage below.',
            type: 'boolean',
            defaultValue: true,
        },
        snapshotDir: {
            group: 'Snapshot Storage & Cloud Backup',
            title: 'Destination folder (Home Assistant disk, local drive, or network share)',
            description:
                'On Home Assistant OS add-on, use /media/ai-alerts (HA Media browser), /share/ai-alerts, or /config/www/ai-alerts. ' +
                'On Windows/macOS/Linux, use any local folder or mounted SMB/NFS network drive (e.g. \\\\NAS\\alerts or /mnt/nas/alerts).',
            placeholder: '/media/ai-alerts',
            defaultValue: '/media/ai-alerts',
        },
        autoDeleteSnapshots: {
            group: 'Snapshot Storage & Cloud Backup',
            title: 'Automatically delete old snapshots',
            description:
                'Automatically deletes saved snapshots and metadata files older than the retention days below so your Home Assistant disk or drive never fills up.',
            type: 'boolean',
            defaultValue: true,
        },
        snapshotRetentionDays: {
            group: 'Snapshot Storage & Cloud Backup',
            title: 'Delete snapshots older than (days)',
            description: 'Snapshots and date folders older than this many days (e.g. 7, 14, 30) are deleted automatically.',
            type: 'number',
            defaultValue: 14,
        },
        cleanupSnapshotsNow: {
            group: 'Snapshot Storage & Cloud Backup',
            title: 'Delete expired snapshots now',
            description: 'Immediately scans the destination drive (and configured cloud folders) and deletes snapshots older than your retention days.',
            type: 'button',
            onPut: async () => {
                await this.cleanupOldSnapshots(true);
            },
        },
        gdriveAccessToken: {
            group: 'Snapshot Storage & Cloud Backup',
            title: 'Google Drive OAuth access token (optional)',
            description: 'Uploads alert snapshots directly to your Google Drive.',
            type: 'password',
        },
        gdriveFolderId: {
            group: 'Snapshot Storage & Cloud Backup',
            title: 'Google Drive Folder ID (optional)',
            description: 'The folder ID from the Google Drive URL where snapshots should be uploaded (blank uploads to root).',
        },
        dropboxAccessToken: {
            group: 'Snapshot Storage & Cloud Backup',
            title: 'Dropbox Access Token (optional)',
            description: 'Create a token in the Dropbox App Console (files.content.write scope) to upload snapshots to Dropbox.',
            type: 'password',
        },
        dropboxFolder: {
            group: 'Snapshot Storage & Cloud Backup',
            title: 'Dropbox destination folder',
            description: 'Folder path inside Dropbox (e.g. /AI-Vision-Alerts).',
            placeholder: '/AI-Vision-Alerts',
            defaultValue: '/AI-Vision-Alerts',
        },
        webdavUrl: {
            group: 'Snapshot Storage & Cloud Backup',
            title: 'WebDAV / Nextcloud / Synology / Cloud folder URL (optional)',
            description: 'Uploads snapshots via HTTP PUT to any WebDAV server, Nextcloud, OwnCloud, or cloud storage gateway.',
            placeholder: 'https://nextcloud.example.com/remote.php/dav/files/user/AI-Alerts',
        },
        webdavUsername: {
            group: 'Snapshot Storage & Cloud Backup',
            title: 'WebDAV username (optional)',
        },
        webdavPassword: {
            group: 'Snapshot Storage & Cloud Backup',
            title: 'WebDAV password / app token (optional)',
            type: 'password',
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
            description: 'Works with any Ollama vision model: llama3.2-vision, llava, qwen2.5vl, gemma3, minicpm-v, etc.',
            placeholder: 'llama3.2-vision',
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
            description:
                'e.g. http://192.168.100.2:8123. When running as a Home Assistant OS add-on, can also auto-connect via Supervisor if left blank.',
            placeholder: 'http://192.168.100.2:8123',
        },
        haToken: {
            group: 'Notify: Home Assistant',
            title: 'Long-lived access token',
            description: 'Home Assistant > your profile > Security > Long-lived access tokens > Create token.',
            type: 'password',
        },
        haPersistentNotification: {
            group: 'Notify: Home Assistant',
            title: 'Send Home Assistant persistent notification (sidebar bell)',
            description: 'Creates a persistent notification inside Home Assistant\'s Notifications panel on every alert.',
            type: 'boolean',
            defaultValue: true,
        },
        haNotifyServices: {
            group: 'Notify: Home Assistant',
            title: 'Mobile / Notify service(s) (optional)',
            description:
                'Comma-separated, without the "notify." prefix, e.g. mobile_app_pixel_9, mobile_app_iphone. ' +
                'If left blank, automatically discovers all registered notify.mobile_app_* devices in Home Assistant!',
        },

        /* ---------------- Webhook (Tesla, Android/Fire TV, Home Assistant, Custom) ---------------- */
        webhookUrls: {
            group: 'Notify: Webhook (Tesla, Android/Fire TV, HA)',
            title: 'Webhook URL(s)',
            description:
                'One or more HTTP/HTTPS POST URLs (comma or newline separated). ' +
                'Supports Home Assistant webhooks (http://ha:8123/api/webhook/ai_alert), Android TV / Fire TV Pipup overlays (http://tv-ip:7979/notify), ' +
                'Tesla car notification webhooks, Node-RED, n8n, Discord, or custom servers.',
            type: 'textarea',
            placeholder: 'http://192.168.100.2:8123/api/webhook/ai_vision_alert\nhttp://192.168.100.50:7979/notify',
        },
        webhookToken: {
            group: 'Notify: Webhook (Tesla, Android/Fire TV, HA)',
            title: 'Webhook Bearer token / secret (optional)',
            description: 'Sent as Authorization: Bearer <token> and X-Webhook-Secret header.',
            type: 'password',
        },
        webhookIncludeImage: {
            group: 'Notify: Webhook (Tesla, Android/Fire TV, HA)',
            title: 'Include base64 snapshot image in Webhook JSON',
            description: 'Embeds the alert JPEG in the JSON payload (and formats media for Android TV / Fire TV Pipup display).',
            type: 'boolean',
            defaultValue: true,
        },
        webhookVideoStreamUrl: {
            group: 'Notify: Webhook (Tesla, Android/Fire TV, HA)',
            title: 'Video / Stream URL for Android/Fire TV or Tesla (optional)',
            description: 'Optional stream or dashboard URL included in webhook payloads for TV popups and car browser links.',
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
            description: 'Tests Home Assistant (persistent + mobile), Webhook, ntfy, Pushover, and Telegram. Check this plugin\'s console.',
            type: 'button',
            onPut: async () => {
                const now = new Date();
                const ts = this.formatTimestamp(now);
                const result = await this.sendAlert({
                    title: 'AI Vision Alerts',
                    message: `Test notification from Scrypted (${ts}).`,
                    rawSummary: 'Test notification from Scrypted.',
                    timestampText: ts,
                    isoTimestamp: now.toISOString(),
                    cameraName: 'Test Camera',
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
        if (
            [
                'enableFaceRecognition',
                'knownFacesDir',
                'knownFacesEntries',
                'learnedFacesDir',
                'autoLearnUnknownFaces',
                'maxFaceReferences',
            ].includes(key)
        ) {
            this.faceCacheKey = '';
        }
        if (key === 'learnedPlatesDir') {
            this.learnedPlatesLoaded = false;
            this.learnedPlatesMap.clear();
        }
    }

    formatTimestamp(date = new Date()): string {
        return formatDeviceDateTime(date, String(this.storageSettings.values.locationTimeZone ?? ''));
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
        return 30 * 1000;
    }

    knownCooldownMs(): number {
        return Math.max(0.5, Number(this.storageSettings.values.knownCooldownMinutes ?? 2)) * 60 * 1000;
    }

    strangerCooldownMs(): number {
        return Math.max(1, Number(this.storageSettings.values.strangerCooldownMinutes ?? 15)) * 60 * 1000;
    }

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

    /* ---------------- License Plate Recognition & Auto-Learning ---------------- */

    isPlateRecognitionEnabled(): boolean {
        return Boolean(this.storageSettings.values.enablePlateRecognition ?? true);
    }

    isPlateSuppressed(plate: string, label: string): boolean {
        const raw = String(this.storageSettings.values.neverNotifyPlates ?? '').trim();
        if (!raw)
            return false;
        const entries = raw
            .split(',')
            .map(s => s.trim().toLowerCase())
            .filter(Boolean);
        if (entries.includes('all') || entries.includes('*'))
            return true;
        const normPlate = cleanPlateString(plate).toLowerCase();
        const normLabel = label.trim().toLowerCase();
        // If "family" is specified, suppress any plate explicitly listed in Known license plates
        if (entries.includes('family')) {
            const known = this.parseKnownPlatesList();
            if (known.some(k => plateSimilarity(k.plate, plate) >= 0.85))
                return true;
        }
        return entries.some(e => cleanPlateString(e).toLowerCase() === normPlate || e === normLabel);
    }

    parseKnownPlatesList(): KnownPlateEntry[] {
        const raw = String(this.storageSettings.values.knownPlatesEntries ?? '').trim();
        if (!raw)
            return [];
        const out: KnownPlateEntry[] = [];
        for (const line of raw.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#'))
                continue;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx <= 0)
                continue;
            const left = trimmed.slice(0, eqIdx).trim();
            const right = trimmed.slice(eqIdx + 1).trim();
            if (!left || !right)
                continue;
            // Support either "Label = PLATE" or "PLATE = Label"
            const rightClean = cleanPlateString(right);
            const leftClean = cleanPlateString(left);
            if (isValidPlateCandidate(right) && rightClean.length <= 9 && !/\s/.test(right)) {
                out.push({ plate: rightClean, normalizedKey: canonicalPlateSkeleton(rightClean), label: left, isLearned: false });
            } else if (isValidPlateCandidate(left) && leftClean.length <= 9 && !/\s/.test(left)) {
                out.push({ plate: leftClean, normalizedKey: canonicalPlateSkeleton(leftClean), label: right, isLearned: false });
            } else {
                out.push({ plate: rightClean, normalizedKey: canonicalPlateSkeleton(rightClean), label: left, isLearned: false });
            }
        }
        return out;
    }

    async ensureLearnedPlatesLoaded(): Promise<void> {
        if (this.learnedPlatesLoaded)
            return;
        this.learnedPlatesLoaded = true;
        const dir = String(this.storageSettings.values.learnedPlatesDir ?? '/media/plates/learned').trim();
        if (!dir)
            return;
        try {
            const dbPath = path.join(path.resolve(dir), 'plates_db.json');
            const raw = await fs.readFile(dbPath, 'utf-8');
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
                for (const item of arr) {
                    if (item?.plate && item?.label) {
                        const clean = cleanPlateString(String(item.plate));
                        if (!isValidPlateCandidate(clean))
                            continue;
                        this.learnedPlatesMap.set(clean, {
                            plate: clean,
                            normalizedKey: canonicalPlateSkeleton(clean),
                            label: String(item.label),
                            isLearned: true,
                            firstSeen: item.firstSeen ? String(item.firstSeen) : undefined,
                        });
                    }
                }
            }
        } catch {
            // plates_db.json does not exist yet
        }
    }

    async matchOrLearnPlate(
        cameraName: string,
        rawPlate: string,
        vehicleDesc: string | undefined,
        confidence: number,
        frameJpeg: Buffer,
        box?: [number, number, number, number],
    ): Promise<EvaluatedPlate> {
        const plate = cleanPlateString(rawPlate);
        await this.ensureLearnedPlatesLoaded();

        // 1. Check against user's Known license plates list (with fuzzy OCR-confusable matching >= 0.85)
        const knownList = this.parseKnownPlatesList();
        let bestKnown: KnownPlateEntry | undefined;
        let bestKnownSim = 0;
        for (const k of knownList) {
            const sim = plateSimilarity(plate, k.plate);
            if (sim >= 0.85 && sim > bestKnownSim) {
                bestKnownSim = sim;
                bestKnown = k;
            }
        }
        if (bestKnown) {
            const result: EvaluatedPlate = {
                plate: bestKnown.plate,
                status: 'known',
                label: bestKnown.label,
                vehicleDesc,
                confidence,
                box,
            };
            this.recordPlateRecognition(cameraName, result);
            return result;
        }

        // 2. Check against previously auto-learned plates (with fuzzy OCR-confusable matching >= 0.86)
        let bestLearned: KnownPlateEntry | undefined;
        let bestLearnedSim = 0;
        for (const l of this.learnedPlatesMap.values()) {
            const sim = plateSimilarity(plate, l.plate);
            if (sim >= 0.86 && sim > bestLearnedSim) {
                bestLearnedSim = sim;
                bestLearned = l;
            }
        }
        if (bestLearned) {
            const result: EvaluatedPlate = {
                plate: bestLearned.plate,
                status: 'learned',
                label: bestLearned.label,
                vehicleDesc,
                confidence,
                box,
            };
            this.recordPlateRecognition(cameraName, result);
            return result;
        }

        // 3. Brand new plate: auto-learn and save snapshot + database entry to learnedPlatesDir
        const ts = this.formatTimestamp(new Date());
        const label = vehicleDesc ? `${vehicleDesc} (first seen ${ts})` : `Vehicle at ${cameraName} (first seen ${ts})`;
        let savedPath: string | undefined;

        const v = this.storageSettings.values;
        if (v.autoLearnUnknownPlates) {
            const dir = String(v.learnedPlatesDir ?? '/media/plates/learned').trim();
            if (dir) {
                try {
                    const resolvedDir = path.resolve(dir);
                    await fs.mkdir(resolvedDir, { recursive: true });
                    let snapshotToSave = frameJpeg;
                    if (box) {
                        try {
                            const ffmpegPath = await mediaManager.getFFmpegPath();
                            snapshotToSave = await cropFaceJpeg(ffmpegPath, frameJpeg, box);
                        } catch {
                            snapshotToSave = frameJpeg;
                        }
                    }
                    const safeVeh = (vehicleDesc ?? cameraName).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
                    const imgFile = path.join(resolvedDir, `Plate_${plate}_${safeVeh}.jpg`);
                    await fs.writeFile(imgFile, snapshotToSave);
                    savedPath = imgFile;

                    const entry: KnownPlateEntry = {
                        plate,
                        normalizedKey: canonicalPlateSkeleton(plate),
                        label,
                        isLearned: true,
                        firstSeen: ts,
                    };
                    this.learnedPlatesMap.set(plate, entry);
                    const dbPath = path.join(resolvedDir, 'plates_db.json');
                    await fs.writeFile(dbPath, JSON.stringify(Array.from(this.learnedPlatesMap.values()), null, 2));
                    this.console.log(`Auto-learned new license plate "${plate}" (${label}) -> saved to ${imgFile}`);
                } catch (e) {
                    this.console.warn(`Could not save learned plate "${plate}": ${errMsg(e)}`);
                }
            }
        }

        const result: EvaluatedPlate = {
            plate,
            status: 'new',
            label: vehicleDesc || 'New vehicle',
            vehicleDesc,
            confidence,
            box,
            savedPath,
        };
        this.recordPlateRecognition(cameraName, result);
        return result;
    }

    recordPlateRecognition(cameraName: string, ep: EvaluatedPlate) {
        const ts = this.formatTimestamp(new Date());
        const statusDesc =
            ep.status === 'known'
                ? `KNOWN (${ep.label})`
                : ep.status === 'learned'
                    ? `RECOGNIZED LEARNED PLATE (${ep.label})`
                    : `NEW PLATE SAVED (${ep.label})`;
        const line = `${ts} [${cameraName}] Plate: ${ep.plate} — ${statusDesc}`;

        if (!this.recentPlateLines.length) {
            const existing = String(this.storageSettings.values.recentPlates ?? '');
            if (existing && !existing.startsWith('No license plates'))
                this.recentPlateLines = existing.split('\n').filter(Boolean);
        }
        this.recentPlateLines.unshift(line);
        if (this.recentPlateLines.length > 30)
            this.recentPlateLines.length = 30;

        this.storageSettings.putSetting('recentPlates', this.recentPlateLines.join('\n')).catch(() => {});
        this.console.log(`License plate: ${line}`);
    }

    recordRecognition(
        cameraName: string,
        ef: EvaluatedFace,
        _framesSeen: number,
        _requiredFrames: number,
        statusNote: string,
    ) {
        const ts = this.formatTimestamp(new Date());
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

    /** Requirement 8: Auto-learns a confirmed unrecognized face by saving its crop to `learnedFacesDir` and adding it to memory. */
    async learnUnknownFace(
        cameraName: string,
        clusterId: number,
        frameJpeg: Buffer,
        box: [number, number, number, number],
        embedding?: number[],
    ): Promise<string | undefined> {
        const v = this.storageSettings.values;
        if (!v.autoLearnUnknownFaces)
            return undefined;
        const learnedDir = String(v.learnedFacesDir ?? '/media/faces/learned').trim();
        if (!learnedDir)
            return undefined;

        try {
            const ffmpegPath = await mediaManager.getFFmpegPath();
            const cropped = await cropFaceJpeg(ffmpegPath, frameJpeg, box);
            const resolvedDir = path.resolve(learnedDir);
            await fs.mkdir(resolvedDir, { recursive: true });

            // Check if this face already matches an existing learned face in memory
            for (const existing of this.faceCache) {
                if (existing.isLearned && embedding && existing.embedding && cosineSimilarity(embedding, existing.embedding) >= 0.75) {
                    return existing.name;
                }
            }

            const existingFiles = await fs.readdir(resolvedDir).catch(() => [] as string[]);
            const nextNum = existingFiles.filter(f => /\.(jpg|jpeg|png)$/i.test(f)).length + 1;
            const learnedName = `Visitor_${nextNum}`;
            const safeCam = cameraName.replace(/[^a-zA-Z0-9_-]/g, '_');
            const fileName = `${learnedName}_${safeCam}_1.jpg`;
            const filePath = path.join(resolvedDir, fileName);
            await fs.writeFile(filePath, cropped);

            this.faceCache.push({
                name: learnedName,
                jpeg: cropped,
                source: filePath,
                embedding,
                isLearned: true,
            });
            this.console.log(`Auto-learned new face as "${learnedName}" saved to ${filePath} (rename file to person's name to label them).`);
            return learnedName;
        } catch (e) {
            this.console.warn(`Could not save learned face to "${learnedDir}": ${errMsg(e)}`);
            return `Stranger_${clusterId}`;
        }
    }

    /* ---------------- Known & Learned faces loading & caching ---------------- */

    async getKnownFaceNames(): Promise<string[]> {
        const refs = await this.getKnownFaces(false);
        return Array.from(new Set(refs.map(r => r.name)));
    }

    async getKnownFaces(forceReload = false): Promise<FaceReference[]> {
        const v = this.storageSettings.values;
        if (!v.enableFaceRecognition)
            return [];

        const dir = String(v.knownFacesDir ?? '').trim();
        const learnedDir = v.autoLearnUnknownFaces ? String(v.learnedFacesDir ?? '').trim() : '';
        const entriesText = String(v.knownFacesEntries ?? '').trim();
        const maxRefs = Math.min(25, Math.max(1, Math.round(Number(v.maxFaceReferences ?? 8))));
        const cacheKey = `${dir}|${learnedDir}|${entriesText}|${maxRefs}`;

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

        const buildRef = async (name: string, raw: Buffer, ext: string, source: string, isLearned = false): Promise<FaceReference> => {
            const jpeg = await normalizeReferenceJpeg(raw, ext);
            let embedding: number[] | undefined;
            if (ffmpegPath) {
                const patch = await analyzeFacePatch(ffmpegPath, jpeg, [0.15, 0.1, 0.7, 0.8]);
                embedding = patch?.embedding;
            }
            return { name, jpeg, source, embedding, isLearned };
        };

        const scanDirectory = async (folder: string, isLearnedFolder: boolean) => {
            if (!folder || loaded.length >= maxRefs)
                return;
            try {
                const resolvedDir = path.resolve(folder);
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
                            loaded.push(await buildRef(person, raw, ext, fullPath, isLearnedFolder));
                        } catch (e) {
                            this.console.warn(`Could not load face image ${fullPath}: ${errMsg(e)}`);
                        }
                    } else if (entry.isDirectory()) {
                        if (fullPath === path.resolve(learnedDir) && !isLearnedFolder)
                            continue; // avoid scanning learned subfolder twice
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
                                    loaded.push(await buildRef(person, raw, ext, subPath, isLearnedFolder));
                                } catch (e) {
                                    this.console.warn(`Could not load face image ${subPath}: ${errMsg(e)}`);
                                }
                            }
                        } catch (e) {
                            this.console.warn(`Could not read face subfolder ${fullPath}: ${errMsg(e)}`);
                        }
                    }
                }
            } catch {
                // directory may not exist yet until first face is learned
            }
        };

        await scanDirectory(dir, false);
        if (learnedDir && path.resolve(learnedDir) !== (dir ? path.resolve(dir) : ''))
            await scanDirectory(learnedDir, true);

        if (entriesText && loaded.length < maxRefs) {
            const lines = entriesText.split(/\r?\n/);
            for (const line of lines) {
                if (loaded.length >= maxRefs)
                    break;
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#'))
                    continue;
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx <= 0)
                    continue;
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
                    loaded.push(await buildRef(name, raw, ext, target, false));
                } catch (e) {
                    this.console.warn(`Could not load known face for "${name}" from "${target}": ${errMsg(e)}`);
                }
            }
        }

        this.faceCacheKey = cacheKey;
        this.faceCache = loaded;
        return loaded;
    }

    /* ---------------- Snapshot Storage (HA Disk, Network Drive, Google Drive, Dropbox, WebDAV) ---------------- */

    async saveAlertSnapshot(
        cameraName: string,
        jpeg: Buffer,
        metadata: Record<string, unknown>,
    ): Promise<SavedSnapshotInfo> {
        const v = this.storageSettings.values;
        const info: SavedSnapshotInfo = { uploadedDestinations: [], errors: [] };
        if (!v.saveSnapshots)
            return info;

        const now = new Date();
        const { dateFolder, fileStamp } = formatSafeFileTimestamp(now, String(v.locationTimeZone ?? ''));
        const safeCam = cameraName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Camera';
        const fileName = `${fileStamp}_${safeCam}.jpg`;

        // 1. Save to local / Home Assistant / mounted network drive folder
        const dir = String(v.snapshotDir ?? '/media/ai-alerts').trim();
        if (dir) {
            try {
                const camDateDir = path.join(path.resolve(dir), safeCam, dateFolder);
                await fs.mkdir(camDateDir, { recursive: true });
                const fullFilePath = path.join(camDateDir, fileName);
                const latestPath = path.join(path.resolve(dir), safeCam, 'latest.jpg');
                const metaPath = path.join(camDateDir, `${fileStamp}_${safeCam}.json`);

                await fs.writeFile(fullFilePath, jpeg);
                await fs.writeFile(latestPath, jpeg).catch(() => {});
                await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2)).catch(() => {});

                info.localPath = fullFilePath;
                info.uploadedDestinations.push(fullFilePath);

                // If saved inside Home Assistant's /config/www or /media, expose the HA-accessible path for phone notifications
                const normDir = dir.replace(/\\/g, '/').replace(/\/+$/, '');
                if (normDir.startsWith('/config/www/')) {
                    const rel = normDir.slice('/config/www/'.length);
                    info.haMediaUrl = `/local/${rel}/${safeCam}/${dateFolder}/${fileName}`;
                } else if (normDir === '/config/www') {
                    info.haMediaUrl = `/local/${safeCam}/${dateFolder}/${fileName}`;
                } else if (normDir.startsWith('/media/')) {
                    const rel = normDir.slice('/media/'.length);
                    info.haMediaUrl = `/media/local/${rel}/${safeCam}/${dateFolder}/${fileName}`;
                } else if (normDir === '/media') {
                    info.haMediaUrl = `/media/local/${safeCam}/${dateFolder}/${fileName}`;
                }
            } catch (e) {
                info.errors.push(`Local/HA disk (${dir}): ${errMsg(e)}`);
            }
        }

        // 2. Upload to Google Drive (if OAuth access token is configured)
        const gdriveToken = String(v.gdriveAccessToken ?? '').trim();
        if (gdriveToken) {
            try {
                const folderId = String(v.gdriveFolderId ?? '').trim();
                const driveMeta: Record<string, unknown> = {
                    name: fileName,
                    mimeType: 'image/jpeg',
                    description: String(metadata.message ?? ''),
                };
                if (folderId)
                    driveMeta.parents = [folderId];

                const boundary = `-------scryptedAiAlerts${Date.now()}`;
                const metaPart = Buffer.from(
                    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(driveMeta)}\r\n--${boundary}\r\nContent-Type: image/jpeg\r\n\r\n`,
                    'utf-8',
                );
                const endPart = Buffer.from(`\r\n--${boundary}--`, 'utf-8');
                const body = Buffer.concat([metaPart, jpeg, endPart]);

                await fetchOk('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                    method: 'POST',
                    headers: {
                        authorization: `Bearer ${gdriveToken}`,
                        'content-type': `multipart/related; boundary=${boundary}`,
                    },
                    body: new Uint8Array(body),
                });
                info.uploadedDestinations.push(`Google Drive (${fileName})`);
            } catch (e) {
                info.errors.push(`Google Drive: ${errMsg(e)}`);
            }
        }

        // 3. Upload to Dropbox (if Dropbox access token is configured)
        const dropboxToken = String(v.dropboxAccessToken ?? '').trim();
        if (dropboxToken) {
            try {
                const folder = (String(v.dropboxFolder ?? '/AI-Vision-Alerts').trim() || '/AI-Vision-Alerts').replace(/\/+$/, '');
                const dropboxPath = `${folder.startsWith('/') ? folder : '/' + folder}/${safeCam}/${dateFolder}/${fileName}`;
                await fetchOk('https://content.dropboxapi.com/2/files/upload', {
                    method: 'POST',
                    headers: {
                        authorization: `Bearer ${dropboxToken}`,
                        'content-type': 'application/octet-stream',
                        'dropbox-api-arg': JSON.stringify({
                            path: dropboxPath,
                            mode: 'add',
                            autorename: true,
                            mute: true,
                        }),
                    },
                    body: new Uint8Array(jpeg),
                });
                info.uploadedDestinations.push(`Dropbox (${dropboxPath})`);
            } catch (e) {
                info.errors.push(`Dropbox: ${errMsg(e)}`);
            }
        }

        // 4. Upload to WebDAV / Nextcloud / Cloud HTTP PUT URL (if configured)
        const webdavBase = String(v.webdavUrl ?? '').trim().replace(/\/+$/, '');
        if (webdavBase) {
            try {
                const headers: Record<string, string> = { 'content-type': 'image/jpeg' };
                const user = String(v.webdavUsername ?? '').trim();
                const pass = String(v.webdavPassword ?? '').trim();
                if (user || pass)
                    headers.authorization = `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
                await fetchOk(`${webdavBase}/${encodeURIComponent(fileName)}`, {
                    method: 'PUT',
                    headers,
                    body: new Uint8Array(jpeg),
                });
                info.uploadedDestinations.push(`WebDAV (${fileName})`);
            } catch (e) {
                info.errors.push(`WebDAV: ${errMsg(e)}`);
            }
        }

        // Periodically run automatic snapshot retention cleanup in the background (at most once every 6 hours)
        const nowMs = Date.now();
        if (Boolean(v.autoDeleteSnapshots ?? true) && nowMs - this.lastSnapshotCleanup > 6 * 60 * 60 * 1000) {
            this.lastSnapshotCleanup = nowMs;
            this.cleanupOldSnapshots(false).catch(e => this.console.warn('Auto snapshot cleanup error:', errMsg(e)));
        }

        return info;
    }

    /** Automatically deletes saved snapshots and date folders older than `snapshotRetentionDays` days. */
    async cleanupOldSnapshots(forceLog = false): Promise<void> {
        const v = this.storageSettings.values;
        if (!forceLog && !Boolean(v.autoDeleteSnapshots ?? true))
            return;

        const days = Math.max(1, Number(v.snapshotRetentionDays ?? 14));
        const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;
        const { dateFolder: cutoffDateStr } = formatSafeFileTimestamp(new Date(cutoffMs), String(v.locationTimeZone ?? ''));
        let deletedLocal = 0;
        let deletedCloud = 0;

        // 1. Clean up local / Home Assistant disk / mounted network share
        const dir = String(v.snapshotDir ?? '/media/ai-alerts').trim();
        if (dir) {
            try {
                const rootDir = path.resolve(dir);
                const camDirs = await fs.readdir(rootDir, { withFileTypes: true }).catch(() => []);
                for (const camEntry of camDirs) {
                    const camPath = path.join(rootDir, camEntry.name);
                    if (!camEntry.isDirectory())
                        continue;
                    const subEntries = await fs.readdir(camPath, { withFileTypes: true }).catch(() => []);
                    for (const sub of subEntries) {
                        const subPath = path.join(camPath, sub.name);
                        if (sub.isDirectory()) {
                            // Date folder formatted as YYYY-MM-DD
                            if (/^\d{4}-\d{2}-\d{2}$/.test(sub.name)) {
                                if (sub.name < cutoffDateStr) {
                                    const filesInside = await fs.readdir(subPath).catch(() => []);
                                    await fs.rm(subPath, { recursive: true, force: true });
                                    deletedLocal += Math.max(1, filesInside.length);
                                    continue;
                                }
                            }
                            // Also check individual files inside subfolder by mtime
                            const files = await fs.readdir(subPath, { withFileTypes: true }).catch(() => []);
                            let remaining = 0;
                            for (const f of files) {
                                const fPath = path.join(subPath, f.name);
                                try {
                                    const st = await fs.stat(fPath);
                                    if (st.mtimeMs < cutoffMs) {
                                        await fs.rm(fPath, { force: true });
                                        deletedLocal++;
                                    } else {
                                        remaining++;
                                    }
                                } catch {
                                    // ignore
                                }
                            }
                            if (remaining === 0 && files.length > 0)
                                await fs.rm(subPath, { recursive: true, force: true }).catch(() => {});
                        } else if (sub.isFile() && sub.name !== 'latest.jpg') {
                            try {
                                const st = await fs.stat(subPath);
                                if (st.mtimeMs < cutoffMs) {
                                    await fs.rm(subPath, { force: true });
                                    deletedLocal++;
                                }
                            } catch {
                                // ignore
                            }
                        }
                    }
                }
            } catch (e) {
                if (forceLog)
                    this.console.warn(`Snapshot cleanup warning (${dir}): ${errMsg(e)}`);
            }
        }

        // 2. Clean up expired snapshots in Google Drive (if folder ID + OAuth token are configured)
        const gdriveToken = String(v.gdriveAccessToken ?? '').trim();
        const gdriveFolderId = String(v.gdriveFolderId ?? '').trim();
        if (gdriveToken && gdriveFolderId) {
            try {
                const cutoffIso = new Date(cutoffMs).toISOString();
                const q = `'${gdriveFolderId}' in parents and mimeType='image/jpeg' and createdTime < '${cutoffIso}' and trashed = false`;
                const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&pageSize=100`;
                const res = await fetch(listUrl, {
                    headers: { authorization: `Bearer ${gdriveToken}` },
                    signal: AbortSignal.timeout(15000),
                });
                if (res.ok) {
                    const data = await res.json();
                    for (const file of data.files ?? []) {
                        if (!file?.id)
                            continue;
                        const delRes = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}`, {
                            method: 'DELETE',
                            headers: { authorization: `Bearer ${gdriveToken}` },
                            signal: AbortSignal.timeout(10000),
                        });
                        if (delRes.ok)
                            deletedCloud++;
                    }
                }
            } catch (e) {
                if (forceLog)
                    this.console.warn(`Google Drive snapshot cleanup warning: ${errMsg(e)}`);
            }
        }

        // 3. Clean up expired YYYY-MM-DD date folders in Dropbox (if Dropbox token is configured)
        const dropboxToken = String(v.dropboxAccessToken ?? '').trim();
        if (dropboxToken) {
            try {
                const folder = (String(v.dropboxFolder ?? '/AI-Vision-Alerts').trim() || '/AI-Vision-Alerts').replace(/\/+$/, '');
                const rootPath = folder.startsWith('/') ? folder : '/' + folder;
                const listRes = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
                    method: 'POST',
                    headers: {
                        authorization: `Bearer ${dropboxToken}`,
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({ path: rootPath, recursive: true }),
                    signal: AbortSignal.timeout(15000),
                });
                if (listRes.ok) {
                    const listJson = await listRes.json();
                    for (const entry of listJson.entries ?? []) {
                        if (entry?.['.tag'] === 'folder' && /^\d{4}-\d{2}-\d{2}$/.test(entry.name) && entry.name < cutoffDateStr) {
                            const delRes = await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
                                method: 'POST',
                                headers: {
                                    authorization: `Bearer ${dropboxToken}`,
                                    'content-type': 'application/json',
                                },
                                body: JSON.stringify({ path: entry.path_lower || entry.path_display }),
                                signal: AbortSignal.timeout(10000),
                            });
                            if (delRes.ok)
                                deletedCloud++;
                        }
                    }
                }
            } catch (e) {
                if (forceLog)
                    this.console.warn(`Dropbox snapshot cleanup warning: ${errMsg(e)}`);
            }
        }

        if (forceLog || deletedLocal > 0 || deletedCloud > 0) {
            this.console.log(
                `Snapshot cleanup (> ${days} day(s), older than ${cutoffDateStr}): removed ${deletedLocal} local file(s)/item(s)` +
                    (deletedCloud > 0 ? ` and ${deletedCloud} cloud item(s).` : '.'),
            );
        }
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
        if (isLocalProvider(targetCfg))
            return true;
        const limit = Number(this.storageSettings.values.dailyLimit ?? 0);
        if (limit <= 0)
            return true;
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

    /* ---------------- Notifications (HA Persistent + Mobile, Webhook, ntfy, Pushover, Telegram) ---------------- */

    haConfigured(): boolean {
        const v = this.storageSettings.values;
        const hasExplicit = !!(String(v.haUrl ?? '').trim() && String(v.haToken ?? '').trim());
        const hasSupervisor = !!process.env.SUPERVISOR_TOKEN;
        return hasExplicit || hasSupervisor;
    }

    webhookConfigured(): boolean {
        return !!String(this.storageSettings.values.webhookUrls ?? '').trim();
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
                        req.haImageUrl,
                        req.tag,
                    ),
            ]);
        if (selected.includes('Webhook') && this.webhookConfigured())
            jobs.push(['Webhook', () => this.sendWebhooks(req)]);
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

    /** Requirement 11: Sends to both Home Assistant Persistent Notification (sidebar bell) and Mobile Companion App(s). */
    async sendHomeAssistantNotification(
        title: string,
        message: string,
        cameraEntity?: string,
        haImageUrl?: string,
        tag?: string,
    ): Promise<boolean> {
        const v = this.storageSettings.values;
        const explicitUrl = String(v.haUrl ?? '').trim().replace(/\/+$/, '');
        const explicitToken = String(v.haToken ?? '').trim();
        const supToken = process.env.SUPERVISOR_TOKEN || '';

        const candidates: { base: string; token: string }[] = [];
        if (explicitUrl && explicitToken)
            candidates.push({ base: explicitUrl, token: explicitToken });
        if (supToken && explicitUrl !== 'http://supervisor/core')
            candidates.push({ base: 'http://supervisor/core', token: supToken });
        if (!candidates.length && explicitUrl && supToken)
            candidates.push({ base: explicitUrl, token: supToken });
        if (!candidates.length)
            return false;

        const postHaWithFallback = async (apiPath: string, body: unknown, timeoutMs = 15000): Promise<any> => {
            let lastErr: unknown;
            for (const cand of candidates) {
                try {
                    return await postJson(
                        `${cand.base}${apiPath}`,
                        { authorization: `Bearer ${cand.token}` },
                        body,
                        timeoutMs,
                    );
                } catch (e) {
                    lastErr = e;
                }
            }
            throw lastErr;
        };

        const rawServices = String(v.haNotifyServices ?? '')
            .split(',')
            .map(x => x.trim().replace(/^notify\./, ''))
            .filter(Boolean);
        const wantPersistent =
            Boolean(v.haPersistentNotification ?? true) ||
            rawServices.some(s => s === 'persistent_notification' || s === 'persistent_notification.create');
        let services = rawServices.filter(s => s !== 'persistent_notification' && s !== 'persistent_notification.create');

        // Auto-discover all mobile_app_* notify services from Home Assistant if none were manually entered
        if (!services.length) {
            for (const cand of candidates) {
                try {
                    const res = await fetch(`${cand.base}/api/services`, {
                        headers: { authorization: `Bearer ${cand.token}` },
                        signal: AbortSignal.timeout(8000),
                    });
                    if (res.ok) {
                        const domains = await res.json();
                        if (Array.isArray(domains)) {
                            const notifyDomain = domains.find((d: any) => d?.domain === 'notify');
                            if (notifyDomain?.services && typeof notifyDomain.services === 'object') {
                                services = Object.keys(notifyDomain.services).filter(k => k.startsWith('mobile_app_'));
                            }
                        }
                        break;
                    }
                } catch {
                    // try next candidate
                }
            }
        }

        const errors: string[] = [];

        // 1. Home Assistant Persistent Notification (sidebar bell)
        if (wantPersistent) {
            try {
                await postHaWithFallback(
                    '/api/services/persistent_notification/create',
                    {
                        title,
                        message,
                        notification_id: tag || `ai-alert-${Date.now()}`,
                    },
                    15000,
                );
            } catch (e) {
                errors.push(`persistent_notification: ${errMsg(e)}`);
            }
        }

        // 2. Home Assistant Mobile App / Notify services
        // Note: iOS Companion App (mobile_app_*_iphone / ipad) rejects Android-only fields like `importance`, `priority`, `ttl`
        // or non-camera `entity_id` values with HTTP 400 Bad Request. Keep `data` strictly compatible with both iOS and Android.
        const data: Record<string, unknown> = {
            push: {
                sound: 'default',
                'interruption-level': 'time-sensitive',
            },
        };
        if (tag)
            data.tag = tag;
        if (cameraEntity && /^camera\./i.test(cameraEntity)) {
            data.image = `/api/camera_proxy/${cameraEntity}`;
            data.entity_id = cameraEntity;
        } else if (haImageUrl && haImageUrl.startsWith('/local/')) {
            data.image = haImageUrl;
        }

        for (const service of services) {
            try {
                await postHaWithFallback(
                    `/api/services/notify/${service}`,
                    { title, message, data },
                    15000,
                );
            } catch (e) {
                try {
                    await postHaWithFallback(
                        `/api/services/notify/${service}`,
                        { title, message },
                        15000,
                    );
                } catch {
                    try {
                        await postHaWithFallback(
                            `/api/services/notify/${service}`,
                            { message: `${title}: ${message}` },
                            15000,
                        );
                    } catch {
                        errors.push(`${service}: ${errMsg(e)}`);
                    }
                }
            }
        }
        if (errors.length)
            throw new Error(errors.join('; '));
        return true;
    }

    /** Requirement 12: Sends rich JSON webhooks for Tesla car alerts, Android/Fire TV video/image popups, Home Assistant, etc. */
    async sendWebhooks(req: AlertRequest): Promise<void> {
        const v = this.storageSettings.values;
        const urls = String(v.webhookUrls ?? '')
            .split(/[\r\n,]+/)
            .map(u => u.trim())
            .filter(Boolean);
        if (!urls.length)
            return;

        const token = String(v.webhookToken ?? '').trim();
        const includeImage = Boolean(v.webhookIncludeImage ?? true);
        const streamUrl = String(v.webhookVideoStreamUrl ?? '').trim() || undefined;
        const b64 = includeImage && req.jpeg ? req.jpeg.toString('base64') : undefined;

        const headers: Record<string, string> = {};
        if (token) {
            headers.authorization = `Bearer ${token}`;
            headers['x-webhook-secret'] = token;
        }

        // Payload compatible with Home Assistant webhooks, Tesla integrations, and Android/Fire TV (Pipup) overlays
        const payload: Record<string, unknown> = {
            source: 'scrypted-ai-vision-alerts',
            title: req.title,
            message: req.message,
            summary: req.rawSummary ?? req.message,
            timestamp: req.timestampText,
            isoTimestamp: req.isoTimestamp,
            cameraId: req.cameraId,
            cameraName: req.cameraName,
            severity: req.severity,
            objects: req.objects ?? [],
            faces: req.faces ?? [],
            recognizedFaces: (req.faces ?? []).filter(f => f !== 'unknown'),
            unknownFacesCount: req.unknownFacesCount ?? 0,
            licensePlates: req.licensePlates ?? [],
            vehicles: req.vehicles ?? [],
            deliveryCarrier: req.deliveryCarrier ?? null,
            carriedItems: req.carriedItems ?? [],
            savedSnapshotPath: req.savedSnapshotPath ?? null,
            haImageUrl: req.haImageUrl ?? null,
            videoStreamUrl: streamUrl ?? null,
            imageBase64: b64 ?? null,
            imageDataUrl: b64 ? `data:image/jpeg;base64,${b64}` : null,
            // Android TV / Fire TV (Pipup) overlay fields
            duration: 12,
            position: 0,
            titleSize: 20,
            messageSize: 14,
            backgroundColor: '#cc000000',
            media: streamUrl
                ? { web: { uri: streamUrl, width: 640, height: 360 } }
                : b64
                    ? { image: { uri: `data:image/jpeg;base64,${b64}`, width: 640 } }
                    : undefined,
        };

        const errors: string[] = [];
        for (const url of urls) {
            try {
                await postJson(url, headers, payload, 15000);
            } catch (e) {
                errors.push(`${url}: ${errMsg(e)}`);
            }
        }
        if (errors.length)
            throw new Error(errors.join('; '));
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
            throw new Error(errMsg(e).split(token).join('***'));
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
