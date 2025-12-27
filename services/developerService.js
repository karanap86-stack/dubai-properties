import awsS3Service from './awsS3Service';
import { v4 as uuidv4 } from 'uuid';
import * as coreAutomation from './coreAutomationService';

// --- PROJECT ONBOARDING, DOCUMENT UPLOAD, AND REVIEW ---

/**
 * Developer uploads a project document (approval, RERA, etc.)
 * @param {string} developerId
 * @param {string} projectId
 * @param {Buffer|Uint8Array} fileBuffer
 * @param {string} filename
 * @param {string} contentType
 * @param {string} docType - e.g., 'approval', 'rera', 'agreement', etc.
 * @returns {Promise<{success:boolean, url?:string, error?:string}>}
 */
export async function uploadProjectDocument(developerId, projectId, fileBuffer, filename, contentType, docType) {
  try {
    const key = `projects/${projectId}/${docType || 'document'}-${Date.now()}-${filename}`;
    const uploadResult = await awsS3Service.uploadFile(key, fileBuffer, contentType);
    // Link document to project (store S3 URL and metadata)
    const dev = getDeveloperById(developerId);
    if (!dev) throw new Error('Developer not found');
    const project = dev.projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    project.documents = project.documents || [];
    project.documents.push({
      url: uploadResult.Location,
      key,
      filename,
      contentType,
      docType,
      uploadedAt: new Date().toISOString(),
      reviewed: false,
      aiReview: null,
      manualReview: null
    });
    // Save developer/project data (implement persistent save as needed)
    return { success: true, url: uploadResult.Location };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * AI/ML and manual review of project documents
 * @param {string} developerId
 * @param {string} projectId
 * @param {string} docKey
 * @param {object} aiReview - { status, summary, issues }
 * @param {object} manualReview - { status, reviewer, notes }
 */
export function reviewProjectDocument(developerId, projectId, docKey, aiReview, manualReview) {
  const dev = getDeveloperById(developerId);
  if (!dev) throw new Error('Developer not found');
  const project = dev.projects.find(p => p.id === projectId);
  if (!project) throw new Error('Project not found');
  const doc = project.documents?.find(d => d.key === docKey);
  if (!doc) throw new Error('Document not found');
  doc.reviewed = true;
  doc.aiReview = aiReview;
  doc.manualReview = manualReview;
  doc.reviewedAt = new Date().toISOString();
  // Save developer/project data (implement persistent save as needed)
  return { success: true };
}

/**
 * Mark project as launched (after RERA uploaded and reviewed)
 * @param {string} developerId
 * @param {string} projectId
 */
export function markProjectLaunched(developerId, projectId) {
  const dev = getDeveloperById(developerId);
  if (!dev) throw new Error('Developer not found');
  const project = dev.projects.find(p => p.id === projectId);
  if (!project) throw new Error('Project not found');
  // Check for reviewed RERA document
  const reraDoc = project.documents?.find(d => d.docType === 'rera' && d.reviewed);
  if (!reraDoc) throw new Error('RERA approval not uploaded and reviewed');
  project.status = 'launched';
  project.launchedAt = new Date().toISOString();
  // Save developer/project data (implement persistent save as needed)
  return { success: true };
}

/**
 * Add a pre-launch project (upcoming project)
 * @param {string} developerId
 * @param {object} projectData
 */
export function addPreLaunchProject(developerId, projectData) {
  const dev = getDeveloperById(developerId);
  if (!dev) throw new Error('Developer not found');
  const project = {
    ...projectData,
    id: uuidv4(),
    status: 'pre-launch',
    documents: [],
    eoiClients: [],
    createdAt: new Date().toISOString()
  };
  dev.projects.push(project);
  // Save developer/project data (implement persistent save as needed)
  return { success: true, project };
}

/**
 * Client submits EOI for a pre-launch project (with KYC upload)
 * @param {string} projectId
 * @param {object} clientInfo
 * @param {Buffer|Uint8Array} kycBuffer
 * @param {string} kycFilename
 * @param {string} kycContentType
 * @returns {Promise<{success:boolean, token?:string, error?:string}>}
 */
export async function submitEOI(projectId, clientInfo, kycBuffer, kycFilename, kycContentType) {
  // Find project (across all developers)
  const dev = findDeveloperByProjectId(projectId);
  if (!dev) throw new Error('Developer/project not found');
  const project = dev.projects.find(p => p.id === projectId);
  if (!project) throw new Error('Project not found');
  // Upload KYC
  const key = `projects/${projectId}/eoi-kyc-${Date.now()}-${kycFilename}`;
  const uploadResult = await awsS3Service.uploadFile(key, kycBuffer, kycContentType);
  // Generate priority token
  const token = `PRIORITY-${projectId}-${Date.now()}-${Math.floor(Math.random()*10000)}`;
  project.eoiClients = project.eoiClients || [];
  project.eoiClients.push({
    ...clientInfo,
    kycUrl: uploadResult.Location,
    kycKey: key,
    token,
    submittedAt: new Date().toISOString(),
    notified: false
  });
  // Save developer/project data (implement persistent save as needed)
  return { success: true, token };
}

/**
 * Notify all priority clients at launch (in order of token)
 * @param {string} projectId
 */
export function notifyPriorityClientsAtLaunch(projectId) {
  const dev = findDeveloperByProjectId(projectId);
  if (!dev) throw new Error('Developer/project not found');
  const project = dev.projects.find(p => p.id === projectId);
  if (!project) throw new Error('Project not found');
  if (project.status !== 'launched') throw new Error('Project not launched yet');
  // Sort by submission time/token
  const sorted = (project.eoiClients || []).sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
  sorted.forEach((client, idx) => {
    // Notify client (email/SMS/notification)
    // notificationService.notifyPriorityClient(client, project, idx+1);
    client.notified = true;
    client.notifiedAt = new Date().toISOString();
  });
  // Save developer/project data (implement persistent save as needed)
  return { success: true, notifiedCount: sorted.length };
}

/**
 * Check if payment request is allowed (only after launch/RERA)
 * @param {string} developerId
 * @param {string} projectId
 * @returns {boolean}
 */
export function canRequestPayment(developerId, projectId) {
  const dev = getDeveloperById(developerId);
  if (!dev) return false;
  const project = dev.projects.find(p => p.id === projectId);
  if (!project) return false;
  return project.status === 'launched';
}

// --- Utility: Find developer by projectId ---
function findDeveloperByProjectId(projectId) {
  // Search all loaded developers
  if (Array.isArray(indiaDevelopers)) {
    for (const dev of indiaDevelopers) {
      if (dev.projects?.find(p => p.id === projectId)) return dev;
    }
  }
  if (Array.isArray(developers)) {
    for (const dev of developers) {
      if (dev.projects?.find(p => p.id === projectId)) return dev;
    }
  }
  return null;
}

// --- Utility: Get developer by ID ---
function getDeveloperById(developerId) {
  if (Array.isArray(indiaDevelopers)) {
    const dev = indiaDevelopers.find(d => d.id === developerId);
    if (dev) return dev;
  }
  if (Array.isArray(developers)) {
    const dev = developers.find(d => d.id === developerId);
    if (dev) return dev;
  }
  return null;
}
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
