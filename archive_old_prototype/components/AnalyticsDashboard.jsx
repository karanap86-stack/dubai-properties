import React, { useEffect, useState } from 'react'
import analytics from '../services/analyticsService'
import { getAllLeads } from '../services/leadService'

export default function AnalyticsDashboard() {
  const [aggregates, setAggregates] = useState(null)

  const refresh = () => {
    const leads = getAllLeads()
    const agg = analytics.getAggregates(leads)
    setAggregates(agg)
  }

  useEffect(() => { refresh() }, [])

  if (!aggregates) return <div className="pt-24 px-6">Loading analytics...</div>;

  return (
    <div className="pt-24 px-6">
      <h2 className="text-2xl font-bold text-white mb-4">Analytics & Dashboards</h2>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded p-4">
          <p className="text-sm text-gray-300">Total Events</p>
          <p className="text-3xl font-bold text-white">{aggregates.totalEvents}</p>
        </div>
        <div className="bg-slate-800 rounded p-4">
          <p className="text-sm text-gray-300">Leads Created (tracked)</p>
          <p className="text-3xl font-bold text-white">{aggregates.totalLeadsCreated}</p>
        </div>
        <div className="bg-slate-800 rounded p-4">
          <p className="text-sm text-gray-300">Notifications Sent</p>
          <p className="text-3xl font-bold text-white">{aggregates.notificationsSent}</p>
        </div>
        <div className="bg-slate-800 rounded p-4">
          <p className="text-sm text-gray-300">Conversion Rate</p>
          <p className="text-3xl font-bold text-white">{aggregates.conversionRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded p-4">
          <h4 className="text-white font-semibold mb-2">Leads Per Day (last 30 days)</h4>
          <div className="text-sm text-gray-300 max-h-56 overflow-auto">
            {Object.entries(aggregates.leadsPerDay).map(([day, count]) => (
              <div key={day} className="flex justify-between py-1 border-b border-slate-700/20">
                <span>{day}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded p-4">
          <h4 className="text-white font-semibold mb-2">Top Selected Projects</h4>
          <div className="text-sm text-gray-300">
            {aggregates.topProjects.length === 0 ? (
              <p className="text-gray-500">No project selections yet</p>
            ) : (
              aggregates.topProjects.map(p => (
                <div key={p.name} className="flex justify-between py-1 border-b border-slate-700/20">
                  <span>{p.name}</span>
                  <span className="font-semibold">{p.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-800 rounded p-4">
          <h4 className="text-white font-semibold mb-2">Funnel</h4>
          <div className="text-sm text-gray-300">
            <div>Open: <span className="font-semibold">{aggregates.funnel.open}</span></div>
            <div>In Progress: <span className="font-semibold">{aggregates.funnel.inProgress}</span></div>
            <div>Closed Won: <span className="font-semibold">{aggregates.funnel.closedWon}</span></div>
            <div>Closed Lost: <span className="font-semibold">{aggregates.funnel.closedLost}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-slate-800 rounded p-4">
          <h4 className="text-white font-semibold mb-2">Leads by Temperature</h4>
          <div className="text-sm text-gray-300">
            <div>Hot: <span className="font-semibold">{aggregates.leadsByTemperature.hot}</span></div>
            <div>Warm: <span className="font-semibold">{aggregates.leadsByTemperature.warm}</span></div>
            <div>Cold: <span className="font-semibold">{aggregates.leadsByTemperature.cold}</span></div>
          </div>
        </div>
        <div className="bg-slate-800 rounded p-4">
          <h4 className="text-white font-semibold mb-2">Engagement</h4>
          <div className="text-sm text-gray-300">
            <div>Unique Users: <span className="font-semibold">{aggregates.uniqueUsers}</span></div>
            <div>Unique Agents: <span className="font-semibold">{aggregates.uniqueAgents}</span></div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button onClick={refresh} className="px-4 py-2 bg-cyan-600 rounded text-white">Refresh</button>
        <button onClick={() => { const csv = analytics.exportEventsToCSV(); const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `analytics-events-${new Date().toISOString().slice(0,10)}.csv`; a.click(); }} className="px-4 py-2 bg-emerald-600 rounded text-white">Export CSV</button>
      </div>
    </div>
  );
}
