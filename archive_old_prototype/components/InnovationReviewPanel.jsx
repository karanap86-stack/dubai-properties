// InnovationReviewPanel.jsx
import React, { useState } from 'react';
import innovationMonitorService from '../services/innovationMonitorService';

export default function InnovationReviewPanel({ reviewer = 'admin' }) {
  const [suggestions, setSuggestions] = useState(() => innovationMonitorService.reviewAndApproveSuggestions(reviewer));
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-slate-800 rounded text-white">
      <h2 className="text-2xl font-bold mb-4">Innovation Suggestions Review</h2>
      <button className="mb-4 px-3 py-1 bg-cyan-600 rounded" onClick={() => setShowAll(!showAll)}>
        {showAll ? 'Hide' : 'Show'} All Suggestions
      </button>
      <ul>
        {(showAll ? suggestions : suggestions.slice(-3)).map((s, i) => (
          <li key={i} className="mb-4 border-b border-slate-700 pb-2">
            <div className="font-semibold text-cyan-300">{s.title}</div>
            <div className="text-gray-200 mb-1">{s.description}</div>
            <div className="text-xs text-gray-400">Source: <a href={s.source} className="underline" target="_blank" rel="noopener noreferrer">{s.source}</a></div>
            <div className="text-xs text-gray-500">Date: {new Date(s.date).toLocaleString()}</div>
            <div className="text-xs text-yellow-400 mt-1">Status: {s.status} (Reviewed by: {s.reviewedBy})</div>
          </li>
        ))}
      </ul>
      {suggestions.length === 0 && <div className="text-gray-400">No suggestions yet.</div>}
    </div>
  );
}
