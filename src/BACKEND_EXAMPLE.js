// Example Backend Server (Node.js + Express)
// This file shows how to handle API requests from the frontend

// ===== INSTALLATION =====
// npm install express cors dotenv googleapis nodemailer @google-cloud/sheets
// npm install --save-dev nodemon

// ===== .env File =====
// PORT=3000
// GOOGLE_SHEETS_PRIVATE_KEY=your_private_key
// GOOGLE_SHEETS_CLIENT_EMAIL=your_email
// GOOGLE_PROJECT_ID=your_project_id
// OPENAI_API_KEY=sk_test_your_key
// SENDGRID_API_KEY=your_sendgrid_key
// SMTP_USER=your_email
// SMTP_PASS=your_app_password

// ===== Backend Implementation =====

/*
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { google } from 'googleapis'
import nodemailer from 'nodemailer'
import OpenAI from 'openai'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ===== GOOGLE SHEETS INTEGRATION =====

// Initialize Google Sheets
const sheets = google.sheets('v4')
const auth = new google.auth.GoogleAuth({
  keyFile: './google-service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

// Export data to Google Sheets
app.post('/api/export-to-sheets', async (req, res) => {
  try {
    const { sheetLink, customerInfo, selectedProjects } = req.body
    
    // Extract sheet ID from link
    const sheetId = sheetLink.match(/\/d\/([a-zA-Z0-9-_]+)/)[1]
    
    const authClient = await auth.getClient()
    
    // Get the first sheet ID
    const spreadsheet = await sheets.spreadsheets.get({
      auth: authClient,
      spreadsheetId: sheetId,
    })
    
    const sheetTabId = spreadsheet.data.sheets[0].properties.sheetId
    
    // Prepare data row
    const row = [
      new Date().toISOString(),
      customerInfo.name,
      customerInfo.email,
      customerInfo.phone,
      customerInfo.budget,
      customerInfo.preferences,
      selectedProjects.map(p => p.name).join(', '),
      selectedProjects.map(p => p.roi).join(', '),
      selectedProjects.length,
    ]
    
    // Append to sheet
    await sheets.spreadsheets.values.append({
      auth: authClient,
      spreadsheetId: sheetId,
      range: 'Sheet1!A:I',
      valueInputOption: 'RAW',
      resource: {
        values: [row],
      },
    })
    
    res.json({ success: true, message: 'Data exported successfully' })
  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ===== EMAIL INTEGRATION =====

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Send lead email
app.post('/api/send-email', async (req, res) => {
  try {
    const { customerInfo, selectedProjects } = req.body
    
    // Create HTML email
    const projectsList = selectedProjects
      .map(p => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${p.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${(p.price / 1000000).toFixed(1)}M AED</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${p.roi}%</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${p.appreciation}%</td>
        </tr>
      `)
      .join('')
    
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%); color: white; padding: 20px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .cta { background: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Dubai Properties - Your Lead Summary</h2>
            </div>
            
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${customerInfo.name}</p>
            <p><strong>Email:</strong> ${customerInfo.email}</p>
            <p><strong>Phone:</strong> ${customerInfo.phone}</p>
            <p><strong>Budget:</strong> ${customerInfo.budget} AED</p>
            <p><strong>Preferences:</strong> ${customerInfo.preferences}</p>
            
            <h3>Selected Properties</h3>
            <table>
              <tr style="background: #f0f0f0;">
                <th style="padding: 12px; text-align: left;">Property</th>
                <th style="padding: 12px; text-align: left;">Price</th>
                <th style="padding: 12px; text-align: left;">ROI</th>
                <th style="padding: 12px; text-align: left;">Appreciation</th>
              </tr>
              ${projectsList}
            </table>
            
            <p>Follow up with this lead to discuss investment opportunities.</p>
            
            <a href="https://dubaiproperties.com" class="cta">View More Properties</a>
            
            <p style="margin-top: 40px; color: #999; font-size: 12px;">
              Dubai Properties © 2024. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `
    
    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: customerInfo.email,
      subject: `Your Dubai Properties Lead Summary - ${selectedProjects.length} Properties`,
      html: emailHTML,
    })
    
    res.json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    console.error('Email error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ===== AI CONTENT GENERATION =====

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

app.post('/api/generate-content', async (req, res) => {
  try {
    const { projectData, contentType, tone } = req.body
    
    const prompts = {
      description: `Write a professional property description for a ${projectData.bedrooms} bedroom property in ${projectData.location} with ROI of ${projectData.roi}% and appreciation of ${projectData.appreciation}%. Price: ${projectData.price} AED.`,
      
      marketing: `Create a compelling marketing copy for real estate investors interested in a property in ${projectData.location}. Highlight ROI of ${projectData.roi}% and appreciation of ${projectData.appreciation}%. Make it short and punchy.`,
      
      socialMedia: `Create a social media post (100-150 chars) for a luxury property in ${projectData.location}. Include relevant emojis and hashtags. Price: ${(projectData.price / 1000000).toFixed(1)}M AED.`,
      
      creative: `Create a catchy, creative headline for a real estate property in ${projectData.location} with strong investment potential (ROI: ${projectData.roi}%). Make it memorable and unique.`,
      
      emailCampaign: `Write a professional email campaign for a real estate lead about a property in ${projectData.location}. Include subject line, opening, benefits, and CTA. Tone: ${tone}.`,
    }
    
    const prompt = prompts[contentType] || prompts.description
    
    const message = await openai.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })
    
    res.json({
      success: true,
      content: message.content[0].text,
    })
  } catch (error) {
    console.error('AI generation error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ===== PROJECT DATA ENDPOINT =====

// Mock database - replace with real database
const projects = [
  {
    id: 1,
    name: 'Emaar Downtown',
    location: 'Downtown Dubai',
    price: 1200000,
    bedrooms: 2,
    roi: 8.5,
    appreciation: 12.3,
  },
  // ... more projects
]

app.get('/api/projects', (req, res) => {
  res.json({ success: true, data: projects })
})

// ===== LEAD TRACKING =====

const leads = []

app.post('/api/leads', (req, res) => {
  const lead = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date().toISOString(),
  }
  leads.push(lead)
  res.json({ success: true, lead })
})

app.get('/api/leads', (req, res) => {
  res.json({ success: true, data: leads })
})

// ===== ERROR HANDLING =====

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

// ===== START SERVER =====

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
*/

