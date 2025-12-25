import fs from 'fs'
import path from 'path'
let indiaRegions = require('../data/indiaRegions.json')

// Auto-refresh India regions data weekly
setInterval(() => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/indiaRegions.json'), 'utf-8')
    indiaRegions = JSON.parse(data)
    console.log('[Auto-Refresh] India regions data reloaded')
  } catch (e) { console.error('Failed to refresh indiaRegions.json', e) }
}, 1000 * 60 * 60 * 24 * 7)
// Utility: Get all states and cities in India (dynamic, scalable)
export function getAllIndianStates() {
  return indiaRegions.states.map(s => s.name)
}
export function getCitiesByState(state) {
  const s = indiaRegions.states.find(s => s.name === state)
  return s ? s.cities : []
}
import * as coreAutomation from './coreAutomationService'
// Event-driven automation for agent creation/update
export function saveAgent(agent) {
  // Save or update agent logic here (in-memory for now)
  // ...existing save logic or push to agents array...
  // Trigger automations for this agent
  triggerAgentAutomations(agent)
  return agent
}

// Helper: trigger all automations for an agent immediately
function triggerAgentAutomations(agent) {
  const market = agent.region || agent.country || 'global'
  // Smart agent assignment (stub)
  // coreAutomation.assignSmartAgent(null, [agent], market)
  // Compliance (stub)
  coreAutomation.generateComplianceReport(agent.region, market)
  // Feedback (stub)
  coreAutomation.collectAndAnalyzeFeedback(agent, market)
  // Log for now
  console.log(`[Automation][Immediate] Agent: ${agent.name} | Market: ${market}`)
}
// Utility: Detect client location and suggest language options
// (In production, use a geo-IP API or browser locale)
export async function detectClientLocation() {
  // Try browser locale first
  const locale = navigator.language || navigator.userLanguage
  // Fallback: Use a geo-IP API (mocked here)
  let country = 'Unknown'
  try {
    const resp = await fetch('https://ipapi.co/json/')
    const data = await resp.json()
    country = data.country_name || 'Unknown'
  } catch (e) {
    // fallback to locale-based guess
    if (locale.startsWith('en')) country = 'United Kingdom'
    else if (locale.startsWith('hi')) country = 'India'
    else if (locale.startsWith('ar')) country = 'Saudi Arabia'
    // ...add more as needed
  }
  return { country, locale }
}


// Given a country, state, and city, return language options (India: region-specific)
export function getLanguageOptionsForLocation({ country, state, city }) {
  // India: state/city-based language mapping
  if (country === 'India') {
    const stateLangs = {
      'Maharashtra': ['Marathi', 'Hindi', 'English'],
      'West Bengal': ['Bengali', 'Hindi', 'English'],
      'Tamil Nadu': ['Tamil', 'English'],
      'Karnataka': ['Kannada', 'English', 'Hindi'],
      'Gujarat': ['Gujarati', 'Hindi', 'English'],
      'Punjab': ['Punjabi', 'Hindi', 'English'],
      'Kerala': ['Malayalam', 'English', 'Hindi'],
      'Uttar Pradesh': ['Hindi', 'Urdu', 'English'],
      'Telangana': ['Telugu', 'Urdu', 'English'],
      'Delhi': ['Hindi', 'English', 'Punjabi'],
      // ...add more states/cities as needed
    }
    if (state && stateLangs[state]) return stateLangs[state]
    return ['Hindi', 'English']
  }
  // Fallback to country-level
  const countryLangs = {
    'India': ['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Odia', 'Punjabi', 'Malayalam', 'Assamese', 'Maithili', 'Santali', 'Kashmiri', 'Nepali', 'Konkani', 'Sindhi', 'Dogri', 'Manipuri', 'Bodo', 'Santhali'],
    'United Kingdom': ['English'],
    'Russia': ['Russian'],
    'China': ['Mandarin'],
    'Pakistan': ['Urdu', 'Punjabi', 'Sindhi'],
    'Saudi Arabia': ['Arabic'],
    'Egypt': ['Arabic'],
    'Iran': ['Persian'],
    'United States': ['English', 'Spanish'],
    'France': ['French'],
    'Germany': ['German'],
    'Canada': ['English', 'French'],
    'Italy': ['Italian'],
    'Nigeria': ['English', 'Yoruba', 'Igbo', 'Hausa'],
    'Lebanon': ['Arabic', 'French'],
    'Turkey': ['Turkish'],
    'Jordan': ['Arabic'],
    'Bangladesh': ['Bengali'],
    'Ukraine': ['Ukrainian', 'Russian'],
    'South Africa': ['English', 'Afrikaans', 'Zulu', 'Xhosa'],
    // ...add all 85 countries as needed
  }
  return countryLangs[country] || ['English']
}


