// Refresh service: handles periodic data + content refresh
// Stores last refresh timestamp and provides functions to trigger refreshes.

const REFRESH_KEY = 'dubai_properties_refresh_config'

export const getRefreshConfig = () => {
  try {
    const raw = localStorage.getItem(REFRESH_KEY)
    return raw ? JSON.parse(raw) : { autoRefreshWeekly: true, lastRefreshed: null }
  } catch (e) {
    console.error('Error reading refresh config', e)
    return { autoRefreshWeekly: true, lastRefreshed: null }
  }
}

export const saveRefreshConfig = (cfg) => {
  try {
    localStorage.setItem(REFRESH_KEY, JSON.stringify(cfg))
    return true
  } catch (e) {
    console.error('Error saving refresh config', e)
    return false
  }
}

export const shouldRefreshNow = () => {
  const cfg = getRefreshConfig()
  if (!cfg.autoRefreshWeekly) return false
  if (!cfg.lastRefreshed) return true
  try {
    const last = new Date(cfg.lastRefreshed)
    const now = new Date()
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24))
    return diffDays >= 7
  } catch (e) {
    return true
  }
}

export const performRefresh = async () => {
  try {
    // Call backend endpoints to refresh data and creative content
    // Backend should implement aggregation of project updates, pricing, and creative generation
    const responses = await Promise.all([
      fetch('/api/refresh-projects', { method: 'POST' }),
      fetch('/api/refresh-content', { method: 'POST' })
    ])

    const results = await Promise.all(responses.map(r => {
      try { return r.ok ? r.json() : { success: false, status: r.status } } catch (e) { return { success: false, error: e.message } }
    }))

    // If backend returned new/updated projects, notify leads
    try {
      const [{ newProjects } = {}, ] = results
      if (Array.isArray(newProjects) && newProjects.length) {
        const { handleProjectUpdates } = require('./leadService')
        await handleProjectUpdates(newProjects)
      }
    } catch (e) {
      console.error('Error dispatching project updates to leads:', e)
    }

    const cfg = getRefreshConfig()
    cfg.lastRefreshed = new Date().toISOString()
    saveRefreshConfig(cfg)

    return { success: true, results }
  } catch (error) {
    console.error('performRefresh error:', error)
    return { success: false, error: error.message }
  }
}

export default { getRefreshConfig, saveRefreshConfig, shouldRefreshNow, performRefresh }
