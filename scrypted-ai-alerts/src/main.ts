import sdk, {
    EventListenerRegister,
    FFmpegInput,
    MediaObject,
    MixinProvider,
    Notifier,
    ScryptedDeviceBase,
    ScryptedDeviceType,
    ScryptedInterface,
    ScryptedMimeTypes,
    Setting,
    Settings,
    SettingValue,
    VideoCamera,
    Camera,
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

interface Verdict {
    alert: boolean;
    severity: 'low' | 'medium' | 'high';
    summary: string;
    save: SavePlan;
}

const DEFAULT_SYSTEM_PROMPT =
    'You are a home security camera analyst. You receive several still frames sampled from a camera\'s live stream ' +
    'right after motion was detected, oldest first. Decide whether they show something the homeowner should be ' +
    'alerted about, considering what changes between frames. ' +
    'Reply with ONLY a JSON object, no markdown: ' +
    '{"alert": boolean, "severity": "low" | "medium" | "high", "summary": string, "save": "none" | "snapshot" | "clip" | "both"}. ' +
    'Set "save" by following the evidence rules if they are given, otherwise use "none". ' +
    'The summary is one short sentence describing what is happening (people, what they are doing, vehicles, packages, animals). ' +
    'Never guess identities. Be conservative: routine activity such as pets, passing shadows, ' +
    'headlights, insects, rain, or lighting changes is not an alert unless the homeowner rules below say otherwise.';

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
): string {
    return (
        `Camera: ${cameraName}\n` +
        `Trigger: motion detected\n` +
        `${frames} frame(s), about ${intervalSec}s apart, oldest first.\n` +
        `Homeowner rules: ${rules}\n` +
        (evidenceRules ? `Evidence rules (for the "save" field): ${evidenceRules}\n` : '') +
        'Respond with the JSON object only.'
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
async function callModelRaw(cfg: ProviderConfig, req: ModelRequest): Promise<string> {
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
            const user: any = { role: 'user', content: req.prompt };
            if (b64s.length)
                user.images = b64s;
            const post = (withFormat: boolean): Promise<any> =>
                postJson(
                    `${base}/api/chat`,
                    headers,
                    {
                        model,
                        stream: false,
                        ...(withFormat ? { format: 'json' } : {}),
                        messages: [{ role: 'system', content: req.system }, user],
                        options: { num_predict: req.maxTokens },
                    },
                    req.timeoutMs,
                ).catch(e => {
                    throw ollamaHint(e, model);
                });

            let json = await post(true);
            let text: string = json.message?.content ?? '';
            if (!text.trim()) {
                // Some models return nothing when forced into JSON mode, so retry without it.
                json = await post(false);
                text = json.message?.content ?? '';
            }
            if (!text.trim())
                throw new Error(
                    `Ollama model "${model}" returned an empty reply (done_reason: ${json.done_reason ?? 'unknown'}).` +
                    (json.message?.thinking
                        ? ' It used its whole token budget thinking. Use a non-thinking vision model.'
                        : ''),
                );
            return text;
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
                    // OpenAI's newer models reject max_tokens; other servers expect it.
                    ...(cfg.provider === 'openai'
                        ? { max_completion_tokens: req.maxTokens }
                        : { max_tokens: req.maxTokens }),
                    messages: [{ role: 'system', content: req.system }, { role: 'user', content }],
                },
                req.timeoutMs,
            );
            const choice = json.choices?.[0];
            const c = choice?.message?.content;
            const text: string =
                typeof c === 'string' ? c : Array.isArray(c) ? c.map((part: any) => part?.text ?? '').join('') : '';
            if (!text.trim())
                throw new Error(
                    `${cfg.provider} model "${model}" returned an empty reply (finish_reason: ${choice?.finish_reason ?? 'unknown'}` +
                    `${choice?.message?.refusal ? `, refusal: ${choice.message.refusal}` : ''}). ` +
                    'Reasoning models can spend all their tokens thinking; try a non-reasoning model.',
                );
            return text;
        }
    }
}

