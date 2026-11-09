# AI Vision Alerts for Scrypted

When a camera reports motion, this plugin samples a few frames from the
camera's live stream, asks a vision AI model whether it is worth alerting
about, and sends a notification with a one-line description and a frame.
It is a single TypeScript file (`src/main.ts`) and needs no other Scrypted
plugins.

## How it works

1. The camera's own motion sensor fires (ONVIF, Reolink, Hikvision, UniFi,
   etc.).
2. After a per-camera cooldown, the plugin pulls the live stream with
   Scrypted's built-in ffmpeg and saves a few frames (default: 3 frames,
   2 seconds apart).
3. The frames go to your chosen AI provider, which replies with
   `{alert, severity, summary, save}`.
4. If `alert` is true and severity meets your minimum, the plugin notifies the
   channels you picked (and optionally Scrypted notifier devices).

If live stream sampling fails and the camera supports snapshots, it falls back
to one snapshot. The AI sees sampled frames, not continuous video, so alert
latency is roughly (frames - 1) x interval seconds plus the model's response
time.

## AI providers

Choose the main provider on the plugin page, then fill in **that provider's
section**. Each provider keeps its own settings, so you can switch without
retyping keys.

| Provider | What you enter | Default model |
|---|---|---|
| Anthropic (Claude) | API key | `claude-haiku-4-5` |
| OpenAI | API key | `gpt-4o-mini` |
| Google Gemini | API key | `gemini-2.5-flash` |
| Ollama (local) | Ollama URL (e.g. `http://192.168.100.20:11434`), model | `llama3.2-vision` |
| Custom endpoint (OpenAI-compatible) | Base URL (with `/v1`), model, optional key | none (required) |

The custom endpoint covers LM Studio, vLLM, LiteLLM, OpenRouter, Azure-style
proxies, and anything else with an OpenAI-style `/chat/completions` API. Every
model must accept images (and several images per request).

**Fallback provider (optional):** if the main provider errors or times out, the
next one is tried, e.g. local Ollama first, then Claude. **Test provider
connection** sends a text-only request to each and logs the result.

Ollama tips: use the LAN IP of the machine running Ollama (not `localhost`),
set `OLLAMA_HOST=0.0.0.0` there, raise the request timeout for slow CPU-only
models, and lower the frame count.

## Notification channels

Configure any of these on the plugin page, then press **Send test notification
to all configured channels**. On each camera, **Send alerts to** picks which
channels to use (empty = every configured channel).

| Channel | Needs | Frame attached? |
|---|---|---|
| Home Assistant (phone Companion app) | HA URL, long-lived token, notify service e.g. `mobile_app_pixel_9` | Via the HA camera entity you set per camera |
| ntfy | Topic (optional server URL, token); install the ntfy phone app and subscribe | Yes |
| Pushover | Application token, user key | Yes |
| Telegram | Bot token (from @BotFather), chat ID | Yes |

ntfy can be self-hosted for fully local push. Pushover and Telegram need
internet access. Scrypted notifier devices can still be added under "Also send
to Scrypted notifiers".

## Saving clips and snapshots (NVR Storage plugin)

Install the companion **NVR Storage** plugin, then on each camera add it under
"Also send to Scrypted notifiers" and set **Save evidence**:

- **Snapshot**, **Clip** or **Snapshot + clip**: always save that on an alert.
- **Let the AI decide**: the model chooses none/snapshot/clip/both on each alert
  using your plain-English evidence rules.

The AI plugin passes its decision to NVR Storage through the standard Scrypted
Notifier interface. When a snapshot is requested, the frame is also passed to
your other Scrypted notifiers.

## Requirements

- A camera with both video streaming and a motion sensor in Scrypted.
- At least one AI provider and one notification channel configured.

## Develop and deploy (VS Code)

1. `npm install`
2. Open this plugin directory in VS Code.
3. Edit `.vscode/settings.json` and set `scrypted.debugHost` to the IP address
   of your Scrypted server (currently `192.168.100.2`).
4. Press Launch (green arrow in the Run and Debug sidebar) to build, deploy
   and attach the debugger.

The terminal may show an authentication failure and ask you to log in to the
Scrypted Management Console with `npx scrypted login <ip>`. You only need to do
this once, then relaunch.

Without VS Code: `npx scrypted login <ip>`, then `npm run scrypted-deploy <ip>`.

When Scrypted runs as a Home Assistant OS add-on, its HTTPS port (usually
10443) and the debugger port (10081) must be reachable from your PC.

## Configure

1. Open **AI Vision Alerts** in Scrypted, choose a provider, fill in its
   section, and press **Test provider connection** (check the plugin console).
2. Set up at least one notification channel and press **Send test
   notification**.
3. Open a camera, go to the **AI Vision Alerts** group in its settings, turn on
   **Enable AI alerts**, and edit the rules.
4. Press **Analyze now (test)** to confirm the whole path works.
