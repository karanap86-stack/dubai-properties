// --- ADVANCED LEAD STATUS FLOWS (PENDING APPROVAL, KYC, PAYMENT, NEGOTIATION) ---
import { MASTER_DISPOSITIONS } from './dispositionMapping';

/**
 * Set or update the status of a lead (pending approval, kyc_pending, payment_pending, negotiation, etc.)
 * @param {string} leadId
 * @param {string} status - Must be in MASTER_DISPOSITIONS
 * @param {object} [meta] - Optional metadata (e.g., who/when/why)
 * @returns {object}
 */
export function setLeadStatus(leadId, status, meta = {}) {
  if (!MASTER_DISPOSITIONS.includes(status)) throw new Error('Invalid status');
  const leads = getAllLeads();
  const lead = leads.find(l => l.id === leadId);
  if (!lead) throw new Error('Lead not found');
  lead.status = status;
  lead.statusHistory = lead.statusHistory || [];
  lead.statusHistory.push({ status, changedAt: new Date().toISOString(), ...meta });
  lead.lastUpdated = new Date().toISOString();
  localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads));
  // Optionally, trigger automations/notifications for key statuses
  if (status === 'kyc_pending') {
    // Notify client to upload KYC docs
    // notificationService.notifyClientKycPending(leadId);
  } else if (status === 'payment_pending') {
    // Notify client to complete payment
    // notificationService.notifyClientPaymentPending(leadId);
  } else if (status === 'negotiation') {
    // Notify agent/developer for negotiation
    // notificationService.notifyNegotiationStarted(leadId);
  } else if (status === 'pending_approval') {
    // Notify approver/admin
    // notificationService.notifyPendingApproval(leadId);
  }
  return { success: true, status };
}

/**
 * Progress a lead to the next logical status in the sales journey
 * @param {string} leadId
 * @returns {object}
 */
export function progressLeadStatus(leadId) {
  const leads = getAllLeads();
  const lead = leads.find(l => l.id === leadId);
  if (!lead) throw new Error('Lead not found');
  const current = lead.status;
  const idx = MASTER_DISPOSITIONS.indexOf(current);
  if (idx === -1 || idx === MASTER_DISPOSITIONS.length - 1) return { success: false, error: 'Already at final status' };
  const nextStatus = MASTER_DISPOSITIONS[idx + 1];
  return setLeadStatus(leadId, nextStatus, { autoProgressed: true });
}

/**
 * Get the full status history for a lead
 * @param {string} leadId
 * @returns {Array}
 */
export function getLeadStatusHistory(leadId) {
  const leads = getAllLeads();
  const lead = leads.find(l => l.id === leadId);
  if (!lead) throw new Error('Lead not found');
  return lead.statusHistory || [];
}
// --- AUTOMATION TRIGGERS FOR ALL LEADS ---
// Call this after every lead creation or update
export async function handleLeadAutomation(leadId) {
  // Auto-share with relevant 3rd-party providers
  await autoShareLeadWithProviders(leadId);
  // Optionally, trigger other automations (e.g., analytics, notifications)
}

// --- KYC & DOCUMENT UPLOAD LOGIC (AWS S3) ---
import awsS3Service from './awsS3Service';

/**
 * Upload a KYC or document file to S3 and link to a lead
 * @param {string} leadId
 * @param {Buffer|Uint8Array} fileBuffer
 * @param {string} filename
 * @param {string} contentType
 * @param {string} docType - e.g., 'kyc', 'passport', 'id', 'proof', 'agreement', etc.
 * @returns {Promise<{success:boolean, url?:string, error?:string}>}
 */
export async function uploadLeadDocument(leadId, fileBuffer, filename, contentType, docType) {
  try {
    const key = `leads/${leadId}/${docType || 'document'}-${Date.now()}-${filename}`;
    const uploadResult = await awsS3Service.uploadFile(key, fileBuffer, contentType);
    // Link document to lead (store S3 URL and metadata)
    const leads = getAllLeads();
    const lead = leads.find(l => l.id === leadId);
    if (!lead) throw new Error('Lead not found');
    lead.documents = lead.documents || [];
    lead.documents.push({
      url: uploadResult.Location,
      key,
      filename,
      contentType,
      docType,
      uploadedAt: new Date().toISOString()
    });
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads));
    return { success: true, url: uploadResult.Location };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Get signed download URL for a lead document
 * @param {string} leadId
 * @param {string} key
 * @param {number} expiresIn
 * @returns {string}
 */
