// AIChatbotWidget.jsx
import React, { useState } from 'react';
import aiChatbotService from '../services/aiChatbotService';

export default function AIChatbotWidget() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! How can I help you with Dubai properties today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages(msgs => [...msgs, { from: 'user', text: input }]);
    setLoading(true);
    // Optionally, pass userId/lang/agentId for tracking
    const reply = await aiChatbotService.getResponse(input);
    setMessages(msgs => [...msgs, { from: 'bot', text: reply }]);
    setInput('');
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-lg shadow-lg border border-gray-300 z-50">
      <div className="bg-cyan-700 text-white px-4 py-2 rounded-t-lg font-bold">AI Chatbot</div>
      <div className="p-3 h-64 overflow-y-auto flex flex-col gap-2 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={m.from === 'bot' ? 'text-left' : 'text-right'}>
            <span className={m.from === 'bot' ? 'bg-cyan-100 text-cyan-900 px-2 py-1 rounded' : 'bg-gray-300 text-gray-900 px-2 py-1 rounded'}>
              {m.text}
            </span>
          </div>
        ))}
        {loading && <div className="text-left text-cyan-700">...</div>}
      </div>
      <div className="flex border-t border-gray-200">
        <input
          className="flex-1 px-2 py-1 rounded-bl-lg outline-none"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          className="px-4 py-1 bg-cyan-600 text-white rounded-br-lg"
          onClick={sendMessage}
          disabled={loading}
        >Send</button>
      </div>
    </div>
  );
}
