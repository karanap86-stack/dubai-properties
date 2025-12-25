# Deploying Frontend to Netlify + Backend Options (Free-tier)

This guide shows how to deploy the frontend to Netlify from GitHub and gives two simple free-tier backend approaches: (A) use Netlify Functions to forward requests to your backend or (B) run the example backend on a small free host. It also covers Google Sheets service-account setup for realtime syncing.

**Summary (recommended):**
- Deploy the React frontend to Netlify (GitHub integration).
- Use `netlify/functions` for lightweight serverless endpoints that forward to your backend (`BACKEND_EXAMPLE.js`) or call Google Sheets directly.
- Store secrets (service account JSON, API keys) in Netlify Environment Variables.

## 1) Prepare your repo and frontend build

1. Initialize git and push to GitHub (if not already):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
# create repo on GitHub then:
git remote add origin https://github.com/<your-org>/<your-repo>.git
git push -u origin main
```

2. Confirm your frontend build command and publish directory. Most Vite projects use:

- Build command: `npm run build`
- Publish directory: `dist`

If you use CRA, the publish directory is `build`.

## 2) Netlify site setup (UI)

1. Go to https://app.netlify.com and log in.
2. "New site from Git" → choose GitHub → pick your repo.
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist` (or `build` for CRA)
   - Functions directory: `netlify/functions`
4. Connect and deploy. Netlify will build and publish your site.

## 3) Environment variables (Netlify UI)

In your site's settings → Build & deploy → Environment → Environment variables, add values (example names used in this project):

- `VITE_BACKEND_URL` — if you host the full backend separately (e.g. `https://my-backend.example.com`).
- `BACKEND_URL` — used by Netlify Function wrapper if present.
- `GOOGLE_SERVICE_ACCOUNT_JSON` — the service account JSON (stringified). If the JSON has newlines, either paste it as a single-line JSON or Base64-encode it and decode inside code.
- `COMMISSION_SHEET_ID` — Google Sheet ID for partner commissions (optional).
- `SPREADSHEET_ID` — generic spreadsheet id used by the function/backend (optional).
- Twilio/SMS/Email keys: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, etc.
- `SHARED_SECRET` — HMAC secret for partner webhook signing.

IMPORTANT: Never commit service account JSON or API keys to the repository.

## 4) Google Sheets & Service Account setup

1. Create a Google Cloud project: https://console.cloud.google.com
2. Enable the Google Sheets API and Google Calendar API (if using calendar).
3. Create a service account (IAM & Admin → Service accounts).
4. Create a JSON key for that service account and copy the JSON.
5. Share the target Google Sheet with the service account email (the `client_email` in the JSON) with Editor access.
6. In Netlify env, set `GOOGLE_SERVICE_ACCOUNT_JSON` to the full JSON (string). If you prefer, Base64-encode the JSON and set `GOOGLE_SERVICE_ACCOUNT_JSON_B64` instead.
7. In env set `COMMISSION_SHEET_ID` and `SPREADSHEET_ID` to your sheet IDs (the string in the sheet URL after `/d/`).

## 5) Netlify Functions: forwarder or direct Sheets

- Simple forwarder (recommended): keep your backend running (e.g. hosted separately) and add a Netlify Function that forwards requests to the backend (example in `netlify/functions/forward-to-backend.js`). This is the easiest "free" approach if your backend is hosted elsewhere.

- Direct Sheets inside a serverless function: possible, but keep these caveats in mind:
  - Execution time and memory are limited for serverless functions — large batches or long-running tasks may fail.
  - Service account JSON stored in env must be parsed and used in the function.

## 6) Local testing with Netlify CLI

Install Netlify CLI for local dev:

```bash
npm install -g netlify-cli
netlify dev
```

This will run the site and local functions. Set up a `.env` file for local testing (do NOT commit it):

```env
VITE_BACKEND_URL=http://localhost:3000
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":...}'
COMMISSION_SHEET_ID=<your-sheet-id>
```

## 7) Backend hosting options (free-tier notes)

- Option A — Netlify Functions: convenient for simple forwards and light-weight Sheets appends.
- Option B — Host the full `BACKEND_EXAMPLE.js` on a small free instance (if available): Render / Fly / Railway historically offered free tiers; check current provider terms. If you need reliable scheduled jobs (reminders), a persistent server or scheduled serverless setup is more robust.

If you host the full Node backend separately, set `VITE_BACKEND_URL` and/or `BACKEND_URL` in Netlify environment variables to point to it.

## 8) Deploy flow

1. Push changes to GitHub.
2. Netlify auto-deploys (or trigger deploy from Netlify UI).
3. Verify functions and endpoints via Netlify's function logs or `netlify dev`.
4. Test Google Sheets export by creating a lead in the app or calling the function endpoint.

## 9) Troubleshooting tips

- If Sheets append returns permission errors, ensure the sheet is shared with the service account email.
- If large JSON fails as env var, use Base64 encode and decode in the function or store the key in a secure secrets store.
- For scheduled reminders, serverless schedules may not be ideal — consider a tiny hosted server or scheduler (cron, Render cron jobs, or external scheduler).

---

If you want, I can now:
- Create `netlify.toml` and a forwarding Netlify Function (I will add both),
- Or implement a serverless Sheets append function (direct Sheets access) instead of the forwarder.

Which do you prefer: forwarder (easier) or direct Sheets in Netlify Function (more involved)?
