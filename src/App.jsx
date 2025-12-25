import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import FilterPanel from './components/FilterPanel'
import ProjectShowcase from './components/ProjectShowcase'
import PropertyComparison from './components/PropertyComparison'
import AIContentGenerator from './components/AIContentGenerator'
import GoogleSheetIntegration from './components/GoogleSheetIntegration'
import LeadsDashboard from './components/LeadsDashboard'
import SocialIntegration from './components/SocialIntegration'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import PartnersDashboard from './components/PartnersDashboard'
import { shouldRefreshNow, performRefresh, getRefreshConfig, saveRefreshConfig } from './services/refreshService'
import { ProjectProvider } from './context/ProjectContext'

function App() {
  const [activeTab, setActiveTab] = useState('discover') // discover, compare, ai, export, leads
  const [selectedProjects, setSelectedProjects] = useState([])
  const [filters, setFilters] = useState({
    budget: { min: 0, max: 5000000 },
    area: [],
    propertyType: [],
    developer: [],
    bedrooms: [],
    amenities: [],
  })

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

        {activeTab === 'export' && (
          <GoogleSheetIntegration selectedProjects={selectedProjects} />
        )}

        {activeTab === 'leads' && (
          <LeadsDashboard />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}
        {activeTab === 'partners' && (
          <PartnersDashboard />
        )}
        {activeTab === 'social' && (
          <SocialIntegration />
        )}
      </div>
    </ProjectProvider>
  )
}

export default App
