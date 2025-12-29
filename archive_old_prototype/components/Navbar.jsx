import React from 'react'
import AdminLogin from './AdminLogin'
import { Menu, Home, Zap, MessageSquare, Download, Users, Settings, BarChart2 } from 'lucide-react'


export default function Navbar({ activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [adminMode, setAdminMode] = React.useState(false)
  const [showAdminLogin, setShowAdminLogin] = React.useState(false)

  React.useEffect(() => {
    // Enable admin mode if ?admin=1 in URL or localStorage.adminMode === 'true'
    const params = new URLSearchParams(window.location.search)
    if (localStorage.getItem('adminMode') === 'true') {
      setAdminMode(true)
    } else if (params.get('admin') === '1') {
      setShowAdminLogin(true)
    }
  }, [])

  const navItems = [
    { id: 'discover', icon: Home, label: 'Discover' },
    { id: 'compare', icon: Zap, label: 'Compare' },
    { id: 'ai', icon: MessageSquare, label: 'AI Agent' },
    ...(adminMode ? [
      { id: 'export', icon: Download, label: 'Export' },
      { id: 'leads', icon: Users, label: 'Leads' },
      { id: 'analytics', icon: BarChart2, label: 'Analytics' },
      { id: 'partners', icon: BarChart2, label: 'Partners' },
      { id: 'social', icon: Settings, label: 'Social' },
      { id: 'feedback', icon: MessageSquare, label: 'Feedback' },
      { id: 'country-performance', icon: BarChart2, label: 'Country Performance' }
    ] : [])
  ]

  return (
    <nav className="sticky top-0 left-0 right-0 bg-slate-950 border-b border-cyan-600/30 backdrop-blur-lg z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={require('../assets/estatelyticai_logo.png')} alt="EstatelyticAI Logo" className="w-14 h-14 rounded-full shadow-lg border-2 border-blue-400 bg-white object-contain" style={{background: 'linear-gradient(135deg, #0a2e6d 0%, #00e676 100%)'}} />
            <div className="ml-2">
              <h1 className="text-2xl font-extrabold text-[#0a2e6d] hidden sm:block tracking-wide" style={{letterSpacing: '0.03em'}}>Estatelytic<span className="text-green-500">AI</span></h1>
              <p className="text-sm font-medium hidden sm:block" style={{color: '#0a2e6d'}}>The Next Era of Real Estate: Intelligent, Instant, Infinite.</p>
              <span className="text-xs font-semibold flex items-center gap-1 mt-1 hidden sm:block"><span role="img" aria-label="India flag">🇮🇳</span> <span className="text-[#0a2e6d]">Made in <span className="font-bold">INDIA</span></span></span>
            </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex gap-2">
                      {navItems.map(({ id, icon: Icon, label }) => (
                        <button
                          key={id}
                          onClick={() => setActiveTab(id)}
                          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                            activeTab === id
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                              : 'text-gray-300 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          <Icon size={18} />
                          <span className="text-base font-semibold">{label}</span>
                        </button>
                      ))}
                    </div>
                    {/* Mobile Nav Toggle */}
                    <button
                      className="md:hidden p-3 rounded-lg text-cyan-400 hover:bg-slate-800"
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                      <Menu size={24} />
                    </button>
                  </div>
                  {/* Mobile Nav */}
                  {mobileMenuOpen && (
                    <div className="md:hidden flex flex-col gap-2 py-4">
                      {navItems.map(({ id, icon: Icon, label }) => (
                        <button
                          key={id}
                          onClick={() => { setActiveTab(id); setMobileMenuOpen(false) }}
                          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                            activeTab === id
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                              : 'text-gray-300 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          <Icon size={18} />
                          <span className="text-base font-semibold">{label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </nav>
            )
