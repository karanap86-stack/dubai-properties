

import AboutSection from './components/AboutSection'
import { sendBirthdayWishesToClients } from './services/leadService'

function App() {
  const [activeTab, setActiveTab] = useState('discover')
  const [selectedProjects, setSelectedProjects] = useState([])
  const [filters, setFilters] = useState({
    budget: { min: 0, max: 5000000 },
    area: [],
    propertyType: [],
    developer: [],
    bedrooms: [],
    amenities: [],
  })
  const [adminMode, setAdminMode] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('admin') === '1' || localStorage.getItem('adminMode') === 'true') {
      setAdminMode(true)
    }
    // Run birthday wishes on app load and then daily
    const runBirthdayWishes = async () => {
      try {
        await sendBirthdayWishesToClients();
      } catch (e) { console.error('Birthday wishes failed', e); }
    }
    runBirthdayWishes();
    const bdayInterval = setInterval(runBirthdayWishes, 1000 * 60 * 60 * 24);
    return () => clearInterval(bdayInterval);
  }, [])

  return (
    <ProjectProvider>
      <div className="min-h-screen bg-gray-900">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        {/* Schedule weekly refresh check */}
        {
          (() => {
            React.useEffect(() => {
              const runIfDue = async () => {
                try {
                  if (shouldRefreshNow()) {
                    await performRefresh()
                  }
                } catch (e) { console.error('Auto-refresh failed', e) }
              }
              // Check immediately on load
              runIfDue()
              // Then check once per day
              const id = setInterval(runIfDue, 1000 * 60 * 60 * 24)
              return () => clearInterval(id)
            }, [])
            return null
          })()
        }
        
        {activeTab === 'discover' && (
          <div>
            <HeroSection />
            <FilterPanel filters={filters} setFilters={setFilters} />
            <ProjectShowcase 
              filters={filters}
              selectedProjects={selectedProjects}
              setSelectedProjects={setSelectedProjects}
            />
          </div>
        )}

        {activeTab === 'compare' && (
          <PropertyComparison selectedProjects={selectedProjects} />
        )}

        {activeTab === 'ai' && (
          <AIContentGenerator />
        )}

        {adminMode && activeTab === 'export' && (
          <GoogleSheetIntegration selectedProjects={selectedProjects} />
        )}

        {adminMode && activeTab === 'leads' && (
          <LeadsDashboard />
        )}
        {adminMode && activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}
        {adminMode && activeTab === 'partners' && (
          <PartnersDashboard />
        )}
        {adminMode && activeTab === 'social' && (
          <SocialIntegration />
        )}

        {/* About Section always visible at bottom */}
        <AboutSection />
      </div>
    </ProjectProvider>
  )
}

export default App
