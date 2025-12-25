// Send WhatsApp birthday wishes to clients whose birthday is today
export const sendBirthdayWishesToClients = async () => {
  const leads = getAllLeads();
  const today = new Date();
  const todayStr = `${today.getMonth() + 1}`.padStart(2, '0') + '-' + `${today.getDate()}`.padStart(2, '0');
  let count = 0;
  for (const lead of leads) {
    const birthdate = lead.customerInfo?.birthdate; // Expecting 'YYYY-MM-DD'
    const phone = lead.customerInfo?.phone;
    if (birthdate && phone) {
      const [, month, day] = birthdate.split('-');
      if (`${month}-${day}` === todayStr) {
        const message = `Happy Birthday, ${lead.customerInfo.name}! 🎉\nWishing you a year filled with happiness, success, and beautiful moments.\n\nWarm wishes,\nKaran Ashutosh Poptani`;
        try {
          await fetch('/api/send-whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: phone, message, isBirthday: true })
          });
          count++;
        } catch (e) {
          console.error('Failed to send birthday wish to', phone, e);
        }
      }
    }
  }
  return { success: true, count };
}
// Send festive WhatsApp wishes to all clients
export const sendFestiveWishesToAllClients = async (occasion = "Festive Season") => {
  const leads = getAllLeads();
  const uniquePhones = Array.from(new Set(leads.map(l => l.customerInfo?.phone).filter(Boolean)));
  const message = `Wishing you and your family a wonderful ${occasion}! May your home be filled with joy, success, and new beginnings.\n\nWarm regards,\nKaran Ashutosh Poptani`;
  for (const phone of uniquePhones) {
    try {
      await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, message, isFestive: true })
      });
    } catch (e) {
      console.error('Failed to send festive wish to', phone, e);
    }
  }
  return { success: true, count: uniquePhones.length };
}
// Lead Management & Notification Service
// Handles lead tracking, duplicate detection, notifications and analytics hooks

import analytics from './analyticsService'
import calendarService from './calendarService'

export const LEAD_STORAGE_KEY = 'dubai_properties_leads'

// Lead temperature types
export const LEAD_TEMPERATURE = {
  HOT: 'hot',      // Highly interested, ready to invest
  WARM: 'warm',    // Interested, considering options
  COLD: 'cold'     // Just browsing, not immediate buyer
}

// Get all stored leads
export const getAllLeads = () => {
  try {
    const leads = localStorage.getItem(LEAD_STORAGE_KEY)
    return leads ? JSON.parse(leads) : []
  } catch (error) {
    console.error('Error getting leads:', error)
    return []
  }
}

// Save new lead
export const saveLead = (leadData) => {
  try {
    const leads = getAllLeads()
    const newLead = {
      id: Date.now(),
      ...leadData,
      temperature: leadData.temperature || LEAD_TEMPERATURE.WARM,
      isDuplicate: false,
      status: leadData.status || 'active', // active | dropped | closed | booked
      discussionSummary: leadData.discussionSummary || '',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      notes: leadData.notes || '',
      conversationHistory: []
    }
    
    // Check for duplicates
    const duplicateCheck = checkForDuplicate(newLead, leads)
    if (duplicateCheck.isDuplicate) {
      newLead.isDuplicate = true
      newLead.duplicateOf = duplicateCheck.duplicateLeadId
    }
    
    leads.push(newLead)
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
    // record analytics event
    try { analytics.recordEvent('lead_created', { leadId: newLead.id, temperature: newLead.temperature, isDuplicate: newLead.isDuplicate }) } catch(e){}
    return newLead
  } catch (error) {
    console.error('Error saving lead:', error)
    throw error
  }
}

// Update lead discussion summary
export const updateDiscussionSummary = (leadId, summary) => {
  try {
    const leads = getAllLeads()
    const lead = leads.find(l => l.id === leadId)
    if (lead) {
      lead.discussionSummary = summary
      lead.lastUpdated = new Date().toISOString()
      localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
      try { analytics.recordEvent('discussion_updated', { leadId, length: (summary||'').length }) } catch(e){}
      return lead
    }
    throw new Error('Lead not found')
  } catch (error) {
    console.error('Error updating discussion summary:', error)
    throw error
  }
}


