import fs from 'fs'
import path from 'path'
let indiaDevelopers = require('../data/indiaDevelopers.json')

// --- Automated Data Validation ---
function validateDeveloperData(developers) {
  const errors = []
  developers.forEach((dev, i) => {
    if (!dev.id || !dev.name) errors.push(`Developer at index ${i} missing id or name`)
    if (!Array.isArray(dev.cities) || dev.cities.length === 0) errors.push(`Developer ${dev.name} missing cities`)
    if (!Array.isArray(dev.states) || dev.states.length === 0) errors.push(`Developer ${dev.name} missing states`)
    if (!Array.isArray(dev.projects) || dev.projects.length === 0) errors.push(`Developer ${dev.name} missing projects`)
    dev.projects?.forEach((proj, j) => {
      if (!proj.id || !proj.name) errors.push(`Project at dev ${dev.name} index ${j} missing id or name`)
      if (!proj.region) errors.push(`Project ${proj.name} at dev ${dev.name} missing region`)
    })
  })
  return errors
}

function reportValidationErrors(errors) {
  if (errors.length > 0) {
    console.error('[Data Validation] Developer/project data errors:', errors)
    if (typeof window !== 'undefined') {
      window.__DEV_DATA_ERRORS__ = errors
    }
  } else {
    if (typeof window !== 'undefined') {
      window.__DEV_DATA_ERRORS__ = []
    }
  }
}

// Validate on load
const devValidationErrors = validateDeveloperData(indiaDevelopers)
reportValidationErrors(devValidationErrors)

// Auto-refresh India developers data weekly
setInterval(() => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../data/indiaDevelopers.json'), 'utf-8')
    indiaDevelopers = JSON.parse(data)
    console.log('[Auto-Refresh] India developers data reloaded')
    // Validate after refresh
    const errors = validateDeveloperData(indiaDevelopers)
    reportValidationErrors(errors)
  } catch (e) { console.error('Failed to refresh indiaDevelopers.json', e) }
}, 1000 * 60 * 60 * 24 * 7)
// Utility: Get all developers by state/city (dynamic, scalable)
export function getDevelopersByState(state) {
  return indiaDevelopers.filter(d => d.states.includes(state))
}
export function getDevelopersByCity(city) {
  return indiaDevelopers.filter(d => d.cities.includes(city))
}
import * as coreAutomation from './coreAutomationService'
// developerService.js
// Manage developers and their projects, enable auto-refreshing content/marketing for each

const developers = [] // [{ id, name, projects: [{ id, name, region, ... }], ... }]

export function addDeveloper(developer) {
  developer.id = developer.id || Date.now()
  developer.projects = developer.projects || []
  developers.push(developer)
  // Trigger automation for all projects (if any) on add
  const market = developer.region || 'global'
  developer.projects.forEach(project => {
    triggerProjectAutomations(project, market)
  })
  return developer
}

export function addProjectToDeveloper(developerId, project) {
  const dev = developers.find(d => d.id === developerId)
  if (!dev) throw new Error('Developer not found')
  project.id = project.id || Date.now()
  dev.projects.push(project)
  // Trigger automation for this project on add
  const market = project.region || dev.region || 'global'
  triggerProjectAutomations(project, market)
  return project
}
// Helper: trigger all automations for a project immediately
function triggerProjectAutomations(project, market) {
  // AI-driven content
  const content = coreAutomation.generateAIContent(project, market)
  // Predictive analytics
  const trend = coreAutomation.predictMarketTrends(project.region, market)
  // Lead nurturing (stub)
  // coreAutomation.nurtureLead(lead, market)
  // Smart agent assignment (stub)
  // coreAutomation.assignSmartAgent(lead, agents, market)
  // Personalized dashboard (stub)
  // coreAutomation.personalizeClientDashboard(client, market)
  // AR/VR/3D tours (stub)
  const arvr = coreAutomation.generateARVRLink(project, market)
  // Voice assistant (stub)
  // coreAutomation.voiceAssistantIntegration(client, market)
  // Compliance (stub)
  const compliance = coreAutomation.generateComplianceReport(project.region, market)
  // Partner automation (stub)
  // coreAutomation.automatePartnerSharing(lead, partners, market)
  // Feedback (stub)
  // coreAutomation.collectAndAnalyzeFeedback(project, market)
  // Log for now
  console.log(`[Automation][Immediate] Project: ${project.name} | Market: ${market} | Content: ${content} | Trend: ${trend.trend} | AR/VR: ${arvr} | Compliance: ${compliance.compliant}`)
}

export function getAllDevelopers() {
  return developers
}

export function getProjectsByDeveloper(developerId) {
  const dev = developers.find(d => d.id === developerId)
  return dev ? dev.projects : []
}


// Auto-refresh and automate all advanced features for all projects, every week, for all markets
const ONE_WEEK_MS = 1000 * 60 * 60 * 24 * 7
setInterval(() => {
  developers.forEach(dev => {
    dev.projects.forEach(project => {
      const market = project.region || dev.region || 'global'
      // AI-driven content
      const content = coreAutomation.generateAIContent(project, market)
      // Predictive analytics
      const trend = coreAutomation.predictMarketTrends(project.region, market)
      // Lead nurturing (stub)
      // coreAutomation.nurtureLead(lead, market)
      // Smart agent assignment (stub)
      // coreAutomation.assignSmartAgent(lead, agents, market)
      // Personalized dashboard (stub)
      // coreAutomation.personalizeClientDashboard(client, market)
      // AR/VR/3D tours (stub)
      const arvr = coreAutomation.generateARVRLink(project, market)
      // Voice assistant (stub)
      // coreAutomation.voiceAssistantIntegration(client, market)
      // Compliance (stub)
      const compliance = coreAutomation.generateComplianceReport(project.region, market)
      // Partner automation (stub)
      // coreAutomation.automatePartnerSharing(lead, partners, market)
      // Feedback (stub)
      // coreAutomation.collectAndAnalyzeFeedback(project, market)
      // Log for now
      console.log(`[Automation] Project: ${project.name} | Market: ${market} | Content: ${content} | Trend: ${trend.trend} | AR/VR: ${arvr} | Compliance: ${compliance.compliant}`)
    })
  })
}, ONE_WEEK_MS)

// TODO: Integrate with content/marketing automation services
