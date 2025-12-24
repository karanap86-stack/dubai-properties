import React, { useContext } from 'react'
import { GestureHandler } from 'react-gesture-handler'
import { Heart, MapPin, Home, TrendingUp, Check } from 'lucide-react'
import { ProjectContext } from '../context/ProjectContext'
import { getProjectsByFilter } from '../services/projectService'

export default function ProjectShowcase({ filters, selectedProjects, setSelectedProjects }) {
  const { projects, loading } = useContext(ProjectContext)
  const [displayProjects, setDisplayProjects] = React.useState([])
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [swipeDirection, setSwipeDirection] = React.useState(null)

  React.useEffect(() => {
    const filterProjects = async () => {
      const filtered = projects.filter(project => {
        const priceMatch = project.price >= filters.budget.min && project.price <= filters.budget.max
        const areaMatch = filters.area.length === 0 || filters.area.some(area => project.location.includes(area))
        const typeMatch = filters.propertyType.length === 0 || filters.propertyType.includes(project.bedrooms.toString())
        
        return priceMatch && areaMatch && typeMatch
      })
      setDisplayProjects(filtered)
      setCurrentIndex(0)
    }
    filterProjects()
  }, [filters, projects])

  const handleSwipe = (direction) => {
    setSwipeDirection(direction)
    setTimeout(() => setSwipeDirection(null), 300)
    
    if (direction === 'left') {
      setCurrentIndex((prev) => (prev + 1) % displayProjects.length)
    } else if (direction === 'right') {
      setCurrentIndex((prev) => (prev - 1 + displayProjects.length) % displayProjects.length)
    }
  }

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

  const currentProject = displayProjects[currentIndex]
  const isSelected = selectedProjects.find(p => p.id === currentProject.id)

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Swipeable Card Container */}
        <div
          className={`bg-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 transform ${
            swipeDirection === 'left' ? 'scale-95 rotate-3' : swipeDirection === 'right' ? 'scale-95 -rotate-3' : 'scale-100 rotate-0'
          }`}
          onMouseDown={(e) => {
            const startX = e.clientX
            const handleMouseUp = (event) => {
              const diffX = event.clientX - startX
              if (diffX > 50) handleSwipe('right')
              else if (diffX < -50) handleSwipe('left')
              document.removeEventListener('mouseup', handleMouseUp)
            }
            document.addEventListener('mouseup', handleMouseUp)
          }}
          onTouchStart={(e) => {
            const startX = e.touches[0].clientX
            const handleTouchEnd = (event) => {
              const diffX = event.changedTouches[0].clientX - startX
              if (diffX > 50) handleSwipe('right')
              else if (diffX < -50) handleSwipe('left')
              document.removeEventListener('touchend', handleTouchEnd)
            }
            document.addEventListener('touchend', handleTouchEnd)
          }}
        >
          {/* Image Section */}
          <div className="relative h-64 sm:h-96 overflow-hidden group cursor-pointer">
            <img
              src={currentProject.imageUrl}
              alt={currentProject.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

            {/* Badge */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="bg-cyan-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                {currentProject.location.split(' ')[0]}
              </div>
              <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                ROI: {currentProject.roi}%
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => toggleSelect(currentProject)}
                className={`p-2 rounded-full backdrop-blur-lg transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                    : 'bg-black/40 text-white hover:bg-black/60'
                }`}
              >
                {isSelected ? <Check size={20} /> : <Heart size={20} />}
              </button>
            </div>

            {/* Swipe Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {displayProjects.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === currentIndex ? 'w-8 bg-cyan-400' : 'w-2 bg-gray-600'
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 sm:p-8">
            {/* Title and Developer */}
            <div className="mb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{currentProject.name}</h2>
              <p className="text-cyan-400 font-medium">{currentProject.developer}</p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Home size={18} className="text-cyan-400" />
                <div>
                  <p className="text-xs text-gray-400">Bedrooms</p>
                  <p className="font-semibold text-white">{currentProject.bedrooms}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400">Size</p>
                <p className="font-semibold text-white">{(currentProject.sqft / 1000).toFixed(1)}K sqft</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Completion</p>
                <p className="font-semibold text-white">{currentProject.completionDate}</p>
              </div>
            </div>

            {/* ROI & Appreciation */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-xl border border-cyan-600/20">
              <div>
                <p className="text-xs text-gray-400 mb-1">Expected ROI</p>
                <p className="text-2xl font-bold text-cyan-400">{currentProject.roi}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Annual Appreciation</p>
                <p className="text-2xl font-bold text-green-400 flex items-center gap-1">
                  <TrendingUp size={18} />
                  {currentProject.appreciation}%
                </p>
              </div>
            </div>

            {/* Description and Amenities */}
            <div className="mb-6">
              <p className="text-gray-300 text-sm mb-4">{currentProject.description}</p>
              <div className="flex flex-wrap gap-2">
                {currentProject.amenities.slice(0, 4).map((amenity, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-700 text-gray-300 text-xs rounded-full">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Price and CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">Starting From</p>
                <p className="text-2xl font-bold text-cyan-400">{(currentProject.price / 1000000).toFixed(1)}M AED</p>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                View Details
              </button>
            </div>

            {/* Navigation */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleSwipe('right')}
                className="flex-1 px-4 py-2 border border-slate-700 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                ← Previous
              </button>
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                {currentIndex + 1} / {displayProjects.length}
              </div>
              <button
                onClick={() => handleSwipe('left')}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
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