// Check for duplicate leads
export const checkForDuplicate = (newLead, existingLeads) => {
  const emailDuplicate = existingLeads.find(
    lead => lead.customerInfo.email.toLowerCase() === newLead.customerInfo.email.toLowerCase()
  )
  
  const phoneDuplicate = existingLeads.find(
    lead => lead.customerInfo.phone === newLead.customerInfo.phone
  )
  
  if (emailDuplicate || phoneDuplicate) {
    return {
      isDuplicate: true,
      duplicateLeadId: emailDuplicate?.id || phoneDuplicate?.id,
      reason: emailDuplicate ? 'email' : 'phone'
    }
  }
  
  return { isDuplicate: false }
}

// Update lead temperature
export const updateLeadTemperature = (leadId, temperature) => {
  try {
    const leads = getAllLeads()
    const lead = leads.find(l => l.id === leadId)
    
    if (lead) {
      lead.temperature = temperature
      lead.lastUpdated = new Date().toISOString()
      localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
      return lead
    }
  } catch (error) {
    console.error('Error updating lead temperature:', error)
    throw error
  }
}

// Add conversation note to lead
export const addLeadNote = (leadId, note, type = 'note') => {
  try {
    const leads = getAllLeads()
    const lead = leads.find(l => l.id === leadId)
    
    if (lead) {
      lead.conversationHistory.push({
        timestamp: new Date().toISOString(),
        type, // 'note', 'call', 'email', 'whatsapp'
        content: note
      })
      lead.lastUpdated = new Date().toISOString()
      localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
      try { analytics.recordEvent('note_added', { leadId, type, length: (note||'').length }) } catch(e){}
      return lead
    }
  } catch (error) {
    console.error('Error adding note:', error)
    throw error
  }
}

// Add a project to a lead's selected projects
export const addProjectToLead = (leadId, project) => {
  try {
    const leads = getAllLeads()
    const lead = leads.find(l => l.id === leadId)
    if (!lead) throw new Error('Lead not found')
    lead.selectedProjects = lead.selectedProjects || []
    if (!lead.selectedProjects.find(p => p.id === project.id)) {
      lead.selectedProjects.push(project)
      lead.lastUpdated = new Date().toISOString()
      localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
    }
    return lead
  } catch (error) {
    console.error('Error adding project to lead:', error)
    throw error
  }
}

export const removeProjectFromLead = (leadId, projectId) => {
  try {
    const leads = getAllLeads()
    const lead = leads.find(l => l.id === leadId)
    if (!lead) throw new Error('Lead not found')
    lead.selectedProjects = (lead.selectedProjects || []).filter(p => p.id !== projectId)
    lead.lastUpdated = new Date().toISOString()
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
    return lead
  } catch (error) {
    console.error('Error removing project from lead:', error)
    throw error
  }
}

// Appointment management
export const createAppointment = async (leadId, { type = 'visit', title = '', startISO, endISO, location = '', reminderMinutes = [60,30,10], notes = '' }) => {
  try {
    const leads = getAllLeads()
    const lead = leads.find(l => l.id === leadId)
    if (!lead) throw new Error('Lead not found')

    lead.appointments = lead.appointments || []
    const appt = {
      id: Date.now(),
      type, // 'call' | 'meeting' | 'visit'
      title: title || `${type.charAt(0).toUpperCase()+type.slice(1)} with ${lead.customerInfo.name}`,
      startISO,
      endISO,
      location,
      reminderMinutes,
      notes,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    }

    // create calendar event via backend
    const attendees = [
      { email: lead.customerInfo.email, displayName: lead.customerInfo.name },
      { email: process.env?.OWNER_EMAIL || 'karanap86@gmail.com', displayName: 'Owner' }
    ].filter(a => a.email)

    const calResp = await calendarService.createCalendarEvent({ summary: appt.title, description: notes, startISO, endISO, attendees })
    if (calResp && calResp.eventId) appt.calendarEventId = calResp.eventId

    lead.appointments.push(appt)
    lead.lastUpdated = new Date().toISOString()
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))

    try { analytics.recordEvent('appointment_created', { leadId, appointmentId: appt.id, type }) } catch(e){}

    // schedule reminders via backend (if calendar didn't already schedule)
    if (appt.calendarEventId) {
      try { await calendarService.scheduleReminders({ eventId: appt.calendarEventId, reminders: reminderMinutes }) } catch(e){}
    }

    // send initial notifications: client (whatsapp/email) and owner (whatsapp/email)
    const payloadLead = { ...lead, selectedProjects: lead.selectedProjects || [] }
    if (type === 'call') {
      // calls: notify owner only
      await sendWhatsAppNotification(payloadLead)
      await sendEmailNotification(payloadLead)
    } else {
      // meetings/visits: notify both
      await sendWhatsAppToClient(payloadLead)
      await sendEmailToClient(payloadLead)
      await sendWhatsAppNotification(payloadLead)
      await sendEmailNotification(payloadLead)
    }

    // share appointment updates with any partnered organizations according to consent
    try { if (typeof shareAppointmentWithPartner === 'function') await shareAppointmentWithPartner(lead.id, appt.id) } catch(e) { console.error('partner share appointment error', e) }

    return appt
  } catch (error) {
    console.error('createAppointment error:', error)
    throw error
  }
}

