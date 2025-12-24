import React from 'react'
import { Menu, Home, Zap, MessageSquare, Download, Users, Settings, BarChart2 } from 'lucide-react'

export default function Navbar({ activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const navItems = [
    { id: 'discover', icon: Home, label: 'Discover' },
    { id: 'compare', icon: Zap, label: 'Compare' },
    { id: 'ai', icon: MessageSquare, label: 'AI Agent' },
    { id: 'export', icon: Download, label: 'Export' },
    { id: 'leads', icon: Users, label: 'Leads' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'partners', icon: BarChart2, label: 'Partners' },
    { id: 'social', icon: Settings, label: 'Social' }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-950 border-b border-cyan-600/30 backdrop-blur-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">DP</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white hidden sm:block">Dubai Properties</h1>
              <p className="text-xs text-cyan-400 hidden sm:block">AI-Powered Real Estate</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-1">
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
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-cyan-400 hover:text-cyan-300"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-700">
            {navItems.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full px-4 py-2 flex items-center gap-2 transition-all text-left ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
