import React, { useState } from 'react'

const COUNTRIES = [
  { code: 'UAE', name: 'United Arab Emirates' },
  { code: 'India', name: 'India' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'USA', name: 'United States' },
  { code: 'Other', name: 'Other' }
]

export default function MarketSelectionModal({ open, onSelect, defaultCountry }) {
  const [selected, setSelected] = useState(defaultCountry || '')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Select Your Market</h2>
        <p className="mb-6 text-gray-600">Please choose your country or market to personalize your experience.</p>
        <div className="space-y-3 mb-6">
          {COUNTRIES.map(c => (
            <button
              key={c.code}
              className={`w-full px-4 py-3 rounded-lg border text-left font-semibold transition-all ${selected === c.code ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-gray-900 border-gray-300 hover:bg-cyan-50'}`}
              onClick={() => setSelected(c.code)}
            >
              {c.name}
            </button>
          ))}
        </div>
        <button
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold text-lg disabled:opacity-50"
          disabled={!selected}
          onClick={() => onSelect(selected)}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