export const cancelAppointment = (leadId, appointmentId) => {
  try {
    const leads = getAllLeads()
    const lead = leads.find(l => l.id === leadId)
    if (!lead) throw new Error('Lead not found')
    lead.appointments = (lead.appointments || []).map(a => a.id === appointmentId ? { ...a, status: 'canceled', canceledAt: new Date().toISOString() } : a)
    lead.lastUpdated = new Date().toISOString()
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
    try { analytics.recordEvent('appointment_canceled', { leadId, appointmentId }) } catch(e){}
    return true
  } catch (e) {
    console.error('cancelAppointment error', e)
    throw e
  }
}

export const completeAppointment = (leadId, appointmentId, outcome = {}) => {
  try {
    const leads = getAllLeads()
    const lead = leads.find(l => l.id === leadId)
    if (!lead) throw new Error('Lead not found')
    let appt = null
    lead.appointments = (lead.appointments || []).map(a => {
      if (a.id === appointmentId) { appt = { ...a, status: 'done', completedAt: new Date().toISOString(), outcome } ; return appt }
      return a
    })
    lead.lastUpdated = new Date().toISOString()
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
    try { analytics.recordEvent('appointment_completed', { leadId, appointmentId, outcome }) } catch(e){}
    return appt
  } catch (e) {
    console.error('completeAppointment error', e)
    throw e
  }
}


// Mark lead statuses
export const markLeadDropped = (leadId) => {
  try {
    const leads = getAllLeads()
    const lead = leads.find(l => l.id === leadId)
    if (!lead) throw new Error('Lead not found')
    lead.status = 'dropped'
    lead.lastUpdated = new Date().toISOString()
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
    return lead
  } catch (error) {
    console.error('Error marking lead dropped:', error)
    throw error
  }
}

export const markLeadClosed = (leadId) => {
  try {
    const leads = getAllLeads()
    const lead = leads.find(l => l.id === leadId)
    if (!lead) throw new Error('Lead not found')
    lead.status = 'closed'
    lead.lastUpdated = new Date().toISOString()
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
    return lead
  } catch (error) {
    console.error('Error marking lead closed:', error)
    throw error
  }
}

export const markLeadBooked = (leadId) => {
  try {
    const leads = getAllLeads()
    const lead = leads.find(l => l.id === leadId)
    if (!lead) throw new Error('Lead not found')
    lead.status = 'booked'
    lead.lastUpdated = new Date().toISOString()
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
    return lead
  } catch (error) {
    console.error('Error marking lead booked:', error)
    throw error
  }
}

// Send WhatsApp notification
export const sendWhatsAppNotification = async (leadData) => {
  try {
    // Using Twilio or similar WhatsApp API
    // In production, call your backend endpoint
    const rawSummary = (leadData.discussionSummary || '').toString().trim().replace(/\s+/g, ' ')
    const shortSummary = rawSummary ? (rawSummary.length > 200 ? rawSummary.slice(0,197) + '...' : rawSummary) : ''
    const summaryLine = shortSummary ? `\nSummary: ${shortSummary}\n` : '\n'

    const message = `🔥 New Lead Generated!\n\nName: ${leadData.customerInfo.name}\nEmail: ${leadData.customerInfo.email}\nPhone: ${leadData.customerInfo.phone}\nBudget: ${leadData.customerInfo.budget}\nProperties: ${leadData.selectedProjects.length}${summaryLine}\nLogin to dashboard to follow up.`
    
    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: '+917028923314',
        message,
        isDuplicate: leadData.isDuplicate,
        duplicateOf: leadData.duplicateOf
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to send WhatsApp notification')
    }
    
    return await response.json()
  } catch (error) {
    console.error('WhatsApp notification error:', error)
    // Don't throw - notifications are not critical
    return { success: false, error: error.message }
  }
}

