import React from 'react'
import { ChevronDown, X } from 'lucide-react'
import propertyTypesByRegion from '../data/propertyTypesByRegion.json';


export default function FilterPanel({ filters, setFilters }) {
  const [expandedFilter, setExpandedFilter] = React.useState(null);
  const [areaSearch, setAreaSearch] = React.useState('');

  // Get user region from localStorage (set by onboarding modal)
  let userPrefs = null;
  try {
    userPrefs = JSON.parse(localStorage.getItem('userPrefs'));
  } catch (e) { userPrefs = null; }
  const region = userPrefs?.region || 'dubai';

  // Map region to group in propertyTypesByRegion
  const regionGroup = (() => {
    if (region === 'dubai' || region === 'abu_dhabi') return 'uae';
    if (region === 'india') return 'india';
    // Add more as you expand
    return 'uae';
  })();

  // Property types for this region
  const propertyTypes = Object.entries(propertyTypesByRegion[regionGroup].categories)
    .flatMap(([cat, arr]) => arr.map(opt => ({ ...opt, group: cat })))
    .map(opt => ({ ...opt, label: `${opt.label} (${opt.group.charAt(0).toUpperCase() + opt.group.slice(1)})` }));

  // Areas for this region (simple static for now, can be dynamic)
  const areasByRegion = {
    dubai: ['Downtown Dubai', 'Dubai Marina', 'Palm Jumeirah', 'JBR', 'Arabian Ranches', 'Business Bay'],
    abu_dhabi: ['Saadiyat Island', 'Al Reef', 'Yas Island', 'Khalifa City'],
    india: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'],
    // Add more as needed
  };
  const areas = areasByRegion[region] || areasByRegion['dubai'];

  // Developers (could be region-specific, static for now)
  const developersByRegion = {
    dubai: ['Emaar Properties', 'Damac Properties', 'Nakheel', 'Omniyat'],
    abu_dhabi: ['Aldar Properties', 'Imkan', 'Bloom Properties'],
    india: ['Prestige Group', 'Godrej Properties', 'DLF', 'Sobha Limited', 'Brigade Group'],
  };
  const developers = developersByRegion[region] || developersByRegion['dubai'];

  // Amenities (static, can be region-specific)
  const amenities = ['Pool', 'Gym', 'Parking', 'Security', 'Concierge', 'Beach', 'Marina', 'Mall'];

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
    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl mx-4 sm:mx-8 lg:mx-12 mb-10 overflow-visible backdrop-blur shadow-lg">
      <div className="px-6 sm:px-10 py-6">
        <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <span className="w-3 h-3 bg-cyan-400 rounded-full"></span>
          Filter Properties
        </h2>

        {/* Dynamic Area Search */}
        <div className="mb-4">
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Search area (e.g., Malad West, Dubai Marina)"
            value={areaSearch}
            onChange={e => {
              setAreaSearch(e.target.value)
              // Update filters.area to array with search value if not empty, else []
              setFilters({
                ...filters,
                area: e.target.value ? [e.target.value] : []
              })
            }}
          />
        </div>

        <FilterSection title="Budget Range" filterType="budget" isRange={true} />
        <FilterSection title="Area / Location" filterType="area" options={areas} />
        <FilterSection title="Property Type" filterType="propertyType" options={propertyTypes} />
        <FilterSection title="Developer" filterType="developer" options={developers} />
        <FilterSection title="Amenities" filterType="amenities" options={amenities} />

        {(filters.area.length > 0 || filters.propertyType.length > 0 || filters.developer.length > 0 || filters.amenities.length > 0) && (
          <button
            onClick={() => {
              setAreaSearch('')
              setFilters({
                budget: { min: 0, max: 5000000 },
                area: [],
                propertyType: [],
                developer: [],
                bedrooms: [],
                amenities: []
              })
            }}
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
