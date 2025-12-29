// Simple analytics event collector stored in localStorage
export const ANALYTICS_STORAGE_KEY = 'dubai_properties_analytics'

const nowISO = () => new Date().toISOString()

export const recordEvent = (type, payload = {}) => {
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY)
    const events = raw ? JSON.parse(raw) : []
    const ev = { id: Date.now(), type, payload, timestamp: nowISO() }
    events.push(ev)
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(events))
    return ev
  } catch (e) {
    console.error('Analytics record error', e)
    return null
  }
}

export const getAllEvents = () => {
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Analytics read error', e)
    return []
  }
}

export const clearEvents = () => {
  localStorage.removeItem(ANALYTICS_STORAGE_KEY)
}

export const getAggregates = (leads = []) => {
  const events = getAllEvents();
  const leadCreated = events.filter(e => e.type === 'lead_created');
  // leads per day (last 30 days)
  const perDay = {};
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0,10);
    perDay[key] = 0;
  }
  leadCreated.forEach(e => {
    const k = e.timestamp.slice(0,10);
    if (perDay[k] !== undefined) perDay[k]++;
  });

  // leads by temperature (from passed leads array)
  const byTemp = { hot: 0, warm: 0, cold: 0 };
  (leads || []).forEach(l => { if (l.temperature) byTemp[l.temperature] = (byTemp[l.temperature] || 0) + 1 });

  // top projects by selection count
  const projectCount = {};
  (leads || []).forEach(l => (l.selectedProjects || []).forEach(p => { projectCount[p.name] = (projectCount[p.name] || 0) + 1 }));
  const topProjects = Object.keys(projectCount).map(name => ({ name, count: projectCount[name] })).sort((a,b) => b.count - a.count).slice(0,10);

  // notifications sent
  const notifications = events.filter(e => e.type === 'notification_sent').length;

  // Advanced analytics
  // Conversion rate: leads with status 'closed-won' / total leads
  const totalLeads = leads.length;
  const closedWon = leads.filter(l => l.status === 'closed-won').length;
  const conversionRate = totalLeads > 0 ? (closedWon / totalLeads) * 100 : 0;

  // Funnel: open, in-progress, closed-won, closed-lost
  const funnel = { open: 0, inProgress: 0, closedWon: 0, closedLost: 0 };
  leads.forEach(l => {
    if (l.status === 'open') funnel.open++;
    else if (l.status === 'in-progress') funnel.inProgress++;
    else if (l.status === 'closed-won') funnel.closedWon++;
    else if (l.status === 'closed-lost') funnel.closedLost++;
  });

  // Engagement: unique users/agents (by userId/agentId if present)
  const userSet = new Set();
  const agentSet = new Set();
  leads.forEach(l => {
    if (l.userId) userSet.add(l.userId);
    if (l.agentId) agentSet.add(l.agentId);
  });

  return {
    totalEvents: events.length,
    totalLeadsCreated: leadCreated.length,
    leadsPerDay: perDay,
    leadsByTemperature: byTemp,
    topProjects,
    notificationsSent: notifications,
    conversionRate: Number(conversionRate.toFixed(2)),
    funnel,
    uniqueUsers: userSet.size,
    uniqueAgents: agentSet.size
  };
};

export const exportEventsToCSV = () => {
  const events = getAllEvents()
  const headers = ['id','type','timestamp','payload']
  const rows = events.map(e => [e.id, e.type, e.timestamp, JSON.stringify(e.payload)])
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(','))].join('\n')
  return csv
}

export const pushEventsToSheets = async (sheetLink) => {
  // Sends events to backend which can write to Google Sheets (backend must implement /api/export-analytics-to-sheets)
  try {
    const events = getAllEvents()
    const res = await fetch('/api/export-analytics-to-sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetLink, events })
    })
    return await res.json()
  } catch (e) {
    console.error('Push events to sheets failed', e)
    return { ok: false, error: e.message }
  }
}

export default {
  recordEvent,
  getAllEvents,
  clearEvents,
  getAggregates,
  exportEventsToCSV,
  pushEventsToSheets
}
