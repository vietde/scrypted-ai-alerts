# AI Vision Alerts for Scrypted

<<<<<<< HEAD
When a camera reports smart object/face detection or motion, this plugin samples
frames from the camera's live stream, asks a vision AI model whether it is worth
alerting about, verifies faces with strict quality gates and multi-frame
confirmation, and sends a notification with a one-line description and a frame.
=======
When a camera reports motion, this plugin samples a few frames from the
camera's live stream, asks a vision AI model whether it is worth alerting
about, and sends a notification with a one-line description and a frame.
>>>>>>> 0965ecfe64d95657973964a35a87badca93cb049
It is a single TypeScript file (`src/main.ts`) and needs no other Scrypted
plugins.

## How it works

<<<<<<< HEAD
1. The camera's Scrypted smart `ObjectDetector` (or motion sensor if the camera
   has no smart detector) fires. Low-confidence and tiny bounding-box triggers
   are ignored automatically.
2. After a per-camera cooldown (and a short settle delay for raw motion
   triggers), the plugin pulls the live stream with Scrypted's built-in ffmpeg
   and saves a few frames (default: 3 frames, 2 seconds apart).
3. **Scene & Face Quality Gate:** The plugin locates faces and measures each
   face's real pixel width (`px`) and Laplacian sharpness score on the cropped
   face patch:
   - Any face narrower than **64 px** (`Minimum face width for known matches`) is
     ignored completely.
   - A face that matches nobody must be at least **80 px wide** (`Minimum face
     width for unknown strangers`) **and sharp** before it counts as `"unknown"`.
   - Known matches must score at least **0.50** (`Match threshold`) and beat the
     runner-up person by at least **0.06** (`Look-alike margin`).
4. **Multi-Frame Confirmation (30s window, ~3s re-check):**
   - A **known person** must be seen in **2 frames within 30 seconds** before an
     `"<Name> arrived"` alert fires.
   - A **stranger (`unknown`)** must be seen sharp and >= 80 px in **3 frames
     within 30 seconds** before an `"Unrecognized person"` alert fires.
   - One misread or reflection can't alert. While waiting for confirmation, the
     plugin automatically re-checks about every **3 seconds**.
5. **Stranger Grouping & Cooldowns:**
   - The **same stranger** is grouped by appearance across frames so they count
     as one person and aren't re-announced.
   - A **known person** won't re-alert for **2 minutes**, and a **stranger**
     won't re-alert for **15 minutes**.
6. **"Never notify for these names" & Arrival Alerts:**
   - Add household members to **Never notify for these names** (or type `family`
     to silence all enrolled people). Enrolled people not on that list trigger
     `"<Name> arrived"` alerts (e.g. `Front Door: Alex arrived`) next to your
     normal alerts.

## Face & Object Recognition

### Enrolling known faces
On the **AI Vision Alerts** plugin page under **Face & Object Recognition**:
- **Known faces directory (optional):** Point to a folder of reference face
  photos (`.jpg`, `.jpeg`, `.png`, `.webp`). On the **Home Assistant OS
  add-on**, use `/media/faces` (which maps directly to Home Assistant's Media
  folder). You can name files after each person (`Alex.jpg`, `Alex_2.jpg`,
  `Bob.png`) or organize them into subfolders per person
  (`/media/faces/Alex/1.jpg`).
- **Known faces list (optional):** Enter `Name = <file path, http(s) URL, or data:image/... URI>`
  (one per line), e.g. `Alex = /media/faces/Alex.jpg`.
- **Never notify for these names:** Comma-separated names to silence (e.g.
  `Sam, Taylor`, or `family` to silence all enrolled household members). Anyone
  enrolled but not listed here gets `"<Name> arrived"` notifications.
- Press **Load & verify enrolled faces** to validate and resize reference
  images into compact thumbnails and check the plugin console.