// Agent pool example (in production, fetch from DB)
const agents = [
  { id: 1, name: 'Priya (Mumbai)', country: 'India', state: 'Maharashtra', city: 'Mumbai', role: 'local', languages: ['Marathi', 'Hindi', 'English'] },
  { id: 2, name: 'Amit (Delhi)', country: 'India', state: 'Delhi', city: 'Delhi', role: 'local', languages: ['Hindi', 'English', 'Punjabi'] },
  { id: 5, name: 'Ravi (Bangalore)', country: 'India', state: 'Karnataka', city: 'Bangalore', role: 'local', languages: ['Kannada', 'English', 'Hindi'] },
  { id: 6, name: 'Lakshmi (Chennai)', country: 'India', state: 'Tamil Nadu', city: 'Chennai', role: 'local', languages: ['Tamil', 'English'] },
  { id: 7, name: 'Sourav (Kolkata)', country: 'India', state: 'West Bengal', city: 'Kolkata', role: 'local', languages: ['Bengali', 'Hindi', 'English'] },
  { id: 8, name: 'Harpreet (Chandigarh)', country: 'India', state: 'Punjab', city: 'Chandigarh', role: 'local', languages: ['Punjabi', 'Hindi', 'English'] },
  { id: 9, name: 'Meera (Ahmedabad)', country: 'India', state: 'Gujarat', city: 'Ahmedabad', role: 'local', languages: ['Gujarati', 'Hindi', 'English'] },
  { id: 10, name: 'Anjali (Lucknow)', country: 'India', state: 'Uttar Pradesh', city: 'Lucknow', role: 'local', languages: ['Hindi', 'Urdu', 'English'] },
  { id: 11, name: 'Ayesha (Hyderabad)', country: 'India', state: 'Telangana', city: 'Hyderabad', role: 'local', languages: ['Telugu', 'Urdu', 'English'] },
  { id: 12, name: 'Nisha (Thiruvananthapuram)', country: 'India', state: 'Kerala', city: 'Thiruvananthapuram', role: 'local', languages: ['Malayalam', 'English', 'Hindi'] },
  { id: 3, name: 'Sara (Dubai)', country: 'UAE', role: 'international', languages: ['Arabic', 'English'] },
  { id: 4, name: 'Olga (Russia Desk)', country: 'UAE', role: 'international', assignedCountries: ['Russia'], languages: ['Russian', 'English'] },
]

// Assign agent by location and market type
export function assignAgentByLocation({ country, state, city, isNRI }) {
  // India: local agents for domestic/NRI clients by state
  if (country === 'India') {
    // NRI: assign local agent for their home state
    const agent = agents.find(a => a.country === 'India' && a.state === state && a.role === 'local')
    return agent || { name: 'Default India Agent', country: 'India', state, city, role: 'local' }
  }
  // International: assign agent for global investor markets (e.g., UAE)
  const agent = agents.find(a => a.country === country && a.role === 'international' && (!a.assignedCountries || a.assignedCountries.includes(country)))
  return agent || { name: 'Default Global Agent', country, role: 'international' }
}
// Policy: Agents must never share internal logic or confidential information
function isConfidentialQuery(message) {
  // Simple check for questions about logic, code, or confidential info
  return /how does (your|the) (system|logic|ai|bot|recommendation|algorithm|code|backend|engine|work|function|decide|choose|pick|filter|assign|analyze|calculate)|show.*code|share.*logic|can you tell.*logic|can you tell.*how|can you explain.*logic|can you explain.*how|internal|confidential|secret|proprietary|reveal|disclose|details|implementation|architecture|source code|api key|password|admin|database|security/i.test(message)
}

export function agentResponsePolicy(message) {
  if (isConfidentialQuery(message)) {
    return {
      block: true,
      response: "I'm sorry, but I cannot share internal logic or confidential information. My purpose is to assist you with your property needs and answer general questions."
    }
  }
  return { block: false }
}
// agentService.js
// Multi-agent management and auto-scaling logic


const INDIAN_FEMALE_NAMES = [
  'Aarohi', 'Ananya', 'Bhavya', 'Charvi', 'Diya', 'Esha', 'Ira', 'Jiya', 'Kavya', 'Lavanya',
  'Meera', 'Nitya', 'Ojasvi', 'Prisha', 'Riya', 'Saanvi', 'Tanvi', 'Urvi', 'Vanya', 'Yashvi'
]

const PERSONALITY_TRAITS = [
  { style: 'Empathetic', description: 'Always listens and understands client emotions.' },
  { style: 'Accountable', description: 'Takes responsibility and follows up diligently.' },
  { style: 'Friendly', description: 'Warm, approachable, and positive in every interaction.' },
  { style: 'Client-Centric', description: 'Focuses on client needs and satisfaction.' },
  { style: 'Proactive', description: 'Anticipates client needs and offers solutions.' },
  { style: 'Detail-Oriented', description: 'Pays attention to every detail in client requests.' },
  { style: 'Resourceful', description: 'Finds creative solutions for client challenges.' },
  { style: 'Calm', description: 'Handles stressful situations with composure.' },
  { style: 'Optimistic', description: 'Encourages and motivates clients.' },
  { style: 'Professional', description: 'Maintains high standards and ethics.' }
]

// Calibration: Agents share feedback and learn best traits (chat and call)
export function calibrateAgents(feedbacks = [], callFeedbacks = []) {
  // Analyze chat/text feedbacks
  const traitScores = {}
  feedbacks.forEach(fb => {
    if (fb.agentId && fb.trait) {
      traitScores[fb.trait] = (traitScores[fb.trait] || 0) + 1
    }
  })
  // Analyze call feedbacks (empathy, clarity, satisfaction, etc.)
  callFeedbacks.forEach(fb => {
    if (fb.agentId && fb.trait) {
      traitScores[fb.trait] = (traitScores[fb.trait] || 0) + 2 // Calls weighted higher for calibration
    }
  })
  // Find top traits
  const topTraits = Object.entries(traitScores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t)
  // Agents adopt top traits for continuous improvement
  agents.forEach(agent => {
    if (topTraits.length > 0) {
      agent.personality = {
        style: topTraits.join(' & '),
        description: 'Calibrated: ' + topTraits.join(', ')
      }
    }
  })
}
