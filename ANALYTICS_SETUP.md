Analytics integration and Looker Studio (Google Data Studio) guide

Overview

This project ships a lightweight client-side analytics collector that stores events in `localStorage` and provides CSV export. For free integration with Google Data Studio (now Looker Studio), the simplest reliable method is to push analytics rows into a Google Sheet and use that sheet as a Data Source in Looker Studio.

Options

1) Quick: Export CSV or Push to Google Sheets via backend
   - The app can export collected events as CSV (`AnalyticsDashboard` Export CSV button).
   - For live dashboards, call a backend endpoint which writes analytics rows to Google Sheets using a service account. The frontend helper `analytics.pushEventsToSheets(sheetLink)` posts to `/api/export-analytics-to-sheets` (backend must implement).

2) Direct Sheets API (recommended for automation)
   - Backend receives events and appends rows to a Google Sheet with columns: `timestamp, eventType, leadId, payloadJSON`.
   - Use a Google Service Account with Sheets API enabled. Share the target sheet with the service account email.
   - In Looker Studio, create a new Data Source -> Google Sheets -> select the appended sheet.

3) BigQuery (larger scale)
   - For high-volume production, send events to BigQuery. Looker Studio supports BigQuery as a data source (not free in general).

Recommended sheet schema

- Column A: `timestamp` (ISO)
- Column B: `event_type` (e.g., lead_created, notification_sent, note_added)
- Column C: `lead_id`
- Column D: `payload` (JSON string)

Sample rows

2025-12-25T12:34:56Z,lead_created,1700000000000,"{"customer":"John Doe","budget":"2M"}"

Looker Studio dashboards to create (use as starting templates)

- Lead Funnel
  - Metrics: total leads, new leads (7/30/90 days), leads by temperature (hot/warm/cold)
  - Visuals: scorecards, pie chart (by temperature), time series for new leads/day

- Notifications & Response
  - Metrics: notifications sent (total), notifications by channel (whatsapp/email)
  - Visuals: bar chart by day, table of failed sends (if backend enriches events)

- Top Projects & Interest
  - Metrics: top selected projects, selections over time
  - Visuals: table of top projects, sparkline of selections/day

- Conversion & Lifecycle
  - Metrics: leads by status (active, dropped, closed, booked), time-to-close (if recorded)
  - Visuals: funnel/stacked bar chart

How to connect sheet to Looker Studio

1. Open Looker Studio (datastudio.google.com)
2. Create new report -> Add Data -> Google Sheets
3. Select your spreadsheet and sheet/tab with analytics rows
4. Configure types: timestamp -> Date/Time, event_type -> Dimension, payload -> text
5. Build charts using computed fields (e.g., parse JSON in `payload` if needed using formulas or transform when writing rows)

Automation tips

- When writing rows to Google Sheets from backend, include flattened fields (e.g., lead_temperature, project_name) in separate columns to simplify charting in Looker Studio.
- Keep a separate sheet for aggregated daily counts (append a daily rollup job) to improve performance for large datasets.

Security

- Never embed Google service account credentials in frontend code.
- Store credentials on the backend and restrict write access to the specific target sheet.

Backend endpoints (recommended)

- POST /api/export-analytics-to-sheets
  - Payload: { sheetLink: string, events: [ { id, type, timestamp, payload } ] }
  - Behavior: append rows to Google Sheet. Return { ok: true }

- POST /api/analytics/ingest
  - Payload: single event (optional). Useful for ingesting real-time events from frontend to backend for reliable storage.

Next steps

- I can implement the backend `/api/export-analytics-to-sheets` example handler in `BACKEND_EXAMPLE.js` and add a small scheduled rollup (daily aggregates) if you want. Tell me if you prefer Google Sheets or BigQuery as the primary data sink.