/** Turns common Ollama errors into instructions. */
function ollamaHint(e: unknown, model: string): Error {
    const msg = errMsg(e);
    if (/multimodal|does not support (images|vision)|image input/i.test(msg))
        return new Error(
            `Ollama model "${model}" cannot read images. Choose a vision model (for example llama3.2-vision, ` +
            'qwen2.5vl or gemma3) in the Ollama settings, and install it on the Ollama machine with: ollama pull llama3.2-vision',
        );
    if (/not found/i.test(msg))
        return new Error(`Model "${model}" may not be installed on the Ollama server. Try: ollama pull ${model} (${msg.slice(0, 150)})`);
    return e instanceof Error ? e : new Error(msg);
}

/** Calls the selected provider and returns the model's text reply; an empty reply is an error. */
async function callModel(cfg: ProviderConfig, req: ModelRequest): Promise<string> {
    const text = await callModelRaw(cfg, req);
    if (!text.trim())
        throw new Error(`${cfg.provider} (${cfg.model?.trim() || PROVIDER_DEFAULTS[cfg.provider].model}) returned an empty reply.`);
    return text;
}

/** Pulls the JSON verdict out of a model reply, tolerating code fences and chatter. */
function parseVerdict(text: string): Verdict {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match)
        throw new Error(`Model did not return JSON: ${text.trim().slice(0, 200) || '(empty reply)'}`);
    let parsed: any;
    try {
        parsed = JSON.parse(match[0]);
    } catch {
        throw new Error(`Model returned invalid JSON: ${match[0].slice(0, 200)}`);
    }
    return {
        alert: parsed.alert === true || parsed.alert === 'true',
        severity: ['low', 'medium', 'high'].includes(parsed.severity) ? parsed.severity : 'medium',
        summary: String(parsed.summary ?? '').trim() || 'Activity detected.',
        save: ['none', 'snapshot', 'clip', 'both'].includes(parsed.save) ? parsed.save : 'none',
    };
}

/** Makes a small solid-red JPEG with ffmpeg so provider tests can check image support. */
function makeTestImage(ffmpegPath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const p = spawn(
            ffmpegPath,
            [
                '-nostdin',
                '-hide_banner', '-loglevel', 'error',
                '-f', 'lavfi', '-i', 'color=c=red:s=160x160:d=1',
                '-frames:v', '1',
                '-f', 'mjpeg', 'pipe:1',
            ],
            { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true },
        );
        const chunks: Buffer[] = [];
        let err = '';
        const timer = setTimeout(() => p.kill('SIGKILL'), 10000);
        p.stdout.on('data', (d: Buffer) => chunks.push(d));
        p.stderr.on('data', d => (err += d.toString()));
        p.on('error', e => {
            clearTimeout(timer);
            reject(e);
        });
        p.on('close', code => {
            clearTimeout(timer);
            if (code === 0 && chunks.length)
                resolve(Buffer.concat(chunks));
            else
                reject(new Error(`ffmpeg exited with ${code}: ${err.slice(0, 200)}`));
        });
    });
}

/* ------------------------------------------------------------------ */
/* Live stream frame sampling (uses Scrypted's built-in ffmpeg)         */
/* ------------------------------------------------------------------ */

const FRAME_TIMEOUT_MS = 15000;

/** Runs ffmpeg once and never throws. The returned text explains what happened if no output appeared. */
function runFfmpegOnce(ffmpegPath: string, args: string[], timeoutMs: number): Promise<string> {
    return new Promise(resolve => {
        const p = spawn(ffmpegPath, ['-nostdin', ...args], {
            stdio: ['ignore', 'ignore', 'pipe'],
            windowsHide: true,
        });
        let stderr = '';
        let timedOut = false;
        p.stderr.on('data', d => (stderr += d.toString()));
        const timer = setTimeout(() => {
            timedOut = true;
            p.kill('SIGKILL');
        }, timeoutMs);
        p.on('error', e => {
            clearTimeout(timer);
            resolve(`could not start ffmpeg (${e.message})`);
        });
        p.on('close', (code, signal) => {
            clearTimeout(timer);
            const how = timedOut
                ? `no video arrived within ${Math.round(timeoutMs / 1000)}s, so ffmpeg was stopped`
                : `ffmpeg exited with code ${code}${signal ? ` (signal ${signal})` : ''}`;
            resolve(stderr.trim() ? `${how}; ffmpeg said: ${stderr.trim().slice(-300)}` : how);
        });
    });
}

