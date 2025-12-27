// Dynamic AI team scaling logic (startup best practices)
const User = require('./models/User');
const { departments } = require('../../shared/roles');
const { aiRoles, initialStaffing } = require('../../shared/aiRoles');

// Example: scale up AI staff if open tasks/leads per agent exceeds threshold
async function scaleAIStaff(department, workload) {
  // workload: { openLeads, openTasks }
  const agentCount = await User.countDocuments({ department, role: 'AI Agent', isAI: true });
  const maxPerAgent = 20; // e.g., 20 open leads/tasks per agent
  const needed = Math.ceil((workload.openLeads + workload.openTasks) / maxPerAgent);
  if (needed > agentCount) {
    // Add more AI Agents
    for (let i = 0; i < needed - agentCount; i++) {
      await User.create({
        name: `AI Agent ${department} Auto ${Date.now()}`,
        email: `ai-agent-${department.toLowerCase()}-auto-${Date.now()}@ai.local`,
        password: 'AI_MANAGED',
        department,
        role: 'AI Agent',
        isAI: true
      });
    }
    return `Scaled up AI Agents in ${department} to ${needed}`;
  }
  return 'No scaling needed';
}

module.exports = { scaleAIStaff };
