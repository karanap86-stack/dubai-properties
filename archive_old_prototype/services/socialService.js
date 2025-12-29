import { getCountryManagerAgent } from './agentService';

// Utility: Check if agent is country manager for a country
export function isCountryManager(agent, country) {
  const manager = getCountryManagerAgent(country);
  return agent && manager && agent.id === manager.id;
}
// Social integration service
// Stores social credentials locally (for demo) and posts via backend endpoints

const SOCIAL_STORAGE_KEY = 'dubai_properties_social_configs'

export const getSocialConfigs = () => {
  try {
    const raw = localStorage.getItem(SOCIAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : { linkedin: {}, instagram: {}, autoPost: false }
  } catch (e) {
    console.error('Error reading social configs', e)
    return { linkedin: {}, instagram: {}, autoPost: false }
  }
}

export const saveSocialConfigs = (configs) => {
  try {
    localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(configs))
    return true
  } catch (e) {
    console.error('Error saving social configs', e)
    return false
  }
}

// Build a simple post payload from lead or content
export const buildPostPayload = ({ title, body, imageUrl }) => {
  return { title, body, imageUrl }
}

// Post to LinkedIn via backend endpoint

// Only allow country manager to post
export const postToLinkedIn = async (payload, configs, agent, country) => {
  if (!isCountryManager(agent, country)) {
    console.warn(`[DENIED] Only country manager can post to LinkedIn for ${country}. Agent:`, agent ? agent.name : 'none');
    return { success: false, error: 'Only country manager can post to LinkedIn for this country.' };
  }
  try {
    // payload: { title, body, imageUrl }
    const response = await fetch('/api/post-linkedin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload, configs })
    })
    if (!response.ok) throw new Error('LinkedIn post failed')
    return await response.json()
  } catch (error) {
    console.error('postToLinkedIn error:', error)
    return { success: false, error: error.message }
  }
}

// Post to Instagram via backend endpoint

// Only allow country manager to post
export const postToInstagram = async (payload, configs, agent, country) => {
  if (!isCountryManager(agent, country)) {
    console.warn(`[DENIED] Only country manager can post to Instagram for ${country}. Agent:`, agent ? agent.name : 'none');
    return { success: false, error: 'Only country manager can post to Instagram for this country.' };
  }
  try {
    const response = await fetch('/api/post-instagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload, configs })
    })
    if (!response.ok) throw new Error('Instagram post failed')
    return await response.json()
  } catch (error) {
    console.error('postToInstagram error:', error)
    return { success: false, error: error.message }
  }
}

export default {
  getSocialConfigs,
  saveSocialConfigs,
  buildPostPayload,
  postToLinkedIn,
  postToInstagram
}
