// Backend API Implementation for WhatsApp & Email Notifications
// This is an example implementation using Twilio for WhatsApp and Nodemailer for email

/*

// ===== INSTALLATION =====
npm install twilio nodemailer dotenv express

// ===== ENVIRONMENT VARIABLES (.env) =====
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886  // Twilio sandbox number
TWILIO_TO_NUMBER=+917028923314       // Recipient number

SMTP_USER=karanap86@gmail.com
SMTP_PASS=your_app_specific_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

ADMIN_EMAIL=karanap86@gmail.com

// ===== SERVER CODE =====

import express from 'express'
import twilio from 'twilio'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(express.json())

// ===== TWILIO CLIENT =====
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

// ===== EMAIL TRANSPORTER =====
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// ===== SEND WHATSAPP NOTIFICATION =====
app.post('/api/send-whatsapp', async (req, res) => {
  try {
    const { phoneNumber, message, isDuplicate, duplicateOf } = req.body

    // Format phone number if needed
    const formattedNumber = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : '+' + phoneNumber

    // Add duplicate indicator to message
    let finalMessage = message
    if (isDuplicate) {
      finalMessage = `⚠️ DUPLICATE LEAD\n${message}`
    }

    // Send via Twilio WhatsApp
    const result = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`,
      body: finalMessage
    })

    console.log(`WhatsApp sent to ${phoneNumber}: ${result.sid}`)

    res.json({
      success: true,
      messageId: result.sid,
      isDuplicate,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('WhatsApp error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// ===== SEND EMAIL NOTIFICATION =====
app.post('/api/send-email-notification', async (req, res) => {
  try {
    const { to, subject, leadData, isDuplicate, timestamp } = req.body

    // Build email HTML
    const propertiesHTML = leadData.selectedProjects
      .map(p => `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">${p.name}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${p.location}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${(p.price / 1000000).toFixed(1)}M AED</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${p.roi}%</td>
        </tr>
      `)
      .join('')

    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; background: #f5f5f5; }
            .container { max-width: 600px; margin: 20px auto; background: white; padding: 20px; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .duplicate-alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; color: #92400e; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f0f0f0; padding: 12px; text-align: left; font-weight: bold; border: 1px solid #ddd; }
            td { padding: 10px; border: 1px solid #ddd; }
            .temperature { display: inline-block; padding: 8px 12px; border-radius: 4px; font-weight: bold; margin: 10px 0; }
            .hot { background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; }
            .warm { background: linear-gradient(135deg, #eab308 0%, #f97316 100%); color: white; }
            .cold { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; }
            .footer { background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 4px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎉 ${isDuplicate ? '⚠️ DUPLICATE LEAD' : 'NEW LEAD'} - Dubai Properties</h2>
            </div>

            ${isDuplicate ? `
              <div class="duplicate-alert">
                <strong>⚠️ Duplicate Alert:</strong> This customer has been seen before. Check conversation history and mark appropriately.
              </div>
            ` : ''}

            <h3>Customer Information</h3>
            <table>
              <tr>
                <td style="font-weight: bold; width: 30%;">Name</td>
                <td>${leadData.customerInfo.name}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Email</td>
                <td>${leadData.customerInfo.email}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Phone</td>
                <td>${leadData.customerInfo.phone || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Budget</td>
                <td>${leadData.customerInfo.budget || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Preferences</td>
                <td>${leadData.customerInfo.preferences || 'None'}</td>
              </tr>
            </table>

            <h3>Interested Properties (${leadData.selectedProjects.length})</h3>
            <table>
              <thead>
                <tr>
                  <th>Property Name</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>ROI</th>
                </tr>
              </thead>
              <tbody>
                ${propertiesHTML}
              </tbody>
            </table>

            <h3>Lead Temperature</h3>
            <p>
              <span class="temperature ${leadData.temperature || 'warm'}">${(leadData.temperature || 'warm').toUpperCase()}</span>
            </p>

            <div class="footer">
              <p>Generated: ${new Date(timestamp).toLocaleString()}</p>
              <p>
                <strong>Quick Actions:</strong> 
                <a href="https://your-platform.com/leads/${leadData.id}" style="color: #06b6d4; text-decoration: none;">View in Dashboard</a>
                | 
                <a href="mailto:${leadData.customerInfo.email}" style="color: #06b6d4; text-decoration: none;">Reply to Lead</a>
              </p>
              <p style="margin-top: 10px; color: #999;">Dubai Properties © 2024</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email
    await emailTransporter.sendMail({
      from: process.env.SMTP_USER,
      to: to || process.env.ADMIN_EMAIL,
      subject: subject,
      html: emailHTML
    })

    console.log(`Email sent to ${to || process.env.ADMIN_EMAIL}`)

    res.json({
      success: true,
      message: 'Email sent successfully',
      isDuplicate,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Email error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// ===== BULK SMS/WHATSAPP TO HOT LEADS =====
app.post('/api/send-to-hot-leads', async (req, res) => {
  try {
    const { message } = req.body
    const leads = require('./leadService').getHotLeads()

    const results = []
    for (const lead of leads) {
      if (lead.customerInfo.phone) {
        try {
          const result = await twilioClient.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${lead.customerInfo.phone}`,
            body: message
          })
          results.push({ leadId: lead.id, success: true, messageId: result.sid })
        } catch (err) {
          results.push({ leadId: lead.id, success: false, error: err.message })
        }
      }
    }

    res.json({
      success: true,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    })

  } catch (error) {
    console.error('Bulk send error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// ===== GET LEAD STATISTICS =====
app.get('/api/lead-statistics', (req, res) => {
  try {
    const stats = require('./leadService').getLeadStatistics()
    res.json({
      success: true,
      statistics: stats
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

*/

