import React from 'react'
import { TrendingUp, DollarSign, Target, AlertCircle, ChevronDown } from 'lucide-react'
import { getRoiReasons } from '../services/projectService'

export default function PropertyComparison({ selectedProjects }) {
  const [expandedReasons, setExpandedReasons] = React.useState(null)

  if (selectedProjects.length === 0) {
    return (
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center py-20">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-400 text-lg">Select projects from the Discover tab to compare.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">Property Comparison</h1>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-700 mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                <th className="px-4 py-4 text-left text-cyan-400 font-semibold">Property</th>
                {selectedProjects.map((project) => (
                  <th key={project.id} className="px-4 py-4 text-center text-cyan-400 font-semibold">
                    <div className="text-xs text-gray-400 mb-1">{project.location}</div>
                    <div className="text-white text-sm">{project.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Price', key: 'price', format: (v) => `${(v / 1000000).toFixed(1)}M AED` },
                { label: 'Bedrooms', key: 'bedrooms', format: (v) => v },
                { label: 'Size (sqft)', key: 'sqft', format: (v) => `${(v / 1000).toFixed(1)}K` },
                { label: 'Expected ROI', key: 'roi', format: (v) => `${v}%`, highlight: true },
                { label: 'Annual Appreciation', key: 'appreciation', format: (v) => `${v}%`, highlight: true },
                { label: 'Units Available', key: 'units', format: (v) => v },
                { label: 'Completion', key: 'completionDate', format: (v) => v }
              ].map((row, i) => (
                <tr key={i} className={`border-b border-slate-700 ${i % 2 === 0 ? 'bg-gray-900/50' : 'bg-slate-800/50'}`}>
                  <td className="px-4 py-3 font-semibold text-gray-300">{row.label}</td>
                  {selectedProjects.map((project) => (
                    <td
                      key={project.id}
                      className={`px-4 py-3 text-center font-semibold ${
                        row.highlight ? 'text-cyan-400' : 'text-white'
                      }`}
                    >
                      {row.format(project[row.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {selectedProjects.map((project) => (
            <div key={project.id} className="bg-slate-800/50 border border-cyan-600/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target size={20} className="text-cyan-400" />
                {project.name} - Investment Analysis
              </h3>

              {/* ROI Breakdown */}
              <div className="mb-6 p-4 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-lg border border-cyan-600/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Expected ROI</span>
                  <span className="text-2xl font-bold text-cyan-400">{project.roi}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(project.roi * 2, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Appreciation Analysis */}
              <div className="mb-6 p-4 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-lg border border-green-600/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 flex items-center gap-2">
                    <TrendingUp size={16} />
                    Annual Appreciation
                  </span>
                  <span className="text-2xl font-bold text-green-400">{project.appreciation}%</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Estimated property value growth per year
                </div>
              </div>

              {/* Investment Potential Calculation */}
              <div className="mb-6 space-y-3">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <DollarSign size={16} className="text-cyan-400" />
                  5-Year Investment Projection
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Initial Investment</span>
                    <span className="text-white">{(project.price / 1000000).toFixed(1)}M AED</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estimated ROI (5 years)</span>
                    <span className="text-cyan-400">{((project.price * project.roi / 100 * 5) / 1000000).toFixed(2)}M AED</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Appreciation Value (5 years)</span>
                    <span className="text-green-400">{((project.price * (Math.pow(1 + project.appreciation / 100, 5) - 1)) / 1000000).toFixed(2)}M AED</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700 flex justify-between">
                    <span className="text-white font-semibold">Projected Value (5 years)</span>
                    <span className="text-cyan-400 font-bold">
                      {((project.price * Math.pow(1 + project.appreciation / 100, 5)) / 1000000).toFixed(2)}M AED
                    </span>
                  </div>
                </div>
              </div>

              {/* Why This ROI */}
              <div className="border-t border-slate-700 pt-4">
                <button
                  onClick={() => setExpandedReasons(expandedReasons === project.id ? null : project.id)}
                  className="w-full flex items-center justify-between text-left text-white font-semibold hover:text-cyan-400 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-cyan-400" />
                    Why This ROI? (Click to expand)
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${expandedReasons === project.id ? 'rotate-180' : ''}`}
                  />
                </button>

                {expandedReasons === project.id && (
                  <ul className="mt-3 space-y-2 text-sm text-gray-300">
                    {getRoiReasons(project).map((reason, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Best Deal Analysis */}
        {selectedProjects.length >= 2 && (
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-600/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target size={20} className="text-cyan-400" />
              Best Deal Analysis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                {
                  label: 'Best ROI',
                  project: selectedProjects.reduce((a, b) => a.roi > b.roi ? a : b),
                  value: (p) => `${p.roi}%`
                },
                {
                  label: 'Best Appreciation',
                  project: selectedProjects.reduce((a, b) => a.appreciation > b.appreciation ? a : b),
                  value: (p) => `${p.appreciation}%`
                },
                {
                  label: 'Best Value (Price/sqft)',
                  project: selectedProjects.reduce((a, b) => (a.price / a.sqft) < (b.price / b.sqft) ? a : b),
                  value: (p) => `${(p.price / p.sqft).toFixed(0)} AED/sqft`
                }
              ].map((item, i) => (
                <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-gray-400 text-xs font-medium mb-2">{item.label}</p>
                  <p className="text-white font-bold text-lg mb-1">{item.project.name}</p>
                  <p className="text-cyan-400 font-bold text-xl">{item.value(item.project)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