export function getLeadDocumentUrl(leadId, key, expiresIn = 3600) {
  return awsS3Service.getSignedUrl(key, expiresIn);
}

// --- LOCAL RESOURCE-BASED CRM SYNC LOGIC ---
// Use localStorage/in-memory as CRM for now

// Sync all leads, revenue, and pipeline from local resources
export function syncLeadsFromLocalCRM() {
  const leads = getAllLeads();
  // Simulate CRM update: just use local leads for now
  for (const lead of leads) {
    updateLeadFromLocalCRM(lead);
  }
  recalculateRevenueAndPipelineLocal(leads);
  return { success: true, count: leads.length };
}

// Update a local lead from local CRM (no-op for now, placeholder for future logic)
function updateLeadFromLocalCRM(lead) {
  // Could add logic to update lead status, stage, etc. based on local business rules
}

// Calculate revenue and pipeline from local leads
function recalculateRevenueAndPipelineLocal(leads) {
  let totalRevenue = 0;
  let pipelineCount = 0;
  for (const lead of leads) {
    if (lead.status === 'closed-won' && lead.commissionAmount) {
      totalRevenue += Number(lead.commissionAmount);
    }
    if (lead.status === 'open' || lead.status === 'in-progress') {
      pipelineCount++;
    }
  }
  // Store or log for analytics/dashboard
  localStorage.setItem('REVENUE_TOTAL', totalRevenue);
  localStorage.setItem('PIPELINE_COUNT', pipelineCount);
}
// --- AUTOMATED SERVICE PROVIDER MATCHING & SHARING ---
// Automatically match and share leads with relevant 3rd-party providers based on lead requirements
export async function autoShareLeadWithProviders(leadId) {
  const leads = getAllLeads();
  const lead = leads.find(l => l.id === leadId);
  if (!lead) throw new Error('Lead not found');
  const providers = serviceProviderService.getAllProviders();
  const matchedProviders = [];
  // Match by service type and optionally by location, budget, etc.
  const serviceTypes = ['interior', 'loan', 'rental', 'resale'];
  for (const type of serviceTypes) {
    // Only match if lead has relevant requirement
    if (
      (type === 'interior' && lead.customerInfo?.needsInterior) ||
      (type === 'loan' && lead.customerInfo?.needsLoan) ||
      (type === 'rental' && lead.customerInfo?.needsRental) ||
      (type === 'resale' && lead.customerInfo?.wantsToResell)
    ) {
      const candidates = providers.filter(p => p.serviceType === type);
      for (const provider of candidates) {
        // Share with provider if not already shared
        await shareLeadWithServiceProvider(leadId, provider.id, type);
        matchedProviders.push({ providerId: provider.id, serviceType: type });
        // Optionally, send notification to provider (pseudo-code)
        // notificationService.notifyProvider(provider.id, leadId, type);
      }
    }
  }
  return { matchedProviders };
}
// --- EXTENSIBLE SERVICE PROVIDER LOGIC ---
// Service types: 'interior', 'loan', 'rental', 'resale', etc.
import serviceProviderService from './serviceProviderService'
// --- SERVICE PROVIDER ONBOARDING LOGIC ---
// Add a new 3rd-party service provider (interior, loan, rental, resale, etc.)
export function onboardServiceProvider({ name, serviceType, contactInfo, commissionModel, notes }) {
  if (!name || !serviceType || !commissionModel) throw new Error('Missing required fields')
  return serviceProviderService.addProvider({ name, serviceType, contactInfo, commissionModel, notes })
}

