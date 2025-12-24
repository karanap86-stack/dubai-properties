import React from 'react'
import { ChevronDown, X } from 'lucide-react'

export default function FilterPanel({ filters, setFilters }) {
  const [expandedFilter, setExpandedFilter] = React.useState(null)

  const areas = ['Downtown Dubai', 'Dubai Marina', 'Palm Jumeirah', 'JBR', 'Arabian Ranches', 'Business Bay', 'Saadiyat Island', 'Al Reef', 'Yas Island', 'Khalifa City']
  const propertyTypes = [
    { value: '1', label: '1 Bedroom' },
    { value: '2', label: '2 Bedroom' },
    { value: '3', label: '3 Bedroom' },
    { value: '4', label: '4+ Bedroom' },
    { value: '5', label: '5+ Bedroom' }
  ]
  const developers = ['Emaar Properties', 'Damac Properties', 'Aldar Properties', 'Nakheel', 'Omniyat']
  const amenities = ['Pool', 'Gym', 'Parking', 'Security', 'Concierge', 'Beach', 'Marina', 'Mall']

  const handleBudgetChange = (field, value) => {
    setFilters({
      ...filters,
      budget: { ...filters.budget, [field]: parseInt(value) }
    })
  }

  const toggleFilter = (filterType, value) => {
    const current = filters[filterType] || []
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value]
    setFilters({ ...filters, [filterType]: updated })
  }

  const FilterSection = ({ title, filterType, options, isRange = false }) => (
    <div className="border-b border-slate-700">
      <button
        onClick={() => setExpandedFilter(expandedFilter === filterType ? null : filterType)}
        className="w-full px-4 py-3 flex justify-between items-center hover:bg-slate-800/50 transition-colors"
      >
        <span className="font-semibold text-white">{title}</span>
        <ChevronDown
          size={18}
          className={`text-cyan-400 transition-transform ${expandedFilter === filterType ? 'rotate-180' : ''}`}
        />
      </button>

      {expandedFilter === filterType && (
        <div className="px-4 py-3 bg-slate-800/30 space-y-3">
          {isRange ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-2">Min: {filters.budget.min.toLocaleString()} AED</label>
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="100000"
                  value={filters.budget.min}
                  onChange={(e) => handleBudgetChange('min', e.target.value)}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-2">Max: {filters.budget.max.toLocaleString()} AED</label>
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="100000"
                  value={filters.budget.max}
                  onChange={(e) => handleBudgetChange('max', e.target.value)}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {options.map((option) => (
                <label key={option.value || option} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters[filterType].includes(option.value || option)}
                    onChange={() => toggleFilter(filterType, option.value || option)}
                    className="w-4 h-4 rounded border-cyan-500 accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {option.label || option}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-lg mx-4 sm:mx-6 lg:mx-8 mb-8 overflow-hidden backdrop-blur">
      <div className="px-4 sm:px-6 py-4">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
          Filter Properties
        </h2>

        <FilterSection title="Budget Range" filterType="budget" isRange={true} />
        <FilterSection title="Area / Location" filterType="area" options={areas} />
        <FilterSection title="Property Type" filterType="propertyType" options={propertyTypes} />
        <FilterSection title="Developer" filterType="developer" options={developers} />
        <FilterSection title="Amenities" filterType="amenities" options={amenities} />

        {(filters.area.length > 0 || filters.propertyType.length > 0 || filters.developer.length > 0 || filters.amenities.length > 0) && (
          <button
            onClick={() => setFilters({
              budget: { min: 0, max: 5000000 },
              area: [],
              propertyType: [],
              developer: [],
              bedrooms: [],
              amenities: []
            })}
            className="w-full mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <X size={16} />
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  )
}
