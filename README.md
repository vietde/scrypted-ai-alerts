# AI Vision Alerts for Scrypted

When a camera reports motion or smart object/face detection, this plugin samples
frames from the camera's live stream, analyzes them with **any vision AI model**
(Anthropic Claude, OpenAI, Google Gemini, local Ollama, or any OpenAI-compatible
server), and sends rich notifications with snapshots, local timestamps, face
recognition, license plate reading, courier identification, cloud/disk snapshot
archiving, and webhook integrations.

## Key Capabilities

1. **Universal AI Provider & Model Support:** Works with all cloud and local
   providers and models—Claude (`claude-haiku-4-5`, `claude-sonnet-4-5`), OpenAI
   (`gpt-4o-mini`, `gpt-4o`), Google Gemini (`gemini-2.5-flash`, `gemini-2.5-pro`),
   local Ollama (`llama3.2-vision`, `llava`, `qwen2.5vl`, `gemma3`, `minicpm-v`),
   and any custom OpenAI-compatible server (LM Studio, vLLM, LiteLLM, OpenRouter).
2. **Known Faces vs. Unrecognized Faces + Auto-Learning:**
   - Recognizes enrolled household members (`<Name> arrived` + activity alerts)
     and distinguishes unrecognized human faces (`Unrecognized person` alerts).
   - **Auto-learns non-recognized faces:** Crops and saves confirmed new faces to
     `/media/faces/learned` (e.g. `Visitor_1_Front_Door_1.jpg`) for future
     recognition. Rename the file to the person's real name at any time!
3. **Weather & Foliage Filtering:** Ignores rain, wind, falling leaves, snow,
   swaying trees/bushes, and moving shadows using both 32×32 pixel-speckle
   analysis and AI verification.
4. **Frame-vs-Frame & Baseline Change Detection:** Compares the previous baseline
   frame against current frames (in both RGB color and luminance) to detect when
   a car pulls in or leaves, when a **black car is replaced by a red car**, when
   an idle object (chair, bicycle, trash can) suddenly moves, or when a human or
   animal appears.
5. **License Plate Reading (LPR / ANPR):** Reads visible vehicle license plates
   (`licensePlates`) and vehicle color/type (`vehicles`), including them in
   notifications, Scrypted `ObjectDetector` events, and webhooks.
6. **Delivery Couriers vs. Personal Items:** Distinguishes **DHL, Amazon, FedEx,
   USPS, and UPS** couriers (by uniform, logo, or van) and real delivery packages
   from people carrying **handbags, purses, backpacks, trash bags, or groceries**.
7. **Per-Camera On/Off Switches:** Individual toggles on every camera to switch
   **People**, **Vehicles & License Plates**, **Packages & Couriers**, and
   **Animals** On or Off.
8. **Location Date & Time Stamp:** Every alert includes the formatted date and
   time based on your device/location timezone (`locationTimeZone`).
9. **Snapshot Storage & Automatic Retention Cleanup (Home Assistant Disk, Network Drives, Google Drive, Dropbox, WebDAV):**
   - Saves every alert snapshot (`.jpg`) and metadata (`.json`) to `/media/ai-alerts`
     (Home Assistant Media folder), `/share/ai-alerts`, `/config/www/ai-alerts`,
     local drives, or mounted SMB/NFS network shares.
   - Optional direct cloud upload to **Google Drive**, **Dropbox**, and
     **WebDAV / Nextcloud / Synology**.
   - **Automatic Snapshot Deletion:** Configurable retention period (**Delete
     snapshots older than X days**, default `14` days) that automatically prunes
     expired snapshots and date folders on disk and in cloud storage (plus a
     **Delete expired snapshots now** button).
10. **Home Assistant Persistent + Mobile Notifications:** Sends to both Home
    Assistant's **Persistent Notification** panel (`/api/services/persistent_notification/create`)
    and **Companion App** mobile devices (`notify.mobile_app_*`, with automatic
    device discovery if left blank).
11. **Webhooks for Tesla, Android TV / Fire TV, and Home Assistant:** Posts rich
    JSON payloads (including base64 snapshot and Pipup media formatting) for
    Tesla car alerts, Android TV / Fire TV live popup overlays, Home Assistant
    webhook triggers, Node-RED, and n8n.

---

## Tuning with the "Recent recognitions" Panel

The **Recent recognitions** section on the plugin page lists each evaluated face
with its real similarity score, closest match, runner-up, pixel width,
sharpness, and confirmation status, for example:
- `11/16/2026, 10:12:08 PM PST [Front Door] Alex (similarity 0.68, closest Alex, 2nd Bob 0.49, 94px, sharp) — confirmed 2/2 (Alex arrived)`
- `11/16/2026, 10:11:42 PM PST [Front Door] unknown (similarity 0.42, closest Alex, 88px, sharp) — confirmed 3/3 (Visitor_1 alert)`

| Pattern in "Recent recognitions" | What it means | What to change |
|---|---|---|
| `unknown (similarity 0.46, closest Alex, 92px, sharp)` when it really is Alex | Alex's score (`0.46`) is just below the `0.50` match threshold | Lower **Match threshold** slightly (e.g. to `0.44`), or add a clearer reference photo of Alex |
| Stranger is misidentified as `Alex (similarity 0.52, closest Alex)` | Match threshold is too forgiving for that camera/model | Raise **Match threshold** (e.g. from `0.50` to `0.58` or `0.62`) |
| `ambiguous (similarity 0.56, closest Alex, 2nd Bob 0.52, margin 0.04 < 0.06)` | Two enrolled people scored within `0.06` of each other | Lower **Look-alike margin** (e.g. to `0.03`) if it is the right person, or raise to `0.08` if look-alikes mix up |
| Distant passersby trigger `unknown (... 82px, sharp)` alerts | Street faces still exceed 80 px on high-res cameras | Raise **Minimum face width for unknown strangers (px)** (e.g. to `100` or `120` px) |
| Real visitors at the door show `rejected (... unmatched face 70px < 80px unknown gate)` | Wide-angle doorbell makes faces ~70 px wide | Lower **Minimum face width for unknown strangers (px)** to `68` px |
| You don't want arrival alerts for yourself or family members | Enrolled names not in the mute list send `"<Name> arrived"` alerts | Add their names (e.g. `Alex, Sam`) or `family` to **Never notify for these names** |

---

## Notification Channels & Webhook Integration

| Channel | Configuration | Features |
|---|---|---|
| **Home Assistant** | HA URL + Long-lived token (or automatic Supervisor token on HA OS add-on) | Sends to **Persistent Notifications** (sidebar bell) + **Mobile App** (`notify.mobile_app_*`) with snapshot |
| **Webhook** | One or more URLs (HA `/api/webhook/...`, Android/Fire TV `http://<tv>:7979/notify`, Tesla bridge, n8n, Node-RED) | Full JSON metadata + base64 snapshot + Pipup TV overlay fields + optional live stream URL |
| **ntfy** | Topic (optional server URL, token) | Push notification with attached JPEG frame |
| **Pushover** | Application token, user key | Push notification with attached JPEG frame |
| **Telegram** | Bot token, chat ID | Photo message with caption |

---

## Develop and Deploy

1. `npm install`
2. `npm run build`
3. Deploy from VS Code (**Run and Debug > Scrypted Debugger**) or via CLI:
   `npx scrypted login <ip>` then `npm run scrypted-deploy <ip>`.