/**
 * Grabs `count` frames from a live stream, one short ffmpeg run per frame. Doing one run per frame avoids
 * timestamp problems that can make a single multi-frame run stall without any error.
 */
async function sampleFrames(
    ffmpegPath: string,
    inputArgs: string[],
    count: number,
    intervalSec: number,
    log: (msg: string) => void,
): Promise<Buffer[]> {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-alerts-'));
    try {
        const frames: Buffer[] = [];
        for (let i = 0; i < count; i++) {
            const started = Date.now();
            const out = path.join(dir, `frame_${i}.jpg`);
            const summary = await runFfmpegOnce(
                ffmpegPath,
                [
                    '-hide_banner', '-loglevel', 'error', '-y',
                    ...inputArgs,
                    '-an',
                    '-frames:v', '1',
                    '-vf', "scale='min(1024,iw)':-2",
                    '-q:v', '5',
                    out,
                ],
                FRAME_TIMEOUT_MS,
            );

            const jpeg = await fs.readFile(out).catch(() => undefined);
            if (jpeg && jpeg.length > 0) {
                frames.push(jpeg);
            } else if (i === 0) {
                throw new Error(`ffmpeg produced no frame: ${summary}`);
            } else {
                log(`Frame ${i + 1} of ${count} failed (${summary}); continuing with ${frames.length} frame(s).`);
            }

            if (i < count - 1)
                await new Promise(r => setTimeout(r, Math.max(0, intervalSec * 1000 - (Date.now() - started))));
        }
        return frames;
    } finally {
        await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
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
}

interface AlertResult {
    sent: string[];
    errors: string[];
    configured: number;
}

function errMsg(e: unknown): string {
    if (!(e instanceof Error))
        return String(e);
    const parts: string[] = [e.message];
    let cur: any = (e as any).cause;
    while (cur) {
        if (Array.isArray(cur?.errors) && cur.errors.length) {
            parts.push(cur.errors.map((x: any) => x?.message || x?.code || String(x)).join(', '));
            break;
        }
        const detail = [cur.code, cur.message].filter(Boolean).join(' ');
        if (detail && !parts.includes(detail))
            parts.push(detail);
        cur = cur.cause;
    }
    return parts.join(' - ');
}

function normalizeUrl(raw: string): string {
    const trimmed = raw.trim().replace(/\/+$/, '');
    if (!trimmed)
        return '';
    return /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
}

function normalizeOrigin(raw: string): string {
    const url = normalizeUrl(raw);
    if (!url)
        return '';
    try {
        return new URL(url).origin;
    } catch {
        return url.replace(/\/api$/i, '');
    }
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

class AIAlertsMixin extends SettingsMixinDeviceBase<VideoCamera & Partial<Camera>> implements Settings {
    provider: AIAlertsPlugin;
    listener?: EventListenerRegister;
    busy = false;
    lastRun = 0;

    storageSettings = new StorageSettings(this, {
        enabled: {
            title: 'Enable AI alerts',
            type: 'boolean',
            defaultValue: false,
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
            title: 'Cooldown (seconds)',
            description: 'Minimum time between AI analyses for this camera.',
            type: 'number',
            defaultValue: 60,
        },
        rules: {
            title: 'What should trigger an alert?',
            description: 'Plain-English rules the AI uses to decide.',
            type: 'textarea',
            defaultValue: DEFAULT_RULES,
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
                await this.analyze(true);
            },
        },
    });

    constructor(options: SettingsMixinDeviceOptions<VideoCamera & Partial<Camera>>, provider: AIAlertsPlugin) {
        super(options);
        this.provider = provider;

        this.listener = systemManager.listenDevice(
            this.id,
            ScryptedInterface.MotionSensor,
            (_source, _details, data: boolean) => {
                if (data === true)
                    this.analyze(false).catch(e => this.console.error('analyze failed', e));
            },
        );
    }

    dispose() {
        this.listener?.removeListener();
        this.listener = undefined;
    }

    getMixinSettings(): Promise<Setting[]> {
        return this.storageSettings.getSettings();
    }

    putMixinSetting(key: string, value: SettingValue): Promise<void> {
        return this.storageSettings.putSetting(key, value);
    }

    /** Grabs frames from the live stream; falls back to a single snapshot if that fails. */
    async captureFrames(count: number, intervalSec: number): Promise<Buffer[]> {
        const attempts: ({ destination: 'low-resolution' } | undefined)[] = [{ destination: 'low-resolution' }, undefined];
        const problems: string[] = [];

        for (const options of attempts) {
            try {
                const mo = options
                    ? await this.mixinDevice.getVideoStream(options)
                    : await this.mixinDevice.getVideoStream();
                const input = await mediaManager.convertMediaObjectToJSON<FFmpegInput>(mo, ScryptedMimeTypes.FFmpegInput);
                const inputArgs = input.inputArguments?.length
                    ? input.inputArguments
                    : input.url
                        ? ['-i', input.url]
                        : [];
                if (!inputArgs.length)
                    throw new Error('Camera stream did not provide FFmpeg input arguments or URL.');
                const ffmpegPath = await mediaManager.getFFmpegPath();
                return await sampleFrames(ffmpegPath, inputArgs, count, intervalSec, m => this.console.warn(m));
            } catch (e) {
                problems.push(`${options ? options.destination : 'default'} stream: ${errMsg(e)}`);
            }
        }

        this.console.warn(`Live stream sampling failed (${problems.join(' | ')}). Trying a snapshot instead.`);
        if (!this.mixinDevice.takePicture)
            throw new Error(`Could not get any frames: ${problems.join(' | ')}`);
        const picture = await this.mixinDevice.takePicture!({ reason: 'event' });
        return [await mediaManager.convertMediaObjectToBuffer(picture, 'image/jpeg')];
    }

    async analyze(force: boolean) {
        const s = this.storageSettings.values;
        if (!s.enabled && !force)
            return;
        if (this.busy)
            return;

        const now = Date.now();
        if (!force && now - this.lastRun < Number(s.cooldownSeconds ?? 60) * 1000)
            return;

        const { chain, problems } = this.provider.getProviderChain();
        for (const p of problems)
            this.console.warn(`Skipping provider - ${p}`);
        if (!chain.length) {
            this.console.error('No usable AI provider. Fill in the provider settings on the AI Vision Alerts plugin page.');
            return;
        }

        if (!this.provider.tryConsumeQuota()) {
            this.console.warn('Daily AI call limit reached, skipping analysis.');
            return;
        }

        this.busy = true;
        this.lastRun = now;
        try {
            const cameraName = systemManager.getDeviceById(this.id)?.name ?? 'Camera';
            const count = Math.min(8, Math.max(1, Math.round(Number(s.frameCount ?? 3))));
            const interval = Math.min(10, Math.max(1, Math.round(Number(s.frameIntervalSeconds ?? 2))));

            const jpegs = await this.captureFrames(count, interval);

            const started = Date.now();
            const request: ModelRequest = {
                system: DEFAULT_SYSTEM_PROMPT,
                prompt: buildPrompt(
                    cameraName,
                    s.rules || DEFAULT_RULES,
                    jpegs.length,
                    interval,
                    String(s.saveEvidence ?? '').startsWith('Let the AI')
                        ? s.evidenceRules || DEFAULT_EVIDENCE_RULES
                        : undefined,
                ),
                jpegs,
                maxTokens: 1024,
                timeoutMs: this.provider.timeoutMs(),
            };

            let found: Verdict | undefined;
            let used: ProviderId = chain[0].provider;
            let lastError: unknown;
            for (const cfg of chain) {
                try {
                    found = parseVerdict(await callModel(cfg, request));
                    used = cfg.provider;
                    break;
                } catch (e) {
                    lastError = e;
                    const model = cfg.model?.trim() || PROVIDER_DEFAULTS[cfg.provider].model;
                    this.console.warn(`${cfg.provider} (${model}) failed: ${errMsg(e)}`);
                }
            }
            if (!found)
                throw lastError ?? new Error('No AI provider produced a result.');
            const verdict: Verdict = found;

            this.console.log(
                `${used} analyzed ${jpegs.length} frame(s) in ${Date.now() - started}ms:`,
                JSON.stringify(verdict),
            );

            const order = ['low', 'medium', 'high'];
            const meetsSeverity = order.indexOf(verdict.severity) >= order.indexOf(s.minSeverity || 'low');
            if (!force && !(verdict.alert && meetsSeverity))
                return;

            const choice = String(s.saveEvidence ?? 'Off');
            let plan: SavePlan = 'none';
            if (choice === 'Snapshot') plan = 'snapshot';
            else if (choice === 'Clip') plan = 'clip';
            else if (choice === 'Snapshot + clip') plan = 'both';
            else if (choice.startsWith('Let the AI')) plan = verdict.save;

            const needsFrame = plan === 'snapshot' || plan === 'both';
            const media =
                s.attachSnapshot || needsFrame
                    ? await mediaManager.createMediaObject(jpegs[Math.floor(jpegs.length / 2)], 'image/jpeg')
                    : undefined;

            const notifierIds: string[] = Array.isArray(s.notifiers) ? s.notifiers : s.notifiers ? [s.notifiers] : [];
            const alert = await this.provider.sendAlert({
                title: `${cameraName}: ${verdict.severity.toUpperCase()}`,
                message: verdict.summary,
                severity: verdict.severity,
                channels: asList(s.channels),
                jpeg: s.attachSnapshot ? jpegs[Math.floor(jpegs.length / 2)] : undefined,
                haCameraEntity: String(s.haCameraEntity ?? '').trim() || undefined,
                tag: `ai-alert-${this.id}`,
            });
            if (alert.sent.length)
                this.console.log(`Alert sent via: ${alert.sent.join(', ')}`);
            for (const e of alert.errors)
                this.console.error(`Notification failed - ${e}`);
            if (!alert.configured && !notifierIds.length)
                this.console.warn('No phone/app notification channel is configured on the AI Vision Alerts plugin page.');

            for (const id of notifierIds) {
                const notifier = systemManager.getDeviceById<Notifier>(id);
                if (!notifier)
                    continue;
                const title = `${cameraName}: ${verdict.severity.toUpperCase()}`;
                const options = {
                    body: verdict.summary,
                    tag: 'ai-vision-alerts',
                    data: {
                        source: 'ai-vision-alerts',
                        cameraId: this.id,
                        cameraName,
                        severity: verdict.severity,
                        summary: verdict.summary,
                        save: plan,
                    },
                };
                try {
                    await notifier.sendNotification(title, options, media);
                } catch (e) {
                    if (media) {
                        try {
                            await notifier.sendNotification(title, options);
                            this.console.warn(`Sent text-only notification to ${notifier.name || id} (snapshot attachment failed: ${errMsg(e)})`);
                            continue;
                        } catch {
                            // fall through to log error
                        }
                    }
                    this.console.error(`Notification to ${notifier.name || id} failed: ${errMsg(e)}`);
                }
            }
        } catch (e) {
            this.console.error('AI analysis failed', e);
        } finally {
            this.busy = false;
        }
    }
}

/* ------------------------------------------------------------------ */
/* Plugin (provider settings + mixin registration)                      */
/* ------------------------------------------------------------------ */

export default class AIAlertsPlugin extends ScryptedDeviceBase implements MixinProvider, Settings {
    callsToday = 0;
    callsDay = new Date().toDateString();

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
            title: 'Daily AI call limit (all cameras)',
            description: 'Safety cap so a noisy camera cannot run up a bill or keep your GPU busy.',
            type: 'number',
            defaultValue: 200,
        },
        testProvider: {
            group: 'AI provider',
            title: 'Test provider connection',
            description:
                'Sends a small test image to the main (and fallback) provider and logs what each one says in this ' +
                'plugin\'s console. This checks the URL, key, model, and that the model can actually read images.',
            type: 'button',
            onPut: async () => {
                const { chain, problems } = this.getProviderChain();
                for (const p of problems)
                    this.console.warn(`Not testing - ${p}`);

                let image: Buffer | undefined;
                try {
                    image = await makeTestImage(await mediaManager.getFFmpegPath());
                } catch (e) {
                    this.console.warn(`Could not create a test image, testing text only: ${errMsg(e)}`);
                }

                for (const cfg of chain) {
                    const label = `${cfg.provider} (${cfg.model?.trim() || PROVIDER_DEFAULTS[cfg.provider].model})`;
                    try {
                        const started = Date.now();
                        const verdict = parseVerdict(
                            await callModel(cfg, {
                                system: DEFAULT_SYSTEM_PROMPT,
                                prompt: image
                                    ? 'This is a test image that is one solid color. Set alert to false, severity to low, save to none, ' +
                                      'and in summary state the color of the image. Respond with the JSON object only.'
                                    : 'Set alert to false, severity to low, save to none, and summary to "ok". Respond with the JSON object only.',
                                jpegs: image ? [image] : [],
                                maxTokens: 1024,
                                timeoutMs: this.timeoutMs(),
                            }),
                        );
                        this.console.log(
                            `${label} test OK in ${Date.now() - started}ms. The model said: "${verdict.summary}"` +
                            (image ? ' (the test image is solid red)' : ''),
                        );
                    } catch (e) {
                        this.console.error(`${label} test FAILED: ${errMsg(e)}`);
                    }
                }
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
            description: 'Must support images, e.g. llama3.2-vision, qwen2.5vl, gemma3. Blank uses llama3.2-vision.',
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
                'Examples: 9Router http://host:20128/v1, LM Studio http://host:1234/v1, vLLM, LiteLLM, OpenRouter https://openrouter.ai/api/v1.',
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

    putSetting(key: string, value: SettingValue): Promise<void> {
        return this.storageSettings.putSetting(key, value);
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

    tryConsumeQuota(): boolean {
        const today = new Date().toDateString();
        if (today !== this.callsDay) {
            this.callsDay = today;
            this.callsToday = 0;
        }
        if (this.callsToday >= Number(this.storageSettings.values.dailyLimit ?? 200))
            return false;
        this.callsToday++;
        return true;
    }

    /* ---------------- Notifications ---------------- */

    haConfigured(): boolean {
        const v = this.storageSettings.values;
        return !!(String(v.haUrl ?? '').trim() && String(v.haToken ?? '').trim());
    }

    private parseNtfyTarget(): { base: string; topic: string } {
        const v = this.storageSettings.values;
        let rawUrl = String(v.ntfyUrl ?? '').trim().replace(/\/+$/, '');
        let rawTopic = String(v.ntfyTopic ?? '').trim().replace(/^\/+|\/+$/g, '');

        // Handle full URL pasted into the Topic field (e.g. https://ntfy.sh/my_topic)
        if (/^https?:\/\//i.test(rawTopic)) {
            try {
                const u = new URL(rawTopic);
                const segs = u.pathname.split('/').filter(Boolean);
                if (segs.length) {
                    rawTopic = segs.pop()!;
                    if (!rawUrl)
                        rawUrl = `${u.origin}${segs.length ? '/' + segs.join('/') : ''}`;
                }
            } catch {
                // keep rawTopic as-is
            }
        }

        let base = rawUrl ? normalizeUrl(rawUrl) : 'https://ntfy.sh';
        try {
            const u = new URL(base);
            const segs = u.pathname.split('/').filter(Boolean);
            if (!rawTopic && segs.length) {
                // User pasted https://ntfy.sh/my_topic into Server URL and left Topic blank
                rawTopic = segs.pop()!;
                base = `${u.origin}${segs.length ? '/' + segs.join('/') : ''}`;
            } else if (rawTopic && segs.length && segs[segs.length - 1] === rawTopic) {
                // User included the topic in both Server URL and Topic
                segs.pop();
                base = `${u.origin}${segs.length ? '/' + segs.join('/') : ''}`;
            }
        } catch {
            // keep base as-is
        }

        return { base, topic: rawTopic };
    }

    ntfyConfigured(): boolean {
        return !!this.parseNtfyTarget().topic;
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
            jobs.push(['Home Assistant', () => this.sendHomeAssistantNotification(req.title, req.message, req.haCameraEntity, req.tag)]);
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

    /** Discovers available notify.* services on the Home Assistant instance. */
    private async fetchHomeAssistantNotifyServices(base: string, token: string): Promise<string[]> {
        try {
            const res = await fetch(`${base}/api/services`, {
                method: 'GET',
                headers: { authorization: `Bearer ${token}` },
                signal: AbortSignal.timeout(10000),
            });
            if (!res.ok)
                return [];
            const domains: any[] = await res.json();
            const notifyDomain = Array.isArray(domains) ? domains.find(d => d?.domain === 'notify') : undefined;
            return notifyDomain?.services ? Object.keys(notifyDomain.services) : [];
        } catch {
            return [];
        }
    }

    /** Pushes a notification through Home Assistant's notify service (phone Companion app). */
    async sendHomeAssistantNotification(
        title: string,
        message: string,
        cameraEntity?: string,
        tag?: string,
    ): Promise<boolean> {
        const v = this.storageSettings.values;
        const base = normalizeOrigin(String(v.haUrl ?? ''));
        const token = String(v.haToken ?? '').trim().replace(/^Bearer\s+/i, '').replace(/[\s"']+/g, '');
        let services = String(v.haNotifyServices ?? '')
            .split(/[,;\n]+/)
            .map(x => x.trim().toLowerCase().replace(/^(notify|device_tracker|person)[./]/i, '').replace(/\s+/g, '_'))
            .filter(Boolean);
        if (!base || !token)
            return false;

        let availableServices: string[] | undefined;
        if (!services.length) {
            availableServices = await this.fetchHomeAssistantNotifyServices(base, token);
            const mobileApps = availableServices.filter(s => s.startsWith('mobile_app_'));
            services = mobileApps.length ? mobileApps : ['notify'];
        }

        // Keys for both Android and iOS Companion apps; each app ignores the other's.
        const data: Record<string, unknown> = {
            channel: 'AI Vision Alerts',
            importance: 'high',
            priority: 'high',
            ttl: 0,
        };
        if (tag)
            data.tag = tag;
        if (cameraEntity) {
            const entity = cameraEntity.includes('.') ? cameraEntity : `camera.${cameraEntity}`;
            data.image = `/api/camera_proxy/${entity}`; // Android
            data.entity_id = entity; // iOS
        }

        const callService = async (svc: string) => {
            const url = `${base}/api/services/notify/${svc}`;
            const headers = { authorization: `Bearer ${token}` };
            try {
                await postJson(url, headers, { title, message, data }, 15000);
            } catch (e) {
                const msg = errMsg(e);
                // Some HA notify services (e.g. persistent_notification) reject mobile_app `data` or `title` with HTTP 400
                if (/\b400\b/.test(msg)) {
                    try {
                        await postJson(url, headers, { title, message }, 15000);
                        return;
                    } catch {
                        await postJson(url, headers, { message: `${title}: ${message}` }, 15000);
                        return;
                    }
                }
                throw e;
            }
        };

        const errors: string[] = [];
        for (const service of services) {
            try {
                await callService(service);
            } catch (e) {
                const msg = errMsg(e);
                // If the service wasn't found (e.g. user entered "pixel_9" instead of "mobile_app_pixel_9"), try resolving against HA
                if (/\b(400|404)\b/.test(msg)) {
                    availableServices ??= await this.fetchHomeAssistantNotifyServices(base, token);
                    const match = availableServices.find(
                        s => s === `mobile_app_${service}` || s.endsWith(`_${service}`),
                    );
                    if (match && match !== service) {
                        try {
                            await callService(match);
                            continue;
                        } catch (e2) {
                            errors.push(`${match}: ${errMsg(e2)}`);
                            continue;
                        }
                    }
                    if (availableServices.length) {
                        const hint = availableServices.filter(s => s.startsWith('mobile_app_'));
                        errors.push(
                            `${service}: ${msg} (available notify services on Home Assistant: ${(hint.length ? hint : availableServices).join(', ')})`,
                        );
                        continue;
                    }
                }
                errors.push(`${service}: ${msg}`);
            }
        }
        if (errors.length)
            throw new Error(errors.join('; '));
        return true;
    }

    async sendNtfy(req: AlertRequest): Promise<void> {
        const v = this.storageSettings.values;
        const { base, topic } = this.parseNtfyTarget();
        if (!topic)
            throw new Error('ntfy topic is missing.');
        const priority = { low: 3, medium: 4, high: 5 }[req.severity];
        const auth: Record<string, string> = {};
        if (v.ntfyToken)
            auth.authorization = `Bearer ${String(v.ntfyToken).trim().replace(/^Bearer\s+/i, '')}`;

        const topicUrl = `${base}/${encodeURIComponent(topic)}`;
        const sendText = async () => {
            try {
                await postJson(
                    base,
                    auth,
                    { topic, title: req.title, message: req.message, priority, tags: ['rotating_light'] },
                    15000,
                );
            } catch {
                await fetchOk(topicUrl, {
                    method: 'POST',
                    headers: {
                        ...auth,
                        title: mimeHeader(req.title),
                        priority: String(priority),
                        tags: 'rotating_light',
                    },
                    body: req.message,
                });
            }
        };

        if (req.jpeg) {
            try {
                // Publishing a file: the message travels in headers.
                await fetchOk(topicUrl, {
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
            } catch (e) {
                // Self-hosted ntfy without attachment-cache-dir rejects binary PUTs; fall back to text alert.
                this.console.warn(`ntfy image attachment failed (${errMsg(e)}), sending text-only alert instead.`);
                await sendText();
            }
        } else {
            await sendText();
        }
    }

    async sendPushover(req: AlertRequest): Promise<void> {
        const v = this.storageSettings.values;
        const buildForm = (withImage: boolean) => {
            const form = new FormData();
            form.append('token', String(v.pushoverToken).trim());
            form.append('user', String(v.pushoverUser).trim());
            form.append('title', req.title);
            form.append('message', req.message);
            form.append('priority', String({ low: -1, medium: 0, high: 1 }[req.severity]));
            if (String(v.pushoverDevice ?? '').trim())
                form.append('device', String(v.pushoverDevice).trim());
            if (withImage && req.jpeg)
                form.append('attachment', new Blob([new Uint8Array(req.jpeg)], { type: 'image/jpeg' }), 'frame.jpg');
            return form;
        };

        if (req.jpeg) {
            try {
                await fetchOk('https://api.pushover.net/1/messages.json', { method: 'POST', body: buildForm(true) });
                return;
            } catch (e) {
                this.console.warn(`Pushover image attachment failed (${errMsg(e)}), sending text-only alert instead.`);
            }
        }
        await fetchOk('https://api.pushover.net/1/messages.json', { method: 'POST', body: buildForm(false) });
    }

    async sendTelegram(req: AlertRequest): Promise<void> {
        const v = this.storageSettings.values;
        const token = String(v.telegramToken).trim().replace(/^bot/i, '');
        const chatIds = String(v.telegramChatId)
            .split(/[,;\s]+/)
            .map(x => x.trim())
            .filter(Boolean);
        const silent = req.severity === 'low' ? 'true' : 'false';
        const sendText = (chatId: string) =>
            fetchOk(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `${req.title}\n${req.message}`,
                    disable_notification: silent === 'true',
                }),
            });

        try {
            for (const chatId of chatIds) {
                if (req.jpeg) {
                    try {
                        const form = new FormData();
                        form.append('chat_id', chatId);
                        form.append('caption', `${req.title}\n${req.message}`.slice(0, 1000));
                        form.append('disable_notification', silent);
                        form.append('photo', new Blob([new Uint8Array(req.jpeg)], { type: 'image/jpeg' }), 'frame.jpg');
                        await fetchOk(`https://api.telegram.org/bot${token}/sendPhoto`, { method: 'POST', body: form });
                        continue;
                    } catch (e) {
                        this.console.warn(`Telegram photo upload failed (${errMsg(e).split(token).join('***')}), sending text message instead.`);
                    }
                }
                await sendText(chatId);
            }
        } catch (e) {
            throw new Error(errMsg(e).split(token).join('***')); // never leak the bot token into logs
        }
    }

    /* ---------------- Mixin registration ---------------- */

    async canMixin(type: ScryptedDeviceType, interfaces: string[]): Promise<string[] | null | undefined | void> {
        if (type !== ScryptedDeviceType.Camera && type !== ScryptedDeviceType.Doorbell)
            return;
        if (!interfaces.includes(ScryptedInterface.VideoCamera) || !interfaces.includes(ScryptedInterface.MotionSensor))
            return;
        return [ScryptedInterface.Settings];
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
