

import AboutSection from './components/AboutSection'
import AIChatbot from './components/AIChatbot'
import AdminFeedbackDashboard from './components/AdminFeedbackDashboard'
import CountryPerformanceDashboard from './components/CountryPerformanceDashboard'
import MarketSelectionModal from './components/MarketSelectionModal'
import { sendBirthdayWishesToClients } from './services/leadService'
import { scheduleNoContactNotification, cancelNoContactNotification } from './services/notificationService'
import { ensureAsanaAuth } from './services/asanaService'
import { recordEvent } from './services/analyticsService'

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
  // Engagement tracking
  const [engaged, setEngaged] = useState(false)
  const [showDropPrompt, setShowDropPrompt] = useState(false)
  // Market selection
  const [market, setMarket] = useState(() => localStorage.getItem('selectedMarket') || '')
  const [showMarketModal, setShowMarketModal] = useState(!market)

  useEffect(() => {
    if (!market) setShowMarketModal(true)
    const params = new URLSearchParams(window.location.search)
    if (params.get('admin') === '1' || localStorage.getItem('adminMode') === 'true') {
      setAdminMode(true)
      ensureAsanaAuth(); // Auto-connect Asana for admin
    }
    // Run birthday wishes on app load and then daily
    const runBirthdayWishes = async () => {
      try {
        await sendBirthdayWishesToClients();
      } catch (e) { console.error('Birthday wishes failed', e); }
    }
    runBirthdayWishes();
    const bdayInterval = setInterval(runBirthdayWishes, 1000 * 60 * 60 * 24);

    // Schedule no-contact notification on visit
    const clientDetails = {
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      time: new Date().toISOString(),
      sessionId: (Math.random() + 1).toString(36).substring(2),
    };
    scheduleNoContactNotification(clientDetails);

    // Drop detection: beforeunload if not engaged
    const handleBeforeUnload = (e) => {
      if (!engaged) {
        setShowDropPrompt(true)
        recordEvent('client_drop', {
          reason: 'beforeunload',
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          time: new Date().toISOString(),
        })
        // e.preventDefault();
        // e.returnValue = '';
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Inactivity timer (5 min)
    let inactivityTimeout = setTimeout(() => {
      if (!engaged) {
        setShowDropPrompt(true)
        recordEvent('client_drop', {
          reason: 'inactivity',
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          time: new Date().toISOString(),
        })
      }
    }, 5 * 60 * 1000)
    const resetInactivity = () => {
      clearTimeout(inactivityTimeout)
      inactivityTimeout = setTimeout(() => {
        if (!engaged) {
          setShowDropPrompt(true)
          recordEvent('client_drop', {
            reason: 'inactivity',
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            time: new Date().toISOString(),
          })
        }
      }, 5 * 60 * 1000)
    }
    window.addEventListener('mousemove', resetInactivity)
    window.addEventListener('keydown', resetInactivity)

    return () => {
      clearInterval(bdayInterval);
      cancelNoContactNotification();
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('mousemove', resetInactivity)
      window.removeEventListener('keydown', resetInactivity)
      clearTimeout(inactivityTimeout)
    }
  }, [engaged])

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
        
        // Engagement handlers: pass setEngaged to children as needed
        const handleEngagement = () => setEngaged(true)

        // Market selection handler
        const handleMarketSelect = (selected) => {
          setMarket(selected)
          localStorage.setItem('selectedMarket', selected)
          setShowMarketModal(false)
          // Optionally: trigger agent assignment logic here
        }

        return (
          <ProjectProvider>
            <div className="min-h-screen bg-gray-900">
              <MarketSelectionModal open={showMarketModal} onSelect={handleMarketSelect} defaultCountry={market} />
              <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onEngage={handleEngagement} />
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
                <div onClick={handleEngagement}>
                  <HeroSection />
                  <FilterPanel filters={filters} setFilters={setFilters} />
                  <ProjectShowcase 
                    filters={filters}
                    selectedProjects={selectedProjects}
                    setSelectedProjects={setSelectedProjects}
                    onEngage={handleEngagement}
                    market={market}
                  />
                </div>
              )}

              {activeTab === 'compare' && (
                <PropertyComparison selectedProjects={selectedProjects} onEngage={handleEngagement} market={market} />
              )}

              {activeTab === 'ai' && (
                <AIContentGenerator onEngage={handleEngagement} market={market} />
              )}

              {adminMode && activeTab === 'export' && (
                <GoogleSheetIntegration selectedProjects={selectedProjects} onEngage={handleEngagement} market={market} />
              )}

              {adminMode && activeTab === 'leads' && (
                <LeadsDashboard onEngage={handleEngagement} market={market} />
              )}
              {adminMode && activeTab === 'analytics' && (
                <AnalyticsDashboard onEngage={handleEngagement} market={market} />
              )}
              {adminMode && activeTab === 'partners' && (
                <PartnersDashboard onEngage={handleEngagement} market={market} />
              )}

              {adminMode && activeTab === 'social' && (
                <SocialIntegration onEngage={handleEngagement} market={market} />
              )}

              {adminMode && activeTab === 'feedback' && (
                <AdminFeedbackDashboard onEngage={handleEngagement} market={market} />
              )}
              {/* About Section always visible at bottom */}
              <AboutSection />
              {/* AI Chatbot always available for feedback/objection handling */}
              <AIChatbot showDropPrompt={showDropPrompt} onEngage={handleEngagement} market={market} />

              {adminMode && activeTab === 'country-performance' && (
                <CountryPerformanceDashboard onEngage={handleEngagement} market={market} />
              )}
            </div>
          </ProjectProvider>
        )
