import React from 'react'
import { Search, Sparkles } from 'lucide-react'
import propertyTypesByRegion from '../data/propertyTypesByRegion.json';

  const [searchInput, setSearchInput] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);

  // Get user region from localStorage (set by onboarding modal)
  let userPrefs = null;
  try {
    userPrefs = JSON.parse(localStorage.getItem('userPrefs'));
  } catch (e) { userPrefs = null; }
  const region = userPrefs?.region || 'dubai';
  const regionGroup = (() => {
    if (region === 'dubai' || region === 'abu_dhabi') return 'uae';
    if (region === 'india') return 'india';
    // Add more as you expand
    return 'uae';
  })();
  const propertyTypes = Object.entries(propertyTypesByRegion[regionGroup].categories)
    .flatMap(([cat, arr]) => arr.map(opt => ({ ...opt, group: cat })))
    .map(opt => ({ ...opt, label: `${opt.label} (${opt.group.charAt(0).toUpperCase() + opt.group.slice(1)})` }));

  // Suggest property types as user types
  React.useEffect(() => {
    if (!searchInput) {
      setSuggestions([]);
      return;
    }
    const lower = searchInput.toLowerCase();
    setSuggestions(
      propertyTypes.filter(pt => pt.label.toLowerCase().includes(lower)).slice(0, 5)
    );
  }, [searchInput]);

  return (
    <div className="pt-32 pb-16 px-4 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto text-center">
        {/* Custom Gateway Heading */}
        <div className="mb-8">
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-[#0a2e6d] to-[#00e676] border border-blue-400 rounded-full shadow-md">
            <span className="text-[#0a2e6d] text-xs sm:text-sm font-semibold flex items-center gap-2">
              <Sparkles size={14} />
              The Next Era of Real Estate: Intelligent, Instant, Infinite.
            </span>
          </div>

          {/* Gateway Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold italic text-[#00e676] mb-4 tracking-tight gradient-text" style={{fontFamily: 'Playfair Display, serif', fontWeight: 900, fontStyle: 'italic'}}>
            <span className="font-extrabold italic" style={{fontWeight: 900, fontStyle: 'italic'}}>
              Welcome to EstatelyticAI
            </span>
          </h2>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0a2e6d] mb-6 leading-tight tracking-tight" style={{fontFamily: 'Playfair Display, serif'}}>
            Real Estate. Reinvented.
            <span className="block bg-gradient-to-r from-[#00e676] via-[#0a2e6d] to-[#00bcd4] bg-clip-text text-transparent">
              Intelligent. Instant. Infinite.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[#0a2e6d] max-w-3xl mx-auto mb-10 font-semibold" style={{fontFamily: 'Cormorant Garamond, Playfair Display, serif'}}>
            Discover, analyze, and act on real estate opportunities with AI-powered insights, instant analytics, and infinite possibilities. <span className="font-bold text-[#00e676]">Made in <span className="font-extrabold">INDIA</span></span> 🇮🇳
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
                placeholder={`Search by area, developer, or property type... (e.g. ${propertyTypes[0]?.label || 'Apartment'})`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 py-4 px-3 text-lg"
                style={{ fontSize: '1.15rem' }}
                autoComplete="off"
              />
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full bg-slate-900 border border-cyan-600/20 rounded-b-xl z-10 text-left">
                  {suggestions.map((s, i) => (
                    <div
                      key={s.value}
                      className="px-4 py-2 cursor-pointer hover:bg-cyan-700/20 text-white"
                      onClick={() => setSearchInput(s.label)}
                    >
                      {s.label}
                    </div>
                  ))}
                </div>
              )}
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