// Send email notification
export const sendEmailNotification = async (leadData) => {
  try {
    const rawSummary = (leadData.discussionSummary || '').toString().trim().replace(/\s+/g, ' ')
    const shortSummary = rawSummary ? (rawSummary.length > 500 ? rawSummary.slice(0,497) + '...' : rawSummary) : ''
    const emailBody = `Name: ${leadData.customerInfo.name}\nEmail: ${leadData.customerInfo.email}\nPhone: ${leadData.customerInfo.phone || 'N/A'}\nBudget: ${leadData.customerInfo.budget || 'N/A'}\nProperties: ${leadData.selectedProjects.length}\n\nDiscussion Summary: ${shortSummary}\n\nView full details in the dashboard.`

    const emailContent = {
      to: 'karanap86@gmail.com',
      subject: `${leadData.isDuplicate ? '⚠️ DUPLICATE - ' : '🎉 NEW '} Lead: ${leadData.customerInfo.name}`,
      body: emailBody,
      leadData,
      isDuplicate: leadData.isDuplicate,
      duplicateOf: leadData.duplicateOf,
      timestamp: new Date().toISOString()
    }
    
    const response = await fetch('/api/send-email-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent)
    })
    
    if (!response.ok) {
      throw new Error('Failed to send email notification')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Email notification error:', error)
    return { success: false, error: error.message }
  }
}

// Build short WhatsApp message for client
const buildClientWhatsAppMessage = (leadData) => {
  const name = leadData.customerInfo.name || 'there'
  const rawSummary = (leadData.discussionSummary || '').toString().trim().replace(/\s+/g, ' ')
  const shortSummary = rawSummary ? (rawSummary.length > 120 ? rawSummary.slice(0,117) + '...' : rawSummary) : ''
  const summaryPart = shortSummary ? `\n\nSummary: ${shortSummary}` : ''
  return `Hi ${name}, thanks for your interest. We will contact you shortly to assist with your property search.${summaryPart}\n\n— Dubai Properties Team`
}

// Build detailed email body for client with property details and ROI/appreciation
const buildClientEmailBody = (leadData) => {
  const name = leadData.customerInfo.name || ''
  const prefs = leadData.customerInfo.preferences || 'N/A'
  const budget = leadData.customerInfo.budget || 'N/A'
  const rawSummary = (leadData.discussionSummary || '').toString().trim().replace(/\s+/g, ' ')
  const shortSummary = rawSummary ? (rawSummary.length > 1000 ? rawSummary.slice(0,997) + '...' : rawSummary) : ''

  let projectsText = ''
  if (Array.isArray(leadData.selectedProjects) && leadData.selectedProjects.length) {
    projectsText = leadData.selectedProjects.map(p => {
      const appreciation = p.appreciation !== undefined ? `${p.appreciation}% p.a.` : 'N/A'
      const roi = p.roi !== undefined ? `${p.roi}%` : 'N/A'
      return `- ${p.name} (${p.location}) — Price: ${p.price} AED — ROI: ${roi} — Appreciation: ${appreciation}`
    }).join('\n')
  } else {
    projectsText = 'No properties selected.'
  }

  const suggestion = (Array.isArray(leadData.selectedProjects) && leadData.selectedProjects.length)
    ? (() => {
      const sorted = [...leadData.selectedProjects].sort((a,b) => (b.roi || 0) - (a.roi || 0))
      const top = sorted[0]
      return `Suggestion: Based on ROI, consider ${top.name} in ${top.location} (ROI: ${top.roi}%).` 
    })()
    : 'Suggestion: Explore properties matching your budget and preferred locations for best fit.'

  return `Hi ${name},\n\nThanks for using Dubai Properties. Here are the details of your search:\n\nBudget: ${budget}\nPreferences: ${prefs}\n\nSelected Properties:\n${projectsText}\n\n${suggestion}\n\nDiscussion Summary: ${shortSummary}\n\nIf you have questions or want to schedule viewings, reply to this email or expect a WhatsApp call shortly.\n\nBest regards,\nDubai Properties Team`
}

