// UserOnboardingModal.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';


import propertyTypesByRegion from '../data/propertyTypesByRegion.json';

// Only show UAE and India for now, but structure is ready for future expansion
const regionOptions = [
  { value: 'dubai', label: 'Dubai', group: 'uae' },
  { value: 'abu_dhabi', label: 'Abu Dhabi', group: 'uae' },
  { value: 'india', label: 'India', group: 'india' }
  // Add more as you open new markets
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
  // Add more as needed
];


export default function UserOnboardingModal({ onComplete }) {
  const { i18n, t } = useTranslation();
  const [region, setRegion] = useState('dubai');
  const [propertyType, setPropertyType] = useState('');
  const [language, setLanguage] = useState('en');
  const [step, setStep] = useState(1);

  // Get group for selected region
  const regionGroup = regionOptions.find(r => r.value === region)?.group || 'uae';
  const propertyTypeOptions = Object.entries(propertyTypesByRegion[regionGroup].categories)
    .flatMap(([cat, arr]) => arr.map(opt => ({ ...opt, group: cat })))
    .map(opt => ({ ...opt, label: `${opt.label} (${opt.group.charAt(0).toUpperCase() + opt.group.slice(1)})` }));

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleFinish = () => {
    i18n.changeLanguage(language);
    if (onComplete) onComplete({ region, propertyType, language });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-cyan-700">Personalize Your Experience</h2>
        {step === 1 && (
          <div>
            <label className="block mb-2 font-semibold">Select Region</label>
            <select className="w-full p-2 mb-4 border rounded" value={region} onChange={e => { setRegion(e.target.value); setPropertyType(''); }}>
              {regionOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <button className="px-4 py-2 bg-cyan-600 text-white rounded" onClick={handleNext} disabled={!region}>Next</button>
          </div>
        )}
        {step === 2 && (
          <div>
            <label className="block mb-2 font-semibold">Select Property Type</label>
            <select className="w-full p-2 mb-4 border rounded" value={propertyType} onChange={e => setPropertyType(e.target.value)}>
              <option value="" disabled>Select...</option>
              {propertyTypeOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <div className="flex justify-between">
              <button className="px-4 py-2 bg-gray-400 text-white rounded" onClick={handleBack}>Back</button>
              <button className="px-4 py-2 bg-cyan-600 text-white rounded" onClick={handleNext} disabled={!propertyType}>Next</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <label className="block mb-2 font-semibold">Select Language</label>
            <select className="w-full p-2 mb-4 border rounded" value={language} onChange={e => setLanguage(e.target.value)}>
              {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <div className="flex justify-between">
              <button className="px-4 py-2 bg-gray-400 text-white rounded" onClick={handleBack}>Back</button>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded" onClick={handleFinish}>Start Exploring</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
