import React from 'react'
import { Search, Sparkles } from 'lucide-react'

export default function HeroSection() {
  const [searchInput, setSearchInput] = React.useState('')

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        {/* Main Headline */}
        <div className="mb-8">
          <div className="inline-block mb-4 px-4 py-2 bg-cyan-600/20 border border-cyan-500/50 rounded-full">
            <span className="text-cyan-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <Sparkles size={14} />
              AI-Powered Real Estate Discovery
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Find Your Perfect Property in
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dubai & Abu Dhabi
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Explore premium properties, analyze ROI, compare investments, and get AI-powered recommendations tailored to your budget and preferences.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-slate-800 rounded-xl p-1 flex items-center gap-2">
              <Search className="text-cyan-400 ml-4" size={20} />
              <input
                type="text"
                placeholder="Search by area, developer, or property type..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 py-3 px-2"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: 'Total Projects', value: '500+' },
            { label: 'Properties', value: '15,000+' },
            { label: 'Average ROI', value: '8-15%' },
            { label: 'Avg Appreciation', value: '10-15%/yr' }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/50 border border-cyan-600/20 rounded-lg p-4 backdrop-blur">
              <p className="text-cyan-400 text-sm font-medium">{stat.label}</p>
              <p className="text-white text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
