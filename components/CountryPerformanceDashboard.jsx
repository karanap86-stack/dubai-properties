import React, { useState, useEffect } from 'react'

// Simulated backend data structure for country-wise performance
const COUNTRY_DATA = [
  { country: 'India', clients: 120, agents: 24, avgResponseTime: 2.1, satisfaction: 4.7, growth: '+12%', topLanguage: 'Hindi', trend: 'Strong growth, luxury & mid-market' },
  { country: 'United Kingdom', clients: 60, agents: 12, avgResponseTime: 2.5, satisfaction: 4.6, growth: '+5%', topLanguage: 'English', trend: 'Stable, premium focus' },
  { country: 'Russia', clients: 40, agents: 8, avgResponseTime: 3.0, satisfaction: 4.4, growth: '-2%', topLanguage: 'Russian', trend: 'Slight decline, high-end focus' },
  { country: 'China', clients: 55, agents: 11, avgResponseTime: 2.3, satisfaction: 4.5, growth: '+8%', topLanguage: 'Mandarin', trend: 'Renewed growth, new devs' },
  { country: 'Pakistan', clients: 50, agents: 10, avgResponseTime: 2.7, satisfaction: 4.3, growth: '+6%', topLanguage: 'Urdu', trend: 'Steady, family projects' },
  { country: 'Saudi Arabia', clients: 45, agents: 9, avgResponseTime: 2.2, satisfaction: 4.6, growth: '+10%', topLanguage: 'Arabic', trend: 'Luxury, waterfront' },
  { country: 'Egypt', clients: 30, agents: 6, avgResponseTime: 2.9, satisfaction: 4.2, growth: '+4%', topLanguage: 'Arabic', trend: 'Growing, Abu Dhabi' },
  { country: 'Iran', clients: 25, agents: 5, avgResponseTime: 3.1, satisfaction: 4.1, growth: '0%', topLanguage: 'Persian', trend: 'Stable, investment focus' },
  { country: 'United States', clients: 35, agents: 7, avgResponseTime: 2.4, satisfaction: 4.5, growth: '+7%', topLanguage: 'English', trend: 'Luxury, tech investors' },
  { country: 'France', clients: 28, agents: 6, avgResponseTime: 2.8, satisfaction: 4.3, growth: '+3%', topLanguage: 'French', trend: 'Branded residences' },
  { country: 'Germany', clients: 22, agents: 5, avgResponseTime: 2.6, satisfaction: 4.4, growth: '+2%', topLanguage: 'German', trend: 'Sustainable, smart homes' },
  { country: 'Canada', clients: 20, agents: 4, avgResponseTime: 2.7, satisfaction: 4.5, growth: '+6%', topLanguage: 'English', trend: 'Expats, retirees' },
  { country: 'Italy', clients: 18, agents: 4, avgResponseTime: 2.9, satisfaction: 4.2, growth: '+1%', topLanguage: 'Italian', trend: 'Holiday, investment' },
  { country: 'Nigeria', clients: 32, agents: 7, avgResponseTime: 2.5, satisfaction: 4.3, growth: '+9%', topLanguage: 'English', trend: 'Affordable luxury' },
  { country: 'Lebanon', clients: 15, agents: 3, avgResponseTime: 3.0, satisfaction: 4.1, growth: '+2%', topLanguage: 'Arabic', trend: 'Consistent, lifestyle' },
  { country: 'Turkey', clients: 17, agents: 4, avgResponseTime: 2.8, satisfaction: 4.2, growth: '+4%', topLanguage: 'Turkish', trend: 'Residential, commercial' },
  { country: 'Jordan', clients: 14, agents: 3, avgResponseTime: 3.2, satisfaction: 4.0, growth: '+1%', topLanguage: 'Arabic', trend: 'Family, mid-market' },
  { country: 'Bangladesh', clients: 12, agents: 3, avgResponseTime: 3.1, satisfaction: 4.0, growth: '+5%', topLanguage: 'Bengali', trend: 'Emerging, affordable' },
  { country: 'Ukraine', clients: 10, agents: 2, avgResponseTime: 3.3, satisfaction: 3.9, growth: '+3%', topLanguage: 'Ukrainian', trend: 'New entrant, investment' },
  { country: 'South Africa', clients: 13, agents: 3, avgResponseTime: 2.9, satisfaction: 4.2, growth: '+6%', topLanguage: 'English', trend: 'Luxury, lifestyle' }
]

export default function CountryPerformanceDashboard() {
  const [data, setData] = useState([])

  useEffect(() => {
    // In production, fetch from backend API
    setData(COUNTRY_DATA)
  }, [])

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8">Country-wise Performance Dashboard</h1>
      <table className="w-full text-sm bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        <thead className="bg-slate-700">
          <tr>
            <th className="p-3">Country</th>
            <th className="p-3">Clients</th>
            <th className="p-3">Agents</th>
            <th className="p-3">Avg. Response (min)</th>
            <th className="p-3">Satisfaction</th>
            <th className="p-3">Growth</th>
            <th className="p-3">Top Language</th>
            <th className="p-3">Trend</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-slate-700 hover:bg-slate-700/30">
              <td className="p-3 font-semibold">{row.country}</td>
              <td className="p-3">{row.clients}</td>
              <td className="p-3">{row.agents}</td>
              <td className="p-3">{row.avgResponseTime}</td>
              <td className="p-3">{row.satisfaction} ⭐</td>
              <td className="p-3">{row.growth}</td>
              <td className="p-3">{row.topLanguage}</td>
              <td className="p-3 text-xs text-cyan-300">{row.trend}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-8 text-gray-400 text-xs">* Data auto-updates as new clients and agents are added. Trends and growth are monitored for auto-scaling and improvisation.</div>
    </div>
  )
}