// ===== TWILIO SETUP GUIDE =====
/*
1. Go to twilio.com and create account
2. Get Account SID and Auth Token from dashboard
3. Enable WhatsApp in Sandbox mode
4. Get Twilio WhatsApp number
5. Send "join message" to sandbox number to activate
6. Add environment variables to .env
7. Update recipient phone numbers

TWILIO WHATSAPP SANDBOX SETUP:
- Visit: https://www.twilio.com/console/sms/whatsapp/learn
- Follow sandbox setup
- Send "join" keyword to activate
- Can add up to 100 participants
*/

// ===== GMAIL SETUP GUIDE =====
/*
1. Enable 2-factor authentication on Gmail
2. Go to myaccount.google.com/apppasswords
3. Generate app password for "Mail" and "Windows"
4. Copy the 16-character password
5. Use in SMTP_PASS environment variable
6. Make sure SMTP_USER is set to your Gmail address
*/

console.log('Backend examples for WhatsApp and Email notifications configured.')
console.log('See above for implementation details and setup instructions.')

// ===== GOOGLE CALENDAR & CRM SHARING =====
/*
Google Calendar endpoints (backend)

POST /api/create-calendar-event
 - Create a calendar event and invite attendees.
 - Payload: { summary, description, startISO, endISO, attendees, timezone }
 - Response: { ok: true, eventId, link }

POST /api/schedule-event-reminders
 - Schedule reminders (if not using calendar native reminders).
 - Payload: { eventId, reminders: [minutesBefore] }

POST /api/trigger-reminder
 - Trigger an immediate reminder to client/owner (fallback).
 - Payload: { leadId, type: 'visit'|'meeting'|'call', message }

CRM sharing endpoints and partner workflow

POST /api/share-lead
 - Forwards a lead to partner CRM or webhook URL.
 - Payload: { partnerId, partnerName, callbackUrl, lead }
 - Backend should POST to partner callback and save acknowledgement.

POST /api/partner-update
 - Partner calls this webhook to update outcome and commission.
 - Payload: { leadId, partnerId, status, agreementValue, commissionPercent, notes }
 - Backend should update lead records and append a row to the commission Google Sheet:
   Columns: timestamp, leadId, partnerId, partnerName, status, agreementValue, commissionPercent, notes

Reminder rules (frontend behavior)
- When appointment is created via `createAppointment()` in `leadService`:
  - Calls: notifications to owner only (WhatsApp + email) and calendar invite to owner.
  - Meetings/Visits: notifications to both client and owner (WhatsApp + email), calendar invites sent to both.
  - Reminders should be sent per `reminderMinutes` array (e.g., [60,30,10]) via calendar or backend.

Security & consent
- Always obtain client consent before sharing lead data with partners.
- Use secure signed webhook calls (HMAC) and verify partner callbacks on backend.

*/
