import React from 'react'
import { Search, Sparkles } from 'lucide-react'

export default function HeroSection() {
  const [searchInput, setSearchInput] = React.useState('')

  return (
    <div className="pt-32 pb-16 px-4 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto text-center">
        {/* Custom Gateway Heading */}
        <div className="mb-8">
          <div className="inline-block mb-4 px-4 py-2 bg-cyan-600/20 border border-cyan-500/50 rounded-full">
            <span className="text-cyan-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <Sparkles size={14} />
              AI-Powered Real Estate Discovery
            </span>
          </div>

          {/* Gateway Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold italic text-pink-400 mb-4 tracking-tight gradient-text" style={{fontFamily: 'Playfair Display, serif', fontWeight: 900, fontStyle: 'italic'}}>
            <span className="font-extrabold italic" style={{fontWeight: 900, fontStyle: 'italic'}}>
              Your gateway to the home that's just Perfect
            </span>
          </h2>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight" style={{fontFamily: 'Playfair Display, serif'}}>
            Find Your Perfect Property in
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dubai & Abu Dhabi
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10" style={{fontFamily: 'Cormorant Garamond, Playfair Display, serif'}}>
            Explore premium properties, analyze ROI, compare investments, and get AI-powered recommendations tailored to your budget and preferences.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-14">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-slate-800 rounded-2xl p-2 flex items-center gap-3 shadow-lg">
              <Search className="text-cyan-400 ml-4" size={20} />
              <input
                type="text"
                placeholder="Search by area, developer, or property type..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 py-4 px-3 text-lg"
                style={{ fontSize: '1.15rem' }}
              />
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all text-lg">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { label: 'Total Projects', value: '500+' },
            { label: 'Properties', value: '15,000+' },
            { label: 'Average ROI', value: '8-15%' },
            { label: 'Avg Appreciation', value: '10-15%/yr' }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/50 border border-cyan-600/20 rounded-lg p-4 backdrop-blur">
              <p className="text-cyan-400 text-base font-semibold">{stat.label}</p>
              <p className="text-white text-3xl font-extrabold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
