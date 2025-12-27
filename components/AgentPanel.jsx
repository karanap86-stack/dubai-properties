import React, { useState } from 'react';
import TaskPanel from './TaskPanel';
// This panel shows agent hierarchy and allows human agents to update conversations, requirements, and status.
// It also provides tools for follow-ups, outcome updates, and task management.

const mockAgents = [
  { id: 1, name: 'Alice Smith', role: 'Manager', status: 'Online', reports: [2, 3] },
  { id: 2, name: 'Bob Lee', role: 'Senior Agent', status: 'Busy', reports: [] },
  { id: 3, name: 'Carol Jones', role: 'Agent', status: 'Available', reports: [] },
];

const mockConversations = [
  { id: 101, client: 'John Doe', agentId: 2, status: 'In Progress', requirements: 'Looking for 2BHK in Dubai', updates: [] },
  { id: 102, client: 'Jane Roe', agentId: 3, status: 'Follow-up Needed', requirements: 'Commercial office in Mumbai', updates: [] },
];

function AgentPanel() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState(mockConversations);
  const [updateText, setUpdateText] = useState('');

  const handleAgentClick = (agent) => setSelectedAgent(agent);
  const handleConversationClick = (conv) => setSelectedConversation(conv);

  const handleAddUpdate = () => {
    if (!selectedConversation || !updateText) return;
    setConversations(conversations.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, updates: [...conv.updates, { text: updateText, date: new Date().toISOString() }] }
        : conv
    ));
    setUpdateText('');
  };

  return (
    <div className="agent-panel flex gap-8 p-6 bg-gray-50 rounded-lg shadow">
      {/* Agent Hierarchy */}
      <div className="w-1/4">
        <h2 className="font-bold mb-2">Agent Hierarchy</h2>
        <ul>
          {mockAgents.map(agent => (
            <li key={agent.id} className={`mb-2 cursor-pointer ${selectedAgent?.id === agent.id ? 'font-semibold text-blue-600' : ''}`} onClick={() => handleAgentClick(agent)}>
              {agent.name} <span className="text-xs text-gray-500">({agent.role}, {agent.status})</span>
            </li>
          ))}
        </ul>
        {/* Show tasks for selected agent */}
        {selectedAgent && <TaskPanel agentId={selectedAgent.id} />}
      </div>
      {/* Conversations */}
      <div className="w-1/3">
        <h2 className="font-bold mb-2">Conversations</h2>
        <ul>
          {conversations.filter(conv => !selectedAgent || conv.agentId === selectedAgent.id).map(conv => (
            <li key={conv.id} className={`mb-2 cursor-pointer ${selectedConversation?.id === conv.id ? 'font-semibold text-green-600' : ''}`} onClick={() => handleConversationClick(conv)}>
              {conv.client} <span className="text-xs text-gray-500">({conv.status})</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Conversation Details & Updates */}
      <div className="w-2/5">
        {selectedConversation ? (
          <div>
            <h2 className="font-bold mb-2">Conversation Details</h2>
            <div className="mb-2">Client: <span className="font-semibold">{selectedConversation.client}</span></div>
            <div className="mb-2">Requirements: <span className="font-semibold">{selectedConversation.requirements}</span></div>
            <div className="mb-2">Status: <span className="font-semibold">{selectedConversation.status}</span></div>
            <h3 className="font-semibold mt-4 mb-1">Updates & Follow-ups</h3>
            <ul className="mb-2">
              {selectedConversation.updates.map((u, i) => (
                <li key={i} className="text-xs text-gray-700">{u.date}: {u.text}</li>
              ))}
            </ul>
            <textarea className="w-full border rounded p-1 mb-2" rows={2} value={updateText} onChange={e => setUpdateText(e.target.value)} placeholder="Add update, follow-up, or outcome..." />
            <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={handleAddUpdate}>Add Update</button>
          </div>
        ) : (
          <div className="text-gray-400">Select a conversation to view details and update.</div>
        )}
      </div>
    </div>
  );
}

export default AgentPanel;
