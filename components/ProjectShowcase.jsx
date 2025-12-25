
import React, { useContext } from 'react'
import { Heart, MapPin, Home, TrendingUp, Check } from 'lucide-react'
import { ProjectContext } from '../context/ProjectContext'


export default function ProjectShowcase({ filters, selectedProjects, setSelectedProjects }) {
  const { projects, loading } = useContext(ProjectContext)
  const [displayProjects, setDisplayProjects] = React.useState([])

  React.useEffect(() => {
    // Exclude sold out and resale properties if such status exists in future
    const filtered = projects.filter(project => {
      // If project.status exists, exclude 'sold out' and 'resale'
      if (project.status && (project.status.toLowerCase() === 'sold out' || project.status.toLowerCase() === 'resale')) {
        return false
      }
      const priceMatch = project.price >= filters.budget.min && project.price <= filters.budget.max
      const areaMatch = filters.area.length === 0 || filters.area.some(area => project.location.includes(area))
      const typeMatch = filters.propertyType.length === 0 || filters.propertyType.includes(project.bedrooms.toString())
      return priceMatch && areaMatch && typeMatch
    })
    setDisplayProjects(filtered)
  }, [filters, projects])

  const toggleSelect = (project) => {
    if (selectedProjects.find(p => p.id === project.id)) {
      setSelectedProjects(selectedProjects.filter(p => p.id !== project.id))
    } else {
      setSelectedProjects([...selectedProjects, project])
    }
  }


  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"></div>
        </div>
      </div>
    )
  }


  if (displayProjects.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-400 text-lg">No projects match your filters. Try adjusting your criteria.</p>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-8 lg:px-12 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Top Heading */}
        <div className="text-center mb-10 mt-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Your gateway to the home that's just <span className="text-cyan-400">Perfect</span>
          </h2>
        </div>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {displayProjects.map((project) => {
            const isSelected = selectedProjects.find(p => p.id === project.id)
            return (
              <div key={project.id} className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                {/* Image Section */}
                <div className="relative h-44 sm:h-56 overflow-hidden group cursor-pointer">
                  <img
                    src={project.imageUrl}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{ maxHeight: '320px', minHeight: '180px', objectFit: 'cover' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  {/* Badge */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="bg-cyan-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {project.location.split(' ')[0]}
                    </div>
                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      ROI: {project.roi}%
                    </div>
                  </div>
                  {/* Action Button */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => toggleSelect(project)}
                      className={`p-2 rounded-full backdrop-blur-lg transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                          : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                    >
                      {isSelected ? <Check size={20} /> : <Heart size={20} />}
                    </button>
                  </div>
                </div>
                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-2">
                    <h2 className="text-lg font-bold text-white mb-1">{project.name}</h2>
                    <p className="text-cyan-400 font-medium text-sm">{project.developer}</p>
                    {/* Project Status (if available) */}
                    {project.status && (
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-700 text-white text-xs rounded-full">
                        {project.status}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Home size={16} className="text-cyan-400" />
                      <span className="text-xs text-gray-400">{project.bedrooms} BR</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">{(project.sqft / 1000).toFixed(1)}K sqft</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="text-xs text-gray-400">Completion: </span>
                    <span className="font-semibold text-white text-xs">{project.completionDate}</span>
                  </div>
                  <div className="mb-3">
                    <span className="text-xs text-gray-400">Expected ROI: </span>
                    <span className="font-bold text-cyan-400 text-xs">{project.roi}%</span>
                  </div>
                  <div className="mb-3">
                    <span className="text-xs text-gray-400">Annual Appreciation: </span>
                    <span className="font-bold text-green-400 text-xs flex items-center gap-1">
                      <TrendingUp size={14} />
                      {project.appreciation}%
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-gray-300 text-xs line-clamp-3">{project.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.amenities.slice(0, 3).map((amenity, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-700 text-gray-300 text-xs rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <span className="text-xs text-gray-400">From</span>
                      <div className="text-lg font-bold text-cyan-400">{(project.price / 1000000).toFixed(1)}M AED</div>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all text-xs">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {/* Selected Projects Summary */}
        {selectedProjects.length > 0 && (
          <div className="mt-8 p-4 sm:p-6 bg-blue-600/20 border border-blue-600/50 rounded-xl">
            <p className="text-white font-semibold mb-3">
              Selected for Comparison: {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedProjects.map((project) => (
                <div
                  key={project.id}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full flex items-center gap-2"
                >
                  {project.name}
                  <button
                    onClick={() => setSelectedProjects(selectedProjects.filter(p => p.id !== project.id))}
                    className="hover:bg-blue-700 rounded-full p-0.5"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