// Send WhatsApp to client (if phone available)
const sendWhatsAppToClient = async (leadData) => {
  try {
    const phone = leadData.customerInfo.phone
    if (!phone) return { success: false, error: 'No client phone' }
    const message = buildClientWhatsAppMessage(leadData)
    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone, message, isClient: true })
    })
    if (!response.ok) throw new Error('Failed to send WhatsApp to client')
    return await response.json()
  } catch (error) {
    console.error('WhatsApp to client error:', error)
    return { success: false, error: error.message }
  }
}

// Send email to client (if email available)
const sendEmailToClient = async (leadData) => {
  try {
    const email = leadData.customerInfo.email
    if (!email) return { success: false, error: 'No client email' }
    const body = buildClientEmailBody(leadData)
    const payload = {
      to: email,
      subject: `Thanks for your interest — We will contact you shortly`,
      body,
      leadId: leadData.id || null,
      timestamp: new Date().toISOString()
    }
    const response = await fetch('/api/send-email-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) throw new Error('Failed to send email to client')
    return await response.json()
  } catch (error) {
    console.error('Email to client error:', error)
    return { success: false, error: error.message }
  }
}

// Send both notifications
export const sendLeadNotifications = async (leadData) => {
  try {
    // send owner notifications and client notifications in parallel
    const requests = [
      // owner
      sendWhatsAppNotification(leadData),
      sendEmailNotification(leadData),
      // client (if contact available)
      sendWhatsAppToClient(leadData),
      sendEmailToClient(leadData)
    ]

    const [ownerWhatsApp, ownerEmail, clientWhatsApp, clientEmail] = await Promise.all(requests)

    // analytics: record notification result
    try {
      analytics.recordEvent('notification_sent', {
        leadId: leadData.id || null,
        owner: { whatsapp: !!ownerWhatsApp, email: !!ownerEmail },
        client: { whatsapp: !!clientWhatsApp, email: !!clientEmail }
      })
    } catch (e) {}

    return {
      success: true,
      owner: { whatsapp: ownerWhatsApp, email: ownerEmail },
      client: { whatsapp: clientWhatsApp, email: clientEmail },
      isDuplicate: leadData.isDuplicate
    }
  } catch (error) {
    console.error('Error sending notifications:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get leads by temperature
export const getLeadsByTemperature = (temperature) => {
  const leads = getAllLeads()
  return leads.filter(lead => lead.temperature === temperature)
}

// Get hot leads
export const getHotLeads = () => getLeadsByTemperature(LEAD_TEMPERATURE.HOT)

// Get warm leads
export const getWarmLeads = () => getLeadsByTemperature(LEAD_TEMPERATURE.WARM)

// Get cold leads
export const getColdLeads = () => getLeadsByTemperature(LEAD_TEMPERATURE.COLD)

// Get duplicate leads
export const getDuplicateLeads = () => {
  const leads = getAllLeads()
  return leads.filter(lead => lead.isDuplicate)
}

// Share lead with external partner CRM / webhook
export const shareLeadWithPartner = async (leadId, { partnerId, partnerName, callbackUrl, note = '', consent = { shareContact: true, shareBudget: true, shareRequirements: true } }) => {
  try {
    const leads = getAllLeads()
    const lead = leads.find(l => l.id === leadId)
    if (!lead) throw new Error('Lead not found')

    lead.sharedWith = lead.sharedWith || []
    const shareEntry = {
      partnerId,
      partnerName,
      callbackUrl,
      note,
      consent,
      sharedAt: new Date().toISOString(),
      status: 'sent'
    }
    lead.sharedWith.push(shareEntry)
    lead.lastUpdated = new Date().toISOString()
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))

    // send to backend to forward to partner
    try {
      const resp = await fetch('/api/share-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId, partnerName, callbackUrl, lead, consent })
      })
      const data = await resp.json()
      try { analytics.recordEvent('lead_shared', { leadId, partnerId, ok: resp.ok }) } catch(e){}
      return data
    } catch (e) {
      try { analytics.recordEvent('lead_share_failed', { leadId, partnerId, error: e.message }) } catch(e){}
      return { ok: false, error: e.message }
    }
  } catch (e) {
    console.error('shareLeadWithPartner error', e)
    throw e
  }
}

// Record partner commission and final outcome (can be called from partner webhook handler or frontend)
export const recordPartnerCommission = async (leadId, partnerId, { agreementValue = 0, commissionPercent = 0, status = 'closed', notes = '' }) => {
  try {
    const leads = getAllLeads()
    const lead = leads.find(l => l.id === leadId)
    if (!lead) throw new Error('Lead not found')

    lead.sharedWith = lead.sharedWith || []
    const entry = lead.sharedWith.find(s => s.partnerId === partnerId) || null
    if (entry) {
      entry.status = status
      entry.agreementValue = agreementValue
      entry.commissionPercent = commissionPercent
      entry.notes = notes
      entry.confirmedAt = new Date().toISOString()
    } else {
      // create a new shared entry if not present
      lead.sharedWith.push({ partnerId, partnerName: partnerId, status, agreementValue, commissionPercent, notes, confirmedAt: new Date().toISOString() })
    }

    lead.lastUpdated = new Date().toISOString()
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))

    // notify backend to append to commission sheet for reconciliation
    try {
      const resp = await fetch('/api/partner-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, partnerId, status, agreementValue, commissionPercent, notes })
      })
      const data = await resp.json()
      try { analytics.recordEvent('partner_commission_recorded', { leadId, partnerId, agreementValue, commissionPercent }) } catch(e){}
      return data
    } catch (e) {
      try { analytics.recordEvent('partner_commission_failed', { leadId, partnerId, error: e.message }) } catch(e){}
      return { ok: false, error: e.message }
    }
  } catch (e) {
    console.error('recordPartnerCommission error', e)
    throw e
  }
}

  // Set sharing preferences for a partner on a lead
  export const setSharePreferences = (leadId, partnerId, prefs = { shareContact: true, shareBudget: true, shareRequirements: true }) => {
    try {
      const leads = getAllLeads()
      const lead = leads.find(l => l.id === leadId)
      if (!lead) throw new Error('Lead not found')
      lead.sharedWith = lead.sharedWith || []
      const entry = lead.sharedWith.find(s => s.partnerId === partnerId)
      if (!entry) throw new Error('Partner share entry not found')
      entry.consent = { ...entry.consent, ...prefs }
      entry.updatedAt = new Date().toISOString()
      lead.lastUpdated = new Date().toISOString()
      localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
      try { analytics.recordEvent('share_prefs_updated', { leadId, partnerId, prefs }) } catch(e){}
      return entry
    } catch (e) {
      console.error('setSharePreferences error', e)
      throw e
    }
  }

  // Share appointment details with partnered organizations according to consent
  export const shareAppointmentWithPartner = async (leadId, appointmentId) => {
    try {
      const leads = getAllLeads()
      const lead = leads.find(l => l.id === leadId)
      if (!lead) throw new Error('Lead not found')
      const appt = (lead.appointments || []).find(a => a.id === appointmentId)
      if (!appt) throw new Error('Appointment not found')

      const results = []
      for (const partner of (lead.sharedWith || [])) {
        // only share if partner.status is 'accepted' or 'sent' (you can refine this rule)
        if (partner.status && ['sent','accepted'].includes(partner.status)) {
          const prefs = partner.consent || { shareContact: true, shareBudget: true, shareRequirements: true }
          const leadPayload = {}
          if (prefs.shareContact) leadPayload.customerInfo = lead.customerInfo
          if (prefs.shareBudget) leadPayload.budget = lead.customerInfo?.budget
          if (prefs.shareRequirements) leadPayload.preferences = lead.customerInfo?.preferences

          const sharePayload = {
            partnerId: partner.partnerId,
            leadId: lead.id,
            appointment: appt,
            lead: leadPayload
          }

          try {
            const resp = await fetch('/api/share-appointment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ partner, payload: sharePayload })
            })
            const data = await resp.json()
            results.push({ partnerId: partner.partnerId, ok: resp.ok, data })
            try { analytics.recordEvent('appointment_shared_with_partner', { leadId, appointmentId, partnerId: partner.partnerId, ok: resp.ok }) } catch(e){}
          } catch (e) {
            results.push({ partnerId: partner.partnerId, ok: false, error: e.message })
            try { analytics.recordEvent('appointment_share_failed', { leadId, appointmentId, partnerId: partner.partnerId, error: e.message }) } catch(e){}
          }
        }
      }

      return results
    } catch (e) {
      console.error('shareAppointmentWithPartner error', e)
      throw e
    }
  }


