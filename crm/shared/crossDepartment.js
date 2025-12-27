// Cross-department AI/human coordination logic
// Example: Initiate a discussion or workflow involving multiple departments and both AI/human users


// In-memory store for demo; replace with DB in production
const discussions = [];

// Initiate a cross-department workflow/discussion
function initiateCrossDepartmentDiscussion({ topic, departments, requiredRoles, initiator }) {
  const discussion = {
    id: `disc_${Date.now()}_${Math.floor(Math.random()*10000)}`,
    topic,
    departments,
    requiredRoles,
    initiator,
    status: 'initiated',
    createdAt: new Date(),
    updatedAt: new Date(),
    auditLog: [
      { action: 'initiated', performedBy: initiator, timestamp: new Date(), details: { departments, requiredRoles } }
    ],
    messages: []
  };
  discussions.push(discussion);
  // TODO: Integrate with notification system for AI/human users
  // TODO: Persist to DB in production
  return discussion;
}

// Add a message or update to a discussion (AI or human)
function addDiscussionMessage(discussionId, { sender, message, isAI = false }) {
  const discussion = discussions.find(d => d.id === discussionId);
  if (!discussion) throw new Error('Discussion not found');
  discussion.messages.push({ sender, message, isAI, timestamp: new Date() });
  discussion.updatedAt = new Date();
  discussion.auditLog.push({ action: 'message', performedBy: sender, timestamp: new Date(), details: { message, isAI } });
  // TODO: Integrate with notification system
  return discussion;
}

// Handoff workflow to another department or AI/human
function handoffDiscussion(discussionId, { from, to, toIsAI = false }) {
  const discussion = discussions.find(d => d.id === discussionId);
  if (!discussion) throw new Error('Discussion not found');
  discussion.status = 'handoff';
  discussion.auditLog.push({ action: 'handoff', performedBy: from, timestamp: new Date(), details: { to, toIsAI } });
  discussion.updatedAt = new Date();
  // TODO: Integrate with notification system
  return discussion;
}

// Complete a cross-department workflow
function completeDiscussion(discussionId, performedBy) {
  const discussion = discussions.find(d => d.id === discussionId);
  if (!discussion) throw new Error('Discussion not found');
  discussion.status = 'completed';
  discussion.auditLog.push({ action: 'completed', performedBy, timestamp: new Date() });
  discussion.updatedAt = new Date();
  return discussion;
}

// Get discussion by ID
function getDiscussion(discussionId) {
  return discussions.find(d => d.id === discussionId);
}

// List all discussions (for admin/debug)
function listDiscussions() {
  return discussions;
}

module.exports = {
  initiateCrossDepartmentDiscussion,
  addDiscussionMessage,
  handoffDiscussion,
  completeDiscussion,
  getDiscussion,
  listDiscussions
};
