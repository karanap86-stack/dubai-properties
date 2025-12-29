import React, { useState, useEffect } from 'react'
import { getAllProjects } from '../services/projectService'
import { handleClientFeedback, handleDeveloperFeedback } from '../services/feedbackService'
import AdminAutomationMenu from './AdminAutomationMenu'
import InnovationReviewPanel from './InnovationReviewPanel'

// Simulated in-memory feedback and developer ratings (replace with backend in production)
let feedbackLog = [] // [{ type, message, context, date }]
let developerRatings = {} // { [developer]: { rating, feedbacks, research } }

// Demo: Expose developerRatings from feedbackService if available
try {
  developerRatings = require('../services/feedbackService').developerRatings || {}
} catch {}

export default function AdminFeedbackDashboard() {
  const [projects, setProjects] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [devRatings, setDevRatings] = useState({})

  useEffect(() => {
    getAllProjects().then(setProjects)
    // In production, fetch feedbackLog and developerRatings from backend
    setFeedbacks(feedbackLog)
    setDevRatings(developerRatings)
  }, [])

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Admin Feedback Dashboard</h1>
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Developer Ratings & Research</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(devRatings).length === 0 && <div className="text-gray-400">No developer feedback yet.</div>}
          {Object.entries(devRatings).map(([dev, data]) => (
            <div key={dev} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">{dev}</span>
                <span className="text-yellow-400 font-bold">Rating: {data.rating?.toFixed(2) || 5}/5</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-cyan-300">Recent Feedback:</span>
                <ul className="list-disc ml-6 text-sm mt-1">
                  {data.feedbacks?.slice(-3).map((f, i) => (
                    <li key={i} className={f.severity === 'major' ? 'text-red-400' : 'text-yellow-200'}>
                      {f.feedback} <span className="italic text-xs">({f.severity}{f.recurring ? ', recurring' : ''})</span>
                    </li>
                  ))}
                  {(!data.feedbacks || data.feedbacks.length === 0) && <li className="text-gray-500">No feedback yet</li>}
                </ul>
              </div>
              <div>
                <span className="font-semibold text-cyan-300">Research Log:</span>
                <ul className="list-disc ml-6 text-xs mt-1">
                  {data.research?.slice(-3).map((r, i) => (
                    <li key={i}>{r.summary} <span className="italic">({r.severity}{r.recurring ? ', recurring' : ''})</span></li>
                  ))}
                  {(!data.research || data.research.length === 0) && <li className="text-gray-500">No research yet</li>}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="mb-10">
        <InnovationReviewPanel reviewer="admin" />
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">All Feedback Log</h2>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          {feedbacks.length === 0 && <div className="text-gray-400">No feedback received yet.</div>}
          <ul className="divide-y divide-slate-700">
            {feedbacks.map((fb, i) => (
              <li key={i} className="py-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-cyan-200">{fb.type}</span>
                  <span className="text-xs text-gray-400">{new Date(fb.date).toLocaleString()}</span>
                </div>
                <div className="mt-1 text-sm">{fb.message}</div>
                {fb.context && <div className="text-xs text-gray-400 mt-1">Context: {JSON.stringify(fb.context)}</div>}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <AdminAutomationMenu />
    </div>
  )
}
