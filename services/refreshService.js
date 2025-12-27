
import { getCountryManagerAgent } from './agentService';
import { aggregateProviders } from './serviceProviderService';
import getDb from '../config/db';

// Utility: Check if agent is country manager for a country
function isCountryManager(agent, country) {
  const manager = getCountryManagerAgent(country);
  return agent && manager && agent.id === manager.id;
}

// Persistent refresh config in MongoDB
const CONFIG_COLLECTION = 'refresh_configs';

export async function getRefreshConfig(country) {
  const db = await getDb();
  const cfg = await db.collection(CONFIG_COLLECTION).findOne({ country });
  return cfg || { country, autoRefreshWeekly: true, lastRefreshed: null };
}

export async function saveRefreshConfig(cfg) {
  const db = await getDb();
  await db.collection(CONFIG_COLLECTION).updateOne(
    { country: cfg.country },
    { $set: { ...cfg, updatedAt: new Date() } },
    { upsert: true }
  );
  return true;
}

export async function shouldRefreshNow(country) {
  const cfg = await getRefreshConfig(country);
  if (!cfg.autoRefreshWeekly) return false;
  if (!cfg.lastRefreshed) return true;
  try {
    const last = new Date(cfg.lastRefreshed);
    const now = new Date();
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    return diffDays >= 7;
  } catch (e) {
    return true;
  }
}

// Perform backend-driven refresh: aggregate providers, projects, analytics
export async function performRefresh(agent, country) {
  if (!isCountryManager(agent, country)) {
    console.warn(`[DENIED] Only country manager can refresh content for ${country}. Agent:`, agent ? agent.name : 'none');
    return { success: false, error: 'Only country manager can refresh content for this country.' };
  }
  try {
    // Aggregate service providers by type and region
    const providerAgg = await aggregateProviders('type');
    // TODO: Add project and analytics aggregation as needed

    // Optionally, notify leads of new/updated providers/projects
    // ...existing code for lead notification...

    // Update refresh config
    const cfg = await getRefreshConfig(country);
    cfg.lastRefreshed = new Date().toISOString();
    await saveRefreshConfig(cfg);

    return { success: true, providerAgg };
  } catch (error) {
    console.error('performRefresh error:', error);
    return { success: false, error: error.message };
  }
}

export default { getRefreshConfig, saveRefreshConfig, shouldRefreshNow, performRefresh };
