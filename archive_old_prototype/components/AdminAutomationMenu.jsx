import React, { useState, useEffect, useRef } from 'react';
// Utility to get validation errors from window (set by developerService.js)
function useDevDataErrors() {
  const [errors, setErrors] = useState([]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setErrors(window.__DEV_DATA_ERRORS__ || []);
      const interval = setInterval(() => {
        setErrors(window.__DEV_DATA_ERRORS__ || []);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);
  return errors;
}
  const devDataErrors = useDevDataErrors();
      {devDataErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-semibold mb-2">Developer Data Validation Errors</h3>
          <ul className="list-disc ml-6 text-sm">
            {devDataErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
          <div className="text-xs mt-2">Please fix these errors in your data files or via admin onboarding.</div>
        </div>
      )}
// Simple bar chart for dashboard analytics
function BarChart({ label, value, max, color }) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded h-3">
        <div
          className={color + " h-3 rounded"}
          style={{ width: percent + '%' }}
        ></div>
      </div>
    </div>
  );
}
import { getAllDevelopers, getProjectsByDeveloper } from '../services/developerService';
import { getAllProviders } from '../services/serviceProviderService';
import propertyTypesByRegion from '../data/propertyTypesByRegion.json';

  const [developers] = useState(getAllDevelopers());
  const [providers] = useState(getAllProviders());

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


  // Analytics: counts
  const devCount = developers.length;
  const projectCount = developers.reduce((acc, d) => acc + (d.projects ? d.projects.length : 0), 0);
  const providerCount = providers.length;
  const revenue = Number(localStorage.getItem('REVENUE_TOTAL') || 0);
  const pipeline = Number(localStorage.getItem('PIPELINE_COUNT') || 0);
  const maxValue = Math.max(revenue, pipeline, devCount, projectCount, providerCount, 1);

  return (
    <div className="p-6 bg-white rounded shadow max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Automation Reporting & Monitoring</h2>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Key Metrics</h3>
        <BarChart label="Revenue" value={revenue} max={maxValue} color="bg-green-500" />
        <BarChart label="Pipeline" value={pipeline} max={maxValue} color="bg-blue-500" />
        <BarChart label="Developers" value={devCount} max={maxValue} color="bg-purple-500" />
        <BarChart label="Projects" value={projectCount} max={maxValue} color="bg-yellow-500" />
        <BarChart label="Providers" value={providerCount} max={maxValue} color="bg-pink-500" />
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Developers Overview</h3>
        <ul className="list-disc ml-6">
          {developers.map(dev => (
            <li key={dev.id}>
              {dev.name} ({dev.region || 'N/A'})
              <ul className="list-circle ml-4 text-sm text-gray-700">
                {dev.projects && dev.projects.length > 0 ? dev.projects.map(proj => {
                  // Show property type label if available
                  const typeLabel = propertyTypes.find(pt => pt.value === proj.type)?.label || proj.type || 'N/A';
                  return (
                    <li key={proj.id}>
                      {proj.name} ({proj.region})
                      <span className="ml-2 text-xs text-cyan-700">{typeLabel}</span>
                    </li>
                  );
                }) : <li>No projects</li>}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">3rd-Party Service Providers</h3>
        <ul className="list-disc ml-6">
          {providers.map(p => (
            <li key={p.id}>{p.name} ({p.serviceType})</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
