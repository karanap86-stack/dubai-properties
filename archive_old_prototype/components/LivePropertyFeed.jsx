// LivePropertyFeed.jsx
// UI component to display live property data (mocked, ready for real API)
import React, { useEffect, useState } from 'react';
import livePropertyService from '../services/livePropertyService';

export default function LivePropertyFeed() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const props = await livePropertyService.fetchProperties();
      setProperties(props);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="pt-24 px-6">Loading live property data...</div>;

  return (
    <div className="pt-24 px-6">
      <h2 className="text-2xl font-bold text-white mb-4">Live Property Feed (Mock)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {properties.map(p => (
          <div key={p.id} className="bg-slate-800 rounded p-4 flex flex-col items-center">
            <img src={p.image} alt={p.name} className="mb-2 rounded w-full h-40 object-cover" />
            <div className="text-lg font-semibold text-white mb-1">{p.name}</div>
            <div className="text-gray-300 mb-1">{p.location}</div>
            <div className="text-cyan-400 font-bold mb-1">AED {p.price.toLocaleString()}</div>
            <div className={p.status === 'available' ? 'text-green-400' : 'text-red-400'}>
              {p.status === 'available' ? 'Available' : 'Sold'}
            </div>
            <div className="text-xs text-gray-500 mt-2">Last updated: {new Date(p.updatedAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
