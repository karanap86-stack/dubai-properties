// agentCollaborationService.js
// Real-time collaboration, notes sharing, and escalation between AI and human agents

const COLLABORATION_KEY = 'agent_collaboration';
const NOTES_KEY = 'shared_notes';
const ESCALATIONS_KEY = 'escalations';

/**
 * Create a collaboration session for a lead/client
 * @param {object} sessionData - {leadId, clientId, initiatedBy, type, participants}
 * @returns {object}
 */
export function createCollaborationSession(sessionData) {
  try {
    const sessions = getAllSessions();
    
    const session = {
      id: `collab_${Date.now()}`,
      leadId: sessionData.leadId,
      clientId: sessionData.clientId,
      initiatedBy: sessionData.initiatedBy,
      type: sessionData.type || 'lead_handling', // lead_handling, support, negotiation
      participants: sessionData.participants || [], // Array of {agentId, agentName, agentType: 'AI' | 'human', role}
      status: 'active', // active, paused, completed, escalated
      notes: [],
      actions: [],
      context: sessionData.context || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    sessions.push(session);
    localStorage.setItem(COLLABORATION_KEY, JSON.stringify(sessions));
    
    // Notify all participants
    notifyParticipants(session, 'session_created');
    
    return { success: true, session };
  } catch (e) {
    console.error('Create collaboration session failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Get all collaboration sessions
 * @returns {Array}
 */
export function getAllSessions() {
  try {
    return JSON.parse(localStorage.getItem(COLLABORATION_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

/**
 * Get session by ID
 * @param {string} sessionId
 * @returns {object}
 */
export function getSessionById(sessionId) {
  const sessions = getAllSessions();
  return sessions.find(s => s.id === sessionId) || null;
}

/**
 * Add a note to a collaboration session
 * @param {string} sessionId
 * @param {object} noteData - {content, addedBy, agentType, visibility}
 * @returns {object}
 */
export function addNote(sessionId, noteData) {
  try {
    const sessions = getAllSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) {
      return { success: false, error: 'Session not found' };
    }
    
    const note = {
      id: `note_${Date.now()}`,
      content: noteData.content,
      addedBy: noteData.addedBy,
      agentType: noteData.agentType || 'human', // AI or human
      visibility: noteData.visibility || 'all', // all, ai_only, human_only, specific_agents
      createdAt: new Date().toISOString(),
      edited: false
    };
    
    sessions[sessionIndex].notes = sessions[sessionIndex].notes || [];
    sessions[sessionIndex].notes.push(note);
    sessions[sessionIndex].updatedAt = new Date().toISOString();
    
    localStorage.setItem(COLLABORATION_KEY, JSON.stringify(sessions));
    
    // Notify relevant participants
    notifyParticipants(sessions[sessionIndex], 'note_added', { note });
    
    return { success: true, note, sessionId };
  } catch (e) {
    console.error('Add note failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Get notes for a session (filtered by visibility)
 * @param {string} sessionId
 * @param {string} agentId
 * @param {string} agentType - 'AI' or 'human'
 * @returns {Array}
 */
export function getNotes(sessionId, agentId, agentType) {
  try {
    const session = getSessionById(sessionId);
    if (!session) return [];
    
    const notes = session.notes || [];
    
    // Filter based on visibility
    return notes.filter(note => {
      if (note.visibility === 'all') return true;
      if (note.visibility === 'ai_only' && agentType === 'AI') return true;
      if (note.visibility === 'human_only' && agentType === 'human') return true;
      if (Array.isArray(note.visibility) && note.visibility.includes(agentId)) return true;
      return false;
    });
  } catch (e) {
    console.error('Get notes failed:', e);
    return [];
  }
}

/**
 * Escalate session to human agent
 * @param {string} sessionId
 * @param {object} escalationData - {reason, escalatedBy, urgency, assignTo}
 * @returns {object}
 */
export function escalateToHuman(sessionId, escalationData) {
  try {
    const sessions = getAllSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) {
      return { success: false, error: 'Session not found' };
    }
    
    const escalation = {
      id: `escalation_${Date.now()}`,
      sessionId,
      reason: escalationData.reason,
      escalatedBy: escalationData.escalatedBy,
      escalatedFrom: 'AI',
      urgency: escalationData.urgency || 'medium', // low, medium, high, urgent
      assignTo: escalationData.assignTo || null,
      status: 'pending', // pending, accepted, resolved, rejected
      createdAt: new Date().toISOString(),
      resolvedAt: null
    };
    
    // Update session status
    sessions[sessionIndex].status = 'escalated';
    sessions[sessionIndex].escalation = escalation;
    sessions[sessionIndex].updatedAt = new Date().toISOString();
    
    localStorage.setItem(COLLABORATION_KEY, JSON.stringify(sessions));
    
    // Store escalation separately for tracking
    const escalations = JSON.parse(localStorage.getItem(ESCALATIONS_KEY) || '[]');
    escalations.push(escalation);
    localStorage.setItem(ESCALATIONS_KEY, JSON.stringify(escalations));
    
    // Notify assigned agent or all human agents
    notifyEscalation(escalation);
    
    return { success: true, escalation };
  } catch (e) {
    console.error('Escalate to human failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Accept escalation (human agent takes over)
 * @param {string} escalationId
 * @param {string} agentId
 * @returns {object}
 */
export function acceptEscalation(escalationId, agentId) {
  try {
    const escalations = JSON.parse(localStorage.getItem(ESCALATIONS_KEY) || '[]');
    const escalationIndex = escalations.findIndex(e => e.id === escalationId);
    
    if (escalationIndex === -1) {
      return { success: false, error: 'Escalation not found' };
    }
    
    escalations[escalationIndex].status = 'accepted';
    escalations[escalationIndex].acceptedBy = agentId;
    escalations[escalationIndex].acceptedAt = new Date().toISOString();
    
    localStorage.setItem(ESCALATIONS_KEY, JSON.stringify(escalations));
    
    // Update session
    const sessions = getAllSessions();
    const sessionIndex = sessions.findIndex(s => s.id === escalations[escalationIndex].sessionId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].status = 'active';
      sessions[sessionIndex].currentHandler = { agentId, agentType: 'human' };
      localStorage.setItem(COLLABORATION_KEY, JSON.stringify(sessions));
    }
    
    return { success: true, escalation: escalations[escalationIndex] };
  } catch (e) {
    console.error('Accept escalation failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Hand back to AI after human handling
 * @param {string} sessionId
 * @param {string} agentId
 * @param {object} handbackData - {reason, notes, aiInstructions}
 * @returns {object}
 */
export function handbackToAI(sessionId, agentId, handbackData) {
  try {
    const sessions = getAllSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) {
      return { success: false, error: 'Session not found' };
    }
    
    // Add handback note
    const handbackNote = {
      id: `note_${Date.now()}`,
      content: `Handed back to AI. Reason: ${handbackData.reason}. ${handbackData.notes || ''}`,
      addedBy: agentId,
      agentType: 'human',
      visibility: 'all',
      aiInstructions: handbackData.aiInstructions || '',
      createdAt: new Date().toISOString()
    };
    
    sessions[sessionIndex].notes = sessions[sessionIndex].notes || [];
    sessions[sessionIndex].notes.push(handbackNote);
    sessions[sessionIndex].currentHandler = { agentId: 'AI', agentType: 'AI' };
    sessions[sessionIndex].status = 'active';
    sessions[sessionIndex].updatedAt = new Date().toISOString();
    
    localStorage.setItem(COLLABORATION_KEY, JSON.stringify(sessions));
    
    return { success: true, sessionId, handbackNote };
  } catch (e) {
    console.error('Handback to AI failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Log agent action in session
 * @param {string} sessionId
 * @param {object} actionData - {type, description, performedBy, agentType, result}
 * @returns {object}
 */
export function logAction(sessionId, actionData) {
  try {
    const sessions = getAllSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) {
      return { success: false, error: 'Session not found' };
    }
    
    const action = {
      id: `action_${Date.now()}`,
      type: actionData.type, // call, email, whatsapp, status_change, document_sent, etc.
      description: actionData.description,
      performedBy: actionData.performedBy,
      agentType: actionData.agentType,
      result: actionData.result || null,
      timestamp: new Date().toISOString()
    };
    
    sessions[sessionIndex].actions = sessions[sessionIndex].actions || [];
    sessions[sessionIndex].actions.push(action);
    sessions[sessionIndex].updatedAt = new Date().toISOString();
    
    localStorage.setItem(COLLABORATION_KEY, JSON.stringify(sessions));
    
    return { success: true, action };
  } catch (e) {
    console.error('Log action failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Get collaboration analytics
 * @param {object} filters - {startDate, endDate, agentId, agentType}
 * @returns {object}
 */
export function getCollaborationAnalytics(filters = {}) {
  try {
    const sessions = getAllSessions();
    const escalations = JSON.parse(localStorage.getItem(ESCALATIONS_KEY) || '[]');
    
    // Filter sessions by date range
    const filteredSessions = sessions.filter(s => {
      if (filters.startDate && new Date(s.createdAt) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(s.createdAt) > new Date(filters.endDate)) return false;
      return true;
    });
    
    // Calculate metrics
    const analytics = {
      totalSessions: filteredSessions.length,
      activeSessions: filteredSessions.filter(s => s.status === 'active').length,
      completedSessions: filteredSessions.filter(s => s.status === 'completed').length,
      escalatedSessions: filteredSessions.filter(s => s.status === 'escalated').length,
      totalEscalations: escalations.length,
      escalationsByUrgency: {
        low: escalations.filter(e => e.urgency === 'low').length,
        medium: escalations.filter(e => e.urgency === 'medium').length,
        high: escalations.filter(e => e.urgency === 'high').length,
        urgent: escalations.filter(e => e.urgency === 'urgent').length
      },
      averageNotesPerSession: filteredSessions.length > 0
        ? (filteredSessions.reduce((sum, s) => sum + (s.notes?.length || 0), 0) / filteredSessions.length).toFixed(2)
        : 0,
      averageActionsPerSession: filteredSessions.length > 0
        ? (filteredSessions.reduce((sum, s) => sum + (s.actions?.length || 0), 0) / filteredSessions.length).toFixed(2)
        : 0
    };
    
    return { success: true, analytics };
  } catch (e) {
    console.error('Get collaboration analytics failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Notify participants about session updates
 * @param {object} session
 * @param {string} eventType
 * @param {object} data
 */
function notifyParticipants(session, eventType, data = {}) {
  // TODO: Implement real-time notifications (WebSocket, Push, etc.)
  console.log('Notify participants:', { session: session.id, eventType, data });
  
  // In production, send notifications via:
  // - WebSocket for real-time updates
  // - Push notifications for mobile
  // - Email for important escalations
}

/**
 * Notify about escalation
 * @param {object} escalation
 */
function notifyEscalation(escalation) {
  // TODO: Implement escalation notifications (SMS, Push, Email, Slack)
  console.log('Escalation notification:', escalation);
  
  // Priority notification channels based on urgency:
  // - Urgent: SMS + Push + Email + Slack
  // - High: Push + Email
  // - Medium: Push or Email
  // - Low: Email only
}

export default {
  createCollaborationSession,
  getAllSessions,
  getSessionById,
  addNote,
  getNotes,
  escalateToHuman,
  acceptEscalation,
  handbackToAI,
  logAction,
  getCollaborationAnalytics
};