// ===== PACKAGE.JSON DEPENDENCIES =====
/*
{
  "name": "dubai-properties-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "googleapis": "^118.0.0",
    "nodemailer": "^6.9.3",
    "openai": "^4.20.1",
    "@google-cloud/sheets": "^2.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
*/

// ===== ENVIRONMENT VARIABLES EXAMPLE =====
/*
PORT=3000
NODE_ENV=development

# Google Sheets
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
GOOGLE_SHEETS_CLIENT_EMAIL="your-account@your-project.iam.gserviceaccount.com"
GOOGLE_PROJECT_ID="your-project-id"

# OpenAI
OPENAI_API_KEY="sk-..."

# Email (Gmail)
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"

# SendGrid (Alternative)
SENDGRID_API_KEY="SG...."

# Frontend URL
FRONTEND_URL="http://localhost:5173"
*/

// ===== STARTUP INSTRUCTIONS =====
/*
1. Create backend folder:
   mkdir backend
   cd backend

2. Initialize npm:
   npm init -y

3. Install dependencies:
   npm install express cors dotenv googleapis nodemailer openai

4. Create .env file with variables above

5. Create server.js with code above (uncomment)

6. Start server:
   npm run dev

7. Update frontend apiConfig.js with:
   VITE_BACKEND_URL=http://localhost:3000

8. Test endpoints:
   - POST /api/export-to-sheets
   - POST /api/send-email
   - POST /api/generate-content
   - GET /api/projects
   - POST /api/leads
*/

// Full integrations (if environment variables set) + robust demo fallbacks
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const schedule = require('node-schedule')
require('dotenv').config()

// Optional providers
let { google } = {}
try { google = require('googleapis').google } catch (e) {}
let twilioClient = null
try { const Twilio = require('twilio'); if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) } catch(e) {}
let nodemailer = null
try { nodemailer = require('nodemailer') } catch(e) {}

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000