### Tuning with the "Recent recognitions" panel
The **Recent recognitions** section on the plugin page lists each evaluated face
with its real similarity score, closest match, runner-up, pixel width,
sharpness, and confirmation status, for example:
- `06:12:08 [Front Door] Alex (similarity 0.68, closest Alex, 2nd Bob 0.49, 94px, sharp) — confirmed 2/2 (Alex arrived)`
- `06:11:42 [Front Door] unknown (similarity 0.42, closest Alex, 88px, sharp) — confirming 2/3`
- `06:10:19 [Driveway] rejected (similarity 0.31, closest Alex, 68px, sharp) — unmatched face 68px < 80px unknown gate`

Use the table below to tune your settings based on what you see in **Recent
recognitions**:

| Pattern in "Recent recognitions" | What it means | What to change |
|---|---|---|
| `unknown (similarity 0.46, closest Alex, 92px, sharp)` when it really is Alex | Alex's score (`0.46`) is just below the `0.50` match threshold | Lower **Match threshold** slightly (e.g. to `0.44`), or add a clearer reference photo of Alex taken from a similar camera angle/lighting |
| Stranger is misidentified as `Alex (similarity 0.52, closest Alex)` | Match threshold is too forgiving for that camera/model | Raise **Match threshold** (e.g. from `0.50` to `0.58` or `0.62`) |
| `ambiguous (similarity 0.56, closest Alex, 2nd Bob 0.52, margin 0.04 < 0.06)` | Two enrolled people scored within `0.06` of each other | If it is consistently the right person, lower **Look-alike margin** (e.g. to `0.03`); if two people get mixed up, raise **Look-alike margin** (e.g. to `0.08`) and use sharper front-facing reference photos |
| Distant passersby trigger `unknown (... 82px, sharp)` alerts | The camera has high resolution so street faces still exceed 80 px | Raise **Minimum face width for unknown strangers (px)** (e.g. to `100` or `120` px) |
| Real visitors at the door show `rejected (... unmatched face 70px < 80px unknown gate)` | Doorbell/camera is wide-angle so faces at the door are ~70 px wide | Lower **Minimum face width for unknown strangers (px)** to `68` px (and **Minimum face width for known matches** to `56` px if needed) |
| Brief reflections or passing glances still confirm | Confirmation frame count is too low for a busy walkway | Raise **Confirmation frames for stranger (within 30s)** from `3` to `4` (or **Confirmation frames for known person** from `2` to `3`) |
| Same person triggers another alert too soon | Cooldown is shorter than how long they stay out front | Raise **Known person cooldown (minutes)** (default `2`) or **Stranger cooldown (minutes)** (default `15`) |
| You don't want arrival alerts for yourself or family members | Enrolled names not in the mute list send `"<Name> arrived"` alerts | Add their names (e.g. `Alex, Sam`) or `family` to **Never notify for these names** |
=======
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
>>>>>>> 0965ecfe64d95657973964a35a87badca93cb049

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

<<<<<<< HEAD
- A camera with video streaming and either a smart `ObjectDetector` or a motion
  sensor in Scrypted.
=======
- A camera with both video streaming and a motion sensor in Scrypted.
>>>>>>> 0965ecfe64d95657973964a35a87badca93cb049
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
<<<<<<< HEAD
2. Under **Face & Object Recognition**, set `/media/faces` (or your reference
   list), add any muted names to **Never notify for these names**, and press
   **Load & verify enrolled faces**.
3. Set up at least one notification channel and press **Send test
   notification**.
4. Open a camera, go to the **AI Vision Alerts** group in its settings, turn on
   **Enable AI alerts**, and edit the rules.
5. Press **Analyze now (test)** and check **Recent recognitions** on the plugin
   page to see real similarity scores.
=======
2. Set up at least one notification channel and press **Send test
   notification**.
3. Open a camera, go to the **AI Vision Alerts** group in its settings, turn on
   **Enable AI alerts**, and edit the rules.
4. Press **Analyze now (test)** to confirm the whole path works.
>>>>>>> 0965ecfe64d95657973964a35a87badca93cb049