// Simple matcher: budget and area
const parseBudgetRange = (budgetStr) => {
  if (!budgetStr) return null
  const nums = budgetStr.replace(/,/g,'').match(/\d+/g)
  if (!nums) return null
  if (nums.length === 1) return { min: 0, max: Number(nums[0]) }
  return { min: Number(nums[0]), max: Number(nums[nums.length-1]) }
}

const matchesLead = (lead, project) => {
  try {
    // budget check
    const range = parseBudgetRange(lead.customerInfo.budget)
    if (range) {
      if (project.price < range.min || project.price > range.max) return false
    }
    // area / preferences basic check
    const prefs = (lead.customerInfo.preferences || '').toLowerCase()
    if (prefs) {
      const loc = (project.location || '').toLowerCase()
      if (!loc.includes(prefs) && !project.name.toLowerCase().includes(prefs)) {
        // allow if any keyword from prefs exists in location or name
        const keys = prefs.split(/[,;]+|\s+/).filter(Boolean)
        const any = keys.some(k => loc.includes(k) || project.name.toLowerCase().includes(k))
        if (!any) return false
      }
    }
    return true
  } catch (e) {
    return true
  }
}

// Handle incoming project updates (new project list or updates)
export const handleProjectUpdates = async (projects = []) => {
  try {
    const leads = getAllLeads()
    // For each project, check relevant leads and notify according to status rules
    for (const project of projects) {
      for (const lead of leads) {
        // skip closed leads for project notifications
        if (lead.status === 'closed') continue

        const alreadySelected = (lead.selectedProjects || []).some(p => p.id === project.id)

        // active: notify for updates or new matches
        if (lead.status === 'active') {
          if (alreadySelected || matchesLead(lead, project)) {
            // send brief client notification about new/updated project
            const payloadLead = { ...lead, selectedProjects: [project] }
            await sendWhatsAppToClient(payloadLead)
            await sendEmailToClient(payloadLead)
          }
        }

        // dropped: do NOT notify about existing selected projects updates, but DO notify about new projects that match
        if (lead.status === 'dropped') {
          if (!alreadySelected && matchesLead(lead, project)) {
            const payloadLead = { ...lead, selectedProjects: [project] }
            await sendWhatsAppToClient(payloadLead)
            await sendEmailToClient(payloadLead)
          }
        }

        // booked: behave like closed for project updates (no notifications)
        if (lead.status === 'booked') continue
      }
    }
    return { success: true }
  } catch (error) {
    console.error('handleProjectUpdates error:', error)
    return { success: false, error: error.message }
  }
}