// Demo stores and scheduled jobs
const forwardedShares = []
const scheduledJobs = {}

const signPayload = (payload) => {
  if (!process.env.SHARED_SECRET) return null
  const crypto = require('crypto')
  return crypto.createHmac('sha256', process.env.SHARED_SECRET).update(JSON.stringify(payload)).digest('hex')
}

// Google auth helpers (service account JSON provided via env variable as JSON string)
const getGoogleAuthClient = () => {
  try {
    if (!google) return null
    const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    if (!keyJson) return null
    const cred = JSON.parse(keyJson)
    const auth = new google.auth.JWT(cred.client_email, null, cred.private_key, ['https://www.googleapis.com/auth/calendar','https://www.googleapis.com/auth/spreadsheets'])
    return auth
  } catch (e) { console.warn('Google auth setup failed', e.message); return null }
}

// Create calendar event - uses Google Calendar when available else demo synthetic event
app.post('/api/create-calendar-event', async (req, res) => {
  try {
    const { summary, description, startISO, endISO, attendees = [], reminders = [] , timezone } = req.body
    const auth = getGoogleAuthClient()
    if (auth && google) {
      try {
        await auth.authorize()
        const calendar = google.calendar({ version: 'v3', auth })
        const event = {
          summary,
          description,
          start: { dateTime: startISO, timeZone: timezone || 'UTC' },
          end: { dateTime: endISO, timeZone: timezone || 'UTC' },
          attendees: attendees.map(a => ({ email: a.email, displayName: a.displayName })),
          reminders: { useDefault: false, overrides: reminders.map(m => ({ method: 'popup', minutes: m })) }
        }
        const created = await calendar.events.insert({ calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary', requestBody: event })
        const eventId = created.data.id
        const htmlLink = created.data.htmlLink

        // schedule server-side notification jobs for reminders (best-effort)
        if (Array.isArray(reminders) && reminders.length) {
          for (const minutesBefore of reminders) {
            const trigger = new Date(new Date(startISO).getTime() - minutesBefore * 60000)
            const jobId = `reminder_${eventId}_${minutesBefore}`
            scheduledJobs[jobId] = schedule.scheduleJob(trigger, async () => {
              console.log('Running reminder job', jobId)
              // implement sending reminder via Twilio / Email
              // This demo just logs; real implementation should fetch lead contact and send notifications
            })
          }
        }

        return res.json({ ok: true, eventId, link: htmlLink })
      } catch (e) {
        console.error('Google Calendar error', e.message)
      }
    }

    // Demo fallback
    const eventId = 'evt_' + Date.now()
    const link = `https://calendar.google.com/event?eid=${eventId}`
    return res.json({ ok: true, eventId, link })
  } catch (e) {
    console.error('create-calendar-event error', e)
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Schedule event reminders via server (node-schedule)
app.post('/api/schedule-event-reminders', (req, res) => {
  try {
    const { eventId, startISO, reminders = [], leadInfo = null } = req.body
    if (!eventId || !startISO) return res.status(400).json({ ok: false, error: 'eventId and startISO required' })
    reminders.forEach(minutesBefore => {
      const when = new Date(new Date(startISO).getTime() - minutesBefore * 60000)
      const jobId = `reminder_${eventId}_${minutesBefore}`
      scheduledJobs[jobId] = schedule.scheduleJob(when, async () => {
        console.log('Reminder firing', jobId)
        try {
          // send WhatsApp via Twilio if configured
          if (twilioClient && leadInfo && leadInfo.phone) {
            const body = `Reminder: ${leadInfo.name || 'Client'} - upcoming ${leadInfo.type || 'appointment'} at ${new Date(startISO).toLocaleString()}`
            await twilioClient.messages.create({ from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, to: `whatsapp:${leadInfo.phone}`, body })
          }
          // send email via nodemailer if configured
          if (nodemailer && process.env.SMTP_HOST) {
            const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: process.env.SMTP_PORT || 587, secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
            await transporter.sendMail({ from: process.env.EMAIL_FROM || process.env.SMTP_USER, to: leadInfo?.email || process.env.SMTP_USER, subject: `Reminder: appointment`, text: `Reminder: appointment at ${new Date(startISO).toLocaleString()}` })
          }
        } catch (e) { console.error('reminder job error', e.message) }
      })
    })
    return res.json({ ok: true, scheduled: reminders.length })
  } catch (e) { res.status(500).json({ ok: false, error: e.message }) }
})

// Trigger reminder immediately (fallback)
app.post('/api/trigger-reminder', async (req, res) => {
  try {
    const { leadId, type, message, leadInfo } = req.body
    // Attempt to send via Twilio and Email immediately
    const results = {}
    try {
      if (twilioClient && leadInfo?.phone) {
        const body = message || `Reminder: upcoming ${type}`
        const m = await twilioClient.messages.create({ from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, to: `whatsapp:${leadInfo.phone}`, body })
        results.twilio = { ok: true, sid: m.sid }
      }
    } catch (e) { results.twilio = { ok: false, error: e.message } }

    try {
      if (nodemailer && process.env.SMTP_HOST) {
        const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: process.env.SMTP_PORT || 587, secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
        await transporter.sendMail({ from: process.env.EMAIL_FROM || process.env.SMTP_USER, to: leadInfo?.email || process.env.SMTP_USER, subject: `Reminder: ${type}`, text: message || `Reminder: upcoming ${type}` })
        results.email = { ok: true }
      }
    } catch (e) { results.email = { ok: false, error: e.message } }

    res.json({ ok: true, results })
  } catch (e) { res.status(500).json({ ok: false, error: e.message }) }
})

// Share lead with partner webhook forwarding with HMAC signing and retries
app.post('/api/share-lead', async (req, res) => {
  try {
    const { partnerId, partnerName, callbackUrl, lead, consent } = req.body
    const payload = { partnerId, partnerName, lead, consent, forwardedAt: new Date().toISOString() }
    forwardedShares.push(payload)
    if (!callbackUrl) return res.json({ ok: true, note: 'stored locally; no callbackUrl provided' })
    const signature = signPayload(payload)
    const headers = signature ? { 'X-Signature': signature } : {}
    // attempt with retry
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const r = await axios.post(callbackUrl, payload, { headers, timeout: 10000 })
        return res.json({ ok: true, status: r.status, data: r.data })
      } catch (e) { console.warn('share attempt failed', attempt+1, e.message); await new Promise(r=>setTimeout(r, 1000 * (attempt+1))) }
    }
    return res.status(502).json({ ok: false, error: 'Failed to forward to partner after retries' })
  } catch (e) { res.status(500).json({ ok: false, error: e.message }) }
})

// Share appointment with partner
app.post('/api/share-appointment', async (req, res) => {
  try {
    const { partner, payload } = req.body
    if (!partner?.callbackUrl) return res.status(400).json({ ok: false, error: 'partner.callbackUrl required' })
    const signature = signPayload(payload)
    const headers = signature ? { 'X-Signature': signature } : {}
    try {
      const r = await axios.post(partner.callbackUrl, payload, { headers, timeout: 10000 })
      return res.json({ ok: true, status: r.status, data: r.data })
    } catch (e) { return res.status(502).json({ ok: false, error: e.message }) }
  } catch (e) { res.status(500).json({ ok: false, error: e.message }) }
})

// Partner update webhook - append to Google Sheet if configured, else write to local file
app.post('/api/partner-update', async (req, res) => {
  try {
    const { leadId, partnerId, status, agreementValue, commissionPercent, notes } = req.body
    const row = { timestamp: new Date().toISOString(), leadId, partnerId, status, agreementValue, commissionPercent, notes }
    // If Google Sheets enabled, append row
    try {
      const auth = getGoogleAuthClient()
      if (auth && google) {
        await auth.authorize()
        const sheets = google.sheets({ version: 'v4', auth })
        const sheetId = process.env.COMMISSION_SHEET_ID
        if (sheetId) {
          await sheets.spreadsheets.values.append({ spreadsheetId: sheetId, range: 'Sheet1!A:F', valueInputOption: 'RAW', requestBody: { values: [[row.timestamp,row.leadId,row.partnerId,row.status,row.agreementValue,row.commissionPercent,row.notes]] } })
          return res.json({ ok: true })
        }
      }
    } catch (e) { console.warn('Google Sheets append failed', e.message) }
    const outPath = path.join(__dirname, 'partner_updates.json')
    const cur = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath)) : []
    cur.push(row)
    fs.writeFileSync(outPath, JSON.stringify(cur, null, 2))
    return res.json({ ok: true, savedTo: outPath })
  } catch (e) { res.status(500).json({ ok: false, error: e.message }) }
})

// Export analytics events to Google Sheets or write to file
app.post('/api/export-analytics-to-sheets', async (req, res) => {
  try {
    const { sheetLink, events } = req.body
    if (!sheetLink || !events) return res.status(400).json({ ok: false, error: 'sheetLink and events required' })
    const auth = getGoogleAuthClient()
    if (auth && google) {
      try {
        await auth.authorize()
        const sheets = google.sheets({ version: 'v4', auth })
        const sheetId = sheetLink.match(/\/d\/([a-zA-Z0-9-_]+)/)[1]
        const values = events.map(e => [e.timestamp, e.type, JSON.stringify(e.payload)])
        await sheets.spreadsheets.values.append({ spreadsheetId: sheetId, range: 'Sheet1!A:C', valueInputOption: 'RAW', requestBody: { values } })
        return res.json({ ok: true })
      } catch (e) { console.warn('Sheets append failed', e.message) }
    }
    const file = path.join(__dirname, `analytics_export_${Date.now()}.json`)
    fs.writeFileSync(file, JSON.stringify({ exportedAt: new Date().toISOString(), events }, null, 2))
    return res.json({ ok: true, savedTo: file })
  } catch (e) { res.status(500).json({ ok: false, error: e.message }) }
})

// Export lead or arbitrary rows to Google Sheets (link or spreadsheetId)
app.post('/api/export-to-sheets', async (req, res) => {
  try {
    const { sheetLink, spreadsheetId, rows, lead } = req.body
    // rows: optional array of arrays to append. lead: optional lead object to convert to row
    let sheetId = spreadsheetId
    if (!sheetId && sheetLink) {
      const m = sheetLink.match(/\/d\/([a-zA-Z0-9-_]+)/)
      if (m) sheetId = m[1]
    }
    if (!sheetId) return res.status(400).json({ ok: false, error: 'spreadsheetId or sheetLink required' })

    const auth = getGoogleAuthClient()
    if (auth && google) {
      try {
        await auth.authorize()
        const sheets = google.sheets({ version: 'v4', auth })

        let values = []
        if (Array.isArray(rows) && rows.length) {
          values = rows
        } else if (lead) {
          const selectedNames = (lead.selectedProjects || []).map(p => p.name).join(', ')
          values = [[
            new Date().toISOString(),
            lead.id || lead.leadId || '',
            lead.name || lead.customerInfo?.name || '',
            lead.email || lead.customerInfo?.email || '',
            lead.phone || lead.customerInfo?.phone || '',
            lead.budget || lead.customerInfo?.budget || '',
            lead.preferences || lead.customerInfo?.preferences || '',
            selectedNames,
            (lead.selectedProjects || []).length,
            lead.discussionSummary || ''
          ]]
        } else {
          return res.status(400).json({ ok: false, error: 'rows or lead required' })
        }

        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: 'Sheet1!A:Z',
          valueInputOption: 'RAW',
          requestBody: { values }
        })
        return res.json({ ok: true })
      } catch (e) { console.warn('Sheets append failed', e.message) }
    }

    // Fallback: write to a local file
    const out = path.join(__dirname, `sheets_fallback_${sheetId || 'local'}.json`)
    const payload = { exportedAt: new Date().toISOString(), rows, lead }
    fs.writeFileSync(out, JSON.stringify(payload, null, 2))
    return res.json({ ok: true, savedTo: out })
  } catch (e) { res.status(500).json({ ok: false, error: e.message }) }
})

// Health and debug
app.get('/api/health', (req, res) => res.json({ ok: true, now: new Date().toISOString() }))
app.get('/api/forwarded-shares', (req, res) => res.json({ ok: true, forwardedShares }))

app.listen(PORT, () => console.log(`Example backend listening on http://localhost:${PORT}`))