// Share lead with 3rd-party service provider (commission model)
// Supports: interior, loan, rental, resale, etc.
export async function shareLeadWithServiceProvider(leadId, providerId, serviceType) {
  const leads = getAllLeads()
  const lead = leads.find(l => l.id === leadId)
  if (!lead) throw new Error('Lead not found')
  const provider = serviceProviderService.getAllProviders().find(p => p.id === providerId && p.serviceType === serviceType)
  if (!provider) throw new Error('Service provider not found')
  // Only share requirement details, never client contact info unless explicitly approved
  const requirements = {
    serviceType,
    budget: lead.customerInfo?.budget,
    preferences: lead.customerInfo?.preferences,
    location: lead.location,
    notes: lead.notes,
    discussionSummary: lead.discussionSummary
  }
  // For resale, include property details if available
  if (serviceType === 'resale' && lead.propertyDetails) {
    requirements.propertyDetails = lead.propertyDetails
  }
  lead.sharedWithServiceProviders = lead.sharedWithServiceProviders || []
  if (!lead.sharedWithServiceProviders.find(x => x.providerId === providerId && x.serviceType === serviceType)) {
    lead.sharedWithServiceProviders.push({ providerId, serviceType, sharedAt: new Date().toISOString(), commissionModel: provider.commissionModel })
    lead.lastUpdated = new Date().toISOString()
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
  }
  // Optionally, trigger follow-up reminder to provider
  // ...
  return { success: true }
}

// Track commission outcome for service provider
export function recordServiceProviderCommission(leadId, providerId, serviceType, commissionDetails) {
  const leads = getAllLeads()
  const lead = leads.find(l => l.id === leadId)
  if (!lead) throw new Error('Lead not found')
  lead.serviceProviderCommissions = lead.serviceProviderCommissions || []
  lead.serviceProviderCommissions.push({ providerId, serviceType, commissionDetails, recordedAt: new Date().toISOString() })
  lead.lastUpdated = new Date().toISOString()
  localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
  return { success: true }
}
// Notify client of developer follow-up outcome and TAT
export async function notifyClientOfDeveloperFollowUp(leadId, developerId, tatDays, infoType) {
  const leads = getAllLeads()
  const lead = leads.find(l => l.id === leadId)
  if (!lead) throw new Error('Lead not found')
  const clientName = lead.customerInfo?.name?.split(' ')[0] || 'there'
  const dev = developerService.getAllDevelopers().find(d => d.id === developerId)
  const devName = dev?.name || 'the developer'
  const project = (lead.selectedProjects && lead.selectedProjects[0]?.name) ? ` for the project "${lead.selectedProjects[0].name}"` : ''
  const info = infoType || 'information'
  const tat = tatDays ? `within ${tatDays} day(s)` : 'soon'
  const message = `Hi ${clientName},\n\nWe wanted to let you know that we have followed up with ${devName}${project} regarding your request. They will provide the required ${info} ${tat}. We will keep you updated every step of the way.\n\nIf you have any questions, just reply to this message.\n\n— Your Dubai Properties Team`
  await sendWhatsAppToClient({ ...lead, customMessage: message })
  lead.lastNotifiedClient = new Date().toISOString()
  lead.lastUpdated = new Date().toISOString()
  localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
  return { success: true }
}

// Track developer info delivery and notify client
export async function recordDeveloperInfoDelivery(leadId, developerId, infoType) {
  const leads = getAllLeads()
  const lead = leads.find(l => l.id === leadId)
  if (!lead) throw new Error('Lead not found')
  lead.developerInfoDelivered = lead.developerInfoDelivered || []
  lead.developerInfoDelivered.push({ developerId, infoType, deliveredAt: new Date().toISOString() })
  lead.lastUpdated = new Date().toISOString()
  localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
  const clientName = lead.customerInfo?.name?.split(' ')[0] || 'there'
  const dev = developerService.getAllDevelopers().find(d => d.id === developerId)
  const devName = dev?.name || 'the developer'
  const project = (lead.selectedProjects && lead.selectedProjects[0]?.name) ? ` for the project "${lead.selectedProjects[0].name}"` : ''
  const info = infoType || 'information'
  const message = `Hi ${clientName},\n\nGreat news! ${devName}${project} has shared the requested ${info} with us. Please check your messages for the details.\n\nIf you need any more help or have questions, just reply to this message.\n\n— Your Dubai Properties Team`
  await sendWhatsAppToClient({ ...lead, customMessage: message })
  const followupMsg = `Is there anything else we can assist you with regarding your property search? Reply YES for more help or NO if all is good.`
  await sendWhatsAppToClient({ ...lead, customMessage: followupMsg })
  return { success: true }
}
// Agent follow-up logic: ensure clients get timely info from developers
export function monitorDeveloperResponse(leadId, developerId, lastClientContactDate) {
  // If client hasn't received info in X days, agent intervenes
  const leads = getAllLeads()
  const lead = leads.find(l => l.id === leadId)
  if (!lead) throw new Error('Lead not found')
  const now = new Date()
  const lastContact = lastClientContactDate ? new Date(lastClientContactDate) : null
  const daysSinceContact = lastContact ? (now - lastContact) / (1000 * 60 * 60 * 24) : null
  // If more than 2 days since last developer response to client, agent follows up
  if (daysSinceContact !== null && daysSinceContact > 2) {
    // Log agent intervention
    lead.agentFollowUps = lead.agentFollowUps || []
    lead.agentFollowUps.push({
      developerId,
      date: now.toISOString(),
      reason: 'No timely response from developer to client',
    })
    lead.lastUpdated = now.toISOString()
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
    // In production: trigger notification to agent and developer
    // ...
    return { intervention: true }
  }
  return { intervention: false }
}
// --- COLLABORATION & FOLLOW-UP LOGIC ---
import partnerService from './partnerService'
import developerService from './developerService'