// Get lead statistics
export const getLeadStatistics = () => {
  const leads = getAllLeads()
  return {
    total: leads.length,
    hot: leads.filter(l => l.temperature === LEAD_TEMPERATURE.HOT).length,
    warm: leads.filter(l => l.temperature === LEAD_TEMPERATURE.WARM).length,
    cold: leads.filter(l => l.temperature === LEAD_TEMPERATURE.COLD).length,
    duplicates: leads.filter(l => l.isDuplicate).length
  }
}

// Export leads to CSV (for Excel/Sheets)
export const exportLeadsToCSV = () => {
  const leads = getAllLeads()
  
  const headers = [
    'ID',
    'Name',
    'Email',
    'Phone',
    'Budget',
    'Temperature',
    'Is Duplicate',
      'Discussion Summary',
    'Properties Interested',
    'Created Date',
    'Last Updated'
  ]
  
  const rows = leads.map(lead => [
    lead.id,
    lead.customerInfo.name,
    lead.customerInfo.email,
    lead.customerInfo.phone,
    lead.customerInfo.budget,
    lead.temperature.toUpperCase(),
    lead.isDuplicate ? 'YES' : 'NO',
      lead.discussionSummary || '',
    lead.selectedProjects.map(p => p.name).join('; '),
    new Date(lead.createdAt).toLocaleDateString(),
    new Date(lead.lastUpdated).toLocaleDateString()
  ])
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  return csv
}

// Download leads as CSV file
export const downloadLeadsCSV = () => {
  const csv = exportLeadsToCSV()
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `dubai-properties-leads-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
