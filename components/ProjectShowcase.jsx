

import React, { useContext } from 'react'
import { Heart, MapPin, Home, TrendingUp, Check } from 'lucide-react'
import { ProjectContext } from '../context/ProjectContext'
import propertyTypesByRegion from '../data/propertyTypesByRegion.json';



export default function ProjectShowcase({ filters, selectedProjects, setSelectedProjects }) {
  const { projects, loading } = useContext(ProjectContext)
  const [displayProjects, setDisplayProjects] = React.useState([])
  const [bestSellingProjects, setBestSellingProjects] = React.useState({})
  const [lastBestSellerRefresh, setLastBestSellerRefresh] = React.useState(null)

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

  // Helper: Find best-selling project in area by type (by units)
  const getBestSellingProjectByType = (area, projectList, typeValue) => {
    const areaProjects = projectList.filter(p =>
      p.location.toLowerCase().includes(area.toLowerCase()) &&
      (p.type === typeValue)
    );
    if (areaProjects.length === 0) return null;
    return areaProjects.reduce((best, curr) => (curr.units > (best?.units || 0) ? curr : best), null);
  };

  React.useEffect(() => {
    // Exclude sold out and resale properties if such status exists in future
    const filtered = projects.filter(project => {
      if (project.status && (project.status.toLowerCase() === 'sold out' || project.status.toLowerCase() === 'resale')) {
        return false
      }
      const priceMatch = project.price >= filters.budget.min && project.price <= filters.budget.max
      const areaMatch = filters.area.length === 0 || filters.area.some(area => project.location.toLowerCase().includes(area.toLowerCase()))
      const typeMatch = filters.propertyType.length === 0 || filters.propertyType.includes(project.bedrooms?.toString()) || (project.type && filters.propertyType.includes(project.type))
      return priceMatch && areaMatch && typeMatch
    })
    setDisplayProjects(filtered)

    // Best-selling logic: Use first area in filter or search, or fallback to most common area
    let area = ''
    if (filters.area && filters.area.length > 0) {
      area = filters.area[0]
    } else if (filtered.length > 0) {
      // Fallback: most common area in filtered
      const areaCounts = {}
      filtered.forEach(p => {
        const loc = p.location
        areaCounts[loc] = (areaCounts[loc] || 0) + 1
      })
      area = Object.keys(areaCounts).reduce((a, b) => areaCounts[a] > areaCounts[b] ? a : b, '')
    }
    // Property types to show best sellers for (region-specific)
    // Only show up to 5 most relevant types for this region
    const bestSellerTypes = propertyTypes.slice(0, 5);
    // Refresh best sellers monthly (simulate with timestamp)
    const now = new Date()
    if (!lastBestSellerRefresh || (now - lastBestSellerRefresh) > 1000 * 60 * 60 * 24 * 28) {
      setLastBestSellerRefresh(now)
      const bests = {}
      bestSellerTypes.forEach(pt => {
        bests[pt.value] = area ? getBestSellingProjectByType(area, projects, pt.value) : null
      });
      setBestSellingProjects(bests)
    }

      return (
        <div className="px-4 sm:px-8 lg:px-12 pb-24">
          <div className="max-w-7xl mx-auto">
            {/* Top Heading */}
            <div className="text-center mb-10 mt-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ color: '#0a2e6d' }}>
                Your gateway to the home that's just <span style={{ color: '#00e676' }}>Perfect</span>
              </h2>
            </div>

            {/* Best-Selling Projects by Property Type for Area */}
            <div className="mb-12">
              {bestSellerTypes.map(pt => {
                const best = bestSellingProjects[pt.value];
                if (!best) return null;
                return (
                  <div key={pt.value} className="mb-8">
                    <h3 className="text-xl font-bold mb-4" style={{ color: '#00e676' }}>Best-Selling {pt.label} in {best.location}</h3>
                    <div className="rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ background: 'rgba(10,46,109,0.07)' }}>
                      {/* Image Section */}
                      <div className="relative h-44 sm:h-56 overflow-hidden group cursor-pointer">
                        <img
                          src={best.imageUrl}
                          alt={best.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          style={{ maxHeight: '320px', minHeight: '180px', objectFit: 'cover' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        {/* Badge */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#00e676', color: '#0a2e6d' }}>
                            {best.location.split(' ')[0]}
                          </div>
                          <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#0a2e6d', color: '#fff' }}>
                            ROI: {best.roi}%
                          </div>
                        </div>
                      </div>
                      {/* Content Section */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="mb-2">
                          <h2 className="text-lg font-bold mb-1" style={{ color: '#0a2e6d' }}>{best.name}</h2>
                          <p className="font-medium text-sm" style={{ color: '#00e676' }}>{best.developer}</p>
                          {best.status && (
                            <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs" style={{ background: '#00e676', color: '#0a2e6d' }}>
                              {best.status}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="flex items-center gap-2">
                            <Home size={16} style={{ color: '#00e676' }} />
                            <span className="text-xs" style={{ color: '#0a2e6d' }}>{best.bedrooms ? best.bedrooms + ' BR' : best.type}</span>
                          </div>
                          <div>
                            <span className="text-xs" style={{ color: '#0a2e6d' }}>{(best.sqft / 1000).toFixed(1)}K sqft</span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <span className="text-xs" style={{ color: '#0a2e6d' }}>Completion: </span>
                          <span className="font-semibold text-xs" style={{ color: '#00e676' }}>{best.completionDate}</span>
                        </div>
                        <div className="mb-3">
                          <span className="text-xs" style={{ color: '#0a2e6d' }}>Expected ROI: </span>
                          <span className="font-bold text-xs" style={{ color: '#00e676' }}>{best.roi}%</span>
                        </div>
                        <div className="mb-3">
                          <span className="text-xs" style={{ color: '#0a2e6d' }}>Annual Appreciation: </span>
                          <span className="font-bold text-xs flex items-center gap-1" style={{ color: '#0a2e6d' }}>
                            <TrendingUp size={14} />
                            {best.appreciation}%
                          </span>
                        </div>
                        <div className="mb-3">
                          <p className="text-xs line-clamp-3" style={{ color: '#0a2e6d' }}>{best.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {best.amenities.slice(0, 3).map((amenity, i) => (
                            <span key={i} className="px-2 py-1 rounded-full text-xs" style={{ background: '#00e676', color: '#0a2e6d' }}>
                              {amenity}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-end justify-between mt-auto">
                          <div>
                            <span className="text-xs" style={{ color: '#0a2e6d' }}>From</span>
                            <div className="text-lg font-bold" style={{ color: '#00e676' }}>{(best.price / 1000000).toFixed(1)}M AED</div>
                          </div>
                          <button className="px-4 py-2 rounded-lg font-semibold transition-all text-xs" style={{ background: 'linear-gradient(90deg, #0a2e6d 0%, #00e676 100%)', color: '#fff' }}>
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Other Projects */}
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {(() => {
                // Collect all best-selling project IDs
                const bestSellingIds = Object.values(bestSellingProjects)
                  .filter(Boolean)
                  .map(p => p.id);
                return displayProjects
                  .filter(p => !bestSellingIds.includes(p.id))
                  .map((project) => {
                    const isSelected = selectedProjects.find(p => p.id === project.id);
                    return (
                      <div key={project.id} className="rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ background: 'rgba(10,46,109,0.07)' }}>
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
                            <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#00e676', color: '#0a2e6d' }}>
                              {project.location.split(' ')[0]}
                            </div>
                            <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#0a2e6d', color: '#fff' }}>
                              ROI: {project.roi}%
                            </div>
                          </div>
                          {/* Action Button */}
                          <div className="absolute top-4 right-4 flex gap-2">
                            <button
                              onClick={() => toggleSelect(project)}
                              className={`p-2 rounded-full backdrop-blur-lg transition-all ${isSelected ? 'shadow-lg' : ''}`}
                              style={{ background: isSelected ? 'linear-gradient(90deg, #0a2e6d 0%, #00e676 100%)' : 'rgba(0,0,0,0.4)', color: '#fff' }}
                            >
                              {isSelected ? <Check size={20} /> : <Heart size={20} />}
                            </button>
                          </div>
                        </div>
                        {/* Content Section */}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="mb-2">
                            <h2 className="text-lg font-bold mb-1" style={{ color: '#0a2e6d' }}>{project.name}</h2>
                            <p className="font-medium text-sm" style={{ color: '#00e676' }}>{project.developer}</p>
                            {/* Project Status (if available) */}
                            {project.status && (
                              <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs" style={{ background: '#00e676', color: '#0a2e6d' }}>
                                {project.status}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="flex items-center gap-2">
                              <Home size={16} style={{ color: '#00e676' }} />
                              <span className="text-xs" style={{ color: '#0a2e6d' }}>{project.bedrooms} BR</span>
                            </div>
                            <div>
                              <span className="text-xs" style={{ color: '#0a2e6d' }}>{(project.sqft / 1000).toFixed(1)}K sqft</span>
                            </div>
                          </div>
                          <div className="mb-3">
                            <span className="text-xs" style={{ color: '#0a2e6d' }}>Completion: </span>
                            <span className="font-semibold text-xs" style={{ color: '#00e676' }}>{project.completionDate}</span>
                          </div>
                          <div className="mb-3">
                            <span className="text-xs" style={{ color: '#0a2e6d' }}>Expected ROI: </span>
                            <span className="font-bold text-xs" style={{ color: '#00e676' }}>{project.roi}%</span>
                          </div>
                          <div className="mb-3">
                            <span className="text-xs" style={{ color: '#0a2e6d' }}>Annual Appreciation: </span>
                            <span className="font-bold text-xs flex items-center gap-1" style={{ color: '#0a2e6d' }}>
                              <TrendingUp size={14} />
                              {project.appreciation}%
                            </span>
                          </div>
                          <div className="mb-3">
                            <p className="text-xs line-clamp-3" style={{ color: '#0a2e6d' }}>{project.description}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.amenities.slice(0, 3).map((amenity, i) => (
                              <span key={i} className="px-2 py-1 rounded-full text-xs" style={{ background: '#00e676', color: '#0a2e6d' }}>
                                {amenity}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-end justify-between mt-auto">
                            <div>
                              <span className="text-xs" style={{ color: '#0a2e6d' }}>From</span>
                              <div className="text-lg font-bold" style={{ color: '#00e676' }}>{(project.price / 1000000).toFixed(1)}M AED</div>
                            </div>
                            <button className="px-4 py-2 rounded-lg font-semibold transition-all text-xs" style={{ background: 'linear-gradient(90deg, #0a2e6d 0%, #00e676 100%)', color: '#fff' }}>
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
              })()}
            </div>

            {/* Selected Projects Summary */}
            {selectedProjects.length > 0 && (
              <div className="mt-8 p-4 sm:p-6 rounded-xl" style={{ background: 'rgba(0,230,118,0.10)', border: '2px solid #00e676' }}>
                <p className="font-semibold mb-3" style={{ color: '#0a2e6d' }}>
                  Selected for Comparison: {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      style={{ background: '#00e676', color: '#0a2e6d' }}
                    >
                      {project.name}
                      <button
                        onClick={() => setSelectedProjects(selectedProjects.filter(p => p.id !== project.id))}
                        className="rounded-full p-0.5"
                        style={{ background: '#0a2e6d', color: '#fff' }}
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
      );
    }
                          <div className="text-lg font-bold" style={{ color: '#00e676' }}>{(project.price / 1000000).toFixed(1)}M AED</div>
                        </div>
                        <button className="px-4 py-2 rounded-lg font-semibold transition-all text-xs" style={{ background: 'linear-gradient(90deg, #0a2e6d 0%, #00e676 100%)', color: '#fff' }}>
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              });
          })()}
        {/* Selected Projects Summary */}
        {selectedProjects.length > 0 && (
          <div className="mt-8 p-4 sm:p-6 rounded-xl" style={{ background: 'rgba(0,230,118,0.10)', border: '2px solid #00e676' }}>
            <p className="font-semibold mb-3" style={{ color: '#0a2e6d' }}>
              Selected for Comparison: {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedProjects.map((project) => (
                <div
                  key={project.id}
                  className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  style={{ background: '#00e676', color: '#0a2e6d' }}
                >
                  {project.name}
                  <button
                    onClick={() => setSelectedProjects(selectedProjects.filter(p => p.id !== project.id))}
                    className="rounded-full p-0.5"
                    style={{ background: '#0a2e6d', color: '#fff' }}
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
  );
}