// Share lead with developer (full details, follow-up enabled)
export async function shareLeadWithDeveloper(leadId, developerId, consent = { shareContact: true, shareBudget: true, shareRequirements: true }) {
  const leads = getAllLeads()
  const lead = leads.find(l => l.id === leadId)
  if (!lead) throw new Error('Lead not found')
  const developer = developerService.getAllDevelopers().find(d => d.id === developerId)
  if (!developer) throw new Error('Developer not found')
  // Use unified sharedWith array for all sharing
  lead.sharedWith = lead.sharedWith || []
  if (!lead.sharedWith.find(s => s.developerId === developerId)) {
    lead.sharedWith.push({ developerId, consent, sharedAt: new Date().toISOString(), type: 'developer', status: 'sent' })
    lead.lastUpdated = new Date().toISOString()
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
  }
  // Optionally, trigger follow-up reminder to developer
  // ...
  return { success: true }
}

// Share lead with channel partner (only requirement details, never contact info)
export async function shareLeadWithPartner(leadId, partnerId, consent = { shareContact: false, shareBudget: true, shareRequirements: true }) {
  const leads = getAllLeads()
  const lead = leads.find(l => l.id === leadId)
  if (!lead) throw new Error('Lead not found')
  const partner = partnerService.getAllPartners().find(p => p.id === partnerId)
  if (!partner) throw new Error('Partner not found')
  // Use unified sharedWith array for all sharing
  lead.sharedWith = lead.sharedWith || []
  if (!lead.sharedWith.find(s => s.partnerId === partnerId)) {
    lead.sharedWith.push({ partnerId, consent, sharedAt: new Date().toISOString(), type: 'partner', status: 'sent' })
    lead.lastUpdated = new Date().toISOString()
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
  }
  // Optionally, trigger follow-up reminder to partner
  // ...
  return { success: true }
}

// Update outcome of collaboration (developer/partner)
export function updateCollaborationOutcome(leadId, entityId, entityType, outcome) {
  // entityType: 'developer' | 'partner'
  const leads = getAllLeads()
  const lead = leads.find(l => l.id === leadId)
  if (!lead) throw new Error('Lead not found')
  lead.collaborationOutcomes = lead.collaborationOutcomes || []
  lead.collaborationOutcomes.push({
    entityId,
    entityType,
    outcome,
    timestamp: new Date().toISOString()
  })
  lead.lastUpdated = new Date().toISOString()
  localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
  return { success: true }
}

// Reassign lead if partner/developer can't fulfill
export function reassignLead(leadId, reason, agentId = null) {
  const leads = getAllLeads()
  const lead = leads.find(l => l.id === leadId)
  if (!lead) throw new Error('Lead not found')
  // Block reassignment if pending approval
  if (lead.pendingApproval && !lead.pendingApproval.resolved) {
    throw new Error('Client approval required before reassignment.')
  }
  lead.reassignmentHistory = lead.reassignmentHistory || []
  lead.reassignmentHistory.push({ reason, date: new Date().toISOString(), agentId })
  // For demo: just clear previous assignments
  lead.sharedWith = []
  lead.lastUpdated = new Date().toISOString()
  localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
  return { success: true }
}

