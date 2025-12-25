// Calendar integration helper (frontend-side) - calls backend to create events and schedule reminders
import analytics from './analyticsService'

// Create calendar event via backend (which should use Google Calendar API with server-side credentials)
export const createCalendarEvent = async ({ summary, description, startISO, endISO, attendees = [], timezone = 'UTC' }) => {
  try {
    const res = await fetch('/api/create-calendar-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary, description, startISO, endISO, attendees, timezone })
    })
    const data = await res.json()
    if (res.ok) {
      try { analytics.recordEvent('calendar_event_created', { eventId: data.eventId || null, summary }) } catch(e){}
    }
    return data
  } catch (e) {
    console.error('createCalendarEvent error', e)
    return { ok: false, error: e.message }
  }
}

// Backend should accept scheduling reminders and sending calendar invites; this helper calls it
export const scheduleReminders = async ({ eventId, reminders = [] }) => {
  try {
    const res = await fetch('/api/schedule-event-reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, reminders })
    })
    const data = await res.json()
    if (res.ok) try { analytics.recordEvent('calendar_reminders_scheduled', { eventId, remindersCount: reminders.length }) } catch(e){}
    return data
  } catch (e) {
    console.error('scheduleReminders error', e)
    return { ok: false, error: e.message }
  }
}

// Request backend to send immediate reminders (fallback if calendar provider doesn't send)
export const triggerReminderNow = async ({ leadId, type = 'visit', message }) => {
  try {
    const res = await fetch('/api/trigger-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, type, message })
    })
    const data = await res.json()
    if (res.ok) try { analytics.recordEvent('reminder_triggered', { leadId, type }) } catch(e){}
    return data
  } catch (e) {
    console.error('triggerReminderNow error', e)
    return { ok: false, error: e.message }
  }
}

export default { createCalendarEvent, scheduleReminders, triggerReminderNow }
