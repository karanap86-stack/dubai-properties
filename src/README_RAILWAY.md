README: GitHub → Railway automated deploy

This file shows exactly where to create an API token in Railway and where to add it as a GitHub repository secret so the `.github/workflows/deploy-railway.yml` workflow can deploy the backend automatically on every push to `main`.

1) Create a Railway API key
- Go to https://railway.app and log in.
- Click your avatar (top-right) → "Settings" → "API Access" (or "Tokens").
- Create a new API Key (name it e.g. `github-deploy`) and copy the token value.

2) Add `RAILWAY_TOKEN` to your GitHub repository
- Open GitHub and go to your repository.
- Repository → Settings → Secrets and variables → Actions → New repository secret.
- Name: `RAILWAY_TOKEN`
- Value: paste the Railway API key from step 1.
- Save secret.

3) (Optional) Add project/service IDs
- If you want the workflow to target a specific Railway project or service, create two more repo secrets:
  - `RAILWAY_PROJECT_ID` — the Railway project id (found in Railway project Settings → General)
  - `RAILWAY_SERVICE_ID` — the service id if needed

4) What the workflow does
- On push to `main`, GitHub Actions installs Node, runs `npm ci`, and calls `railwayapp/railway-action@v1` with `RAILWAY_TOKEN` so Railway will deploy the project.

5) One-time steps in Railway (recommended)
- In Railway, create a Project and connect your GitHub repo via Railway UI (optional but helpful).
- Add environment variables in Railway (Project → Settings → Variables):
  - `GOOGLE_SERVICE_ACCOUNT_JSON` (Base64 or raw JSON)
  - `COMMISSION_SHEET_ID` / `SPREADSHEET_ID`
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
  - `OPENAI_API_KEY` (if using AI generation)
  - `SHARED_SECRET`

6) Trigger a deploy
- Push to `main` (or merge a PR). The workflow runs and Railway deploys.
- Check Actions tab in GitHub for build logs. Check Railway project for deploy logs and public URL.

7) Helpful checks
- Test health endpoint:
  ```bash
  curl https://<your-railway-url>/api/health
  ```
- Test export-to-sheets (example):
  ```bash
  curl -X POST https://<your-railway-url>/api/export-to-sheets \
    -H "Content-Type: application/json" \
    -d '{"sheetLink":"https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit","lead":{"name":"Test","email":"a@b.com","phone":"+97150xxxxxxx","selectedProjects":[]}}'
  ```

If you want, I can also add a short `./scripts/deploy-railway.sh` helper that uses the Railway CLI (you'd still need to add the token to your local Railway CLI), or I can walk you through adding the `RAILWAY_TOKEN` in your GitHub UI step-by-step while you paste the token.