// Agent must always get client approval before moving lead to new developer/partner
export function requestClientApprovalForReassignment(leadId, newDeveloperId) {
  // In production, trigger notification to agent for client approval
  const leads = getAllLeads()
  const lead = leads.find(l => l.id === leadId)
  if (!lead) throw new Error('Lead not found')
  lead.pendingApproval = { newDeveloperId, requestedAt: new Date().toISOString(), resolved: false }
  lead.lastUpdated = new Date().toISOString()
  localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads))
  return { success: true }
}

// Utility: Ensure client never sees partner info
export function getClientSafeLeadView(lead) {
  const safe = { ...lead }
  delete safe.sharedWith
  delete safe.collaborationOutcomes
  delete safe.reassignmentHistory
  // Remove any partner/developer-specific info
  return safe
}
import * as coreAutomation from './coreAutomationService'
import { assignAgentByLocation } from './agentService'
// Utility: Check if client is returning after 2 weeks and not booked
export function isReturningClient(lead) {
  if (!lead || lead.status === 'booked') return false;
  const lastUpdated = new Date(lead.lastUpdated || lead.createdAt);
  const now = new Date();
  const diffDays = (now - lastUpdated) / (1000 * 60 * 60 * 24);
  return diffDays >= 14;
}

// Mark that re-engagement was shown to this lead
export function markReengagementShown(leadId) {
  const leads = getAllLeads();
  const lead = leads.find(l => l.id === leadId);
  if (lead) {
    lead.reengagementShown = true;
    lead.lastUpdated = new Date().toISOString();
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leads));
  }
}
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
// Accepts: leadData { ..., location, preferredLanguage }
export const saveLead = (leadData) => {
  try {
    const leads = getAllLeads()
    // Assign agent based on location and NRI status (if provided)
    const assignedAgent = assignAgentByLocation({
      country: leadData.location?.country,
      state: leadData.location?.state,
      city: leadData.location?.city,
      isNRI: leadData.isNRI || false
    })
    const newLead = {
      id: Date.now(),
      ...leadData,
      location: leadData.location || null, // { country, locale, state, city }
      preferredLanguage: leadData.preferredLanguage || 'English',
      assignedAgent,
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
    // Trigger event-driven automations for this lead
    triggerLeadAutomations(newLead)
    return newLead
  } catch (error) {
    console.error('Error saving lead:', error)
    throw error
  }
}

// Helper: trigger all automations for a lead immediately
function triggerLeadAutomations(lead) {
  const market = lead.location?.country || 'global'
  // AI-driven content (if needed)
  // coreAutomation.generateAIContent(lead, market)
  // Predictive analytics
  coreAutomation.predictMarketTrends(lead.location?.region, market)
  // Lead nurturing
  coreAutomation.nurtureLead(lead, market)
  // Smart agent assignment (stub)
  // coreAutomation.assignSmartAgent(lead, agents, market)
  // Personalized dashboard (stub)
  // coreAutomation.personalizeClientDashboard(lead, market)
  // Compliance (stub)
  coreAutomation.generateComplianceReport(lead.location?.region, market)
  // Partner automation (stub)
  // coreAutomation.automatePartnerSharing(lead, partners, market)
  // Feedback (stub)
  coreAutomation.collectAndAnalyzeFeedback(lead, market)
  // Log for now
  console.log(`[Automation][Immediate] Lead: ${lead.id} | Market: ${market}`)
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
    // Prevent duplicate notifications for the same event/recipient
    const sent = new Set()
    const sendOnce = async (fn, key) => {
      if (sent.has(key)) return null
      sent.add(key)
      return await fn(leadData)
    }
    const [
      ownerWhatsApp,
      ownerEmail,
      clientWhatsApp,
      clientEmail
    ] = await Promise.all([
      sendOnce(sendWhatsAppNotification, 'owner_whatsapp'),
      sendOnce(sendEmailNotification, 'owner_email'),
      sendOnce(sendWhatsAppToClient, 'client_whatsapp'),
      sendOnce(sendEmailToClient, 'client_email')
    ])
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
