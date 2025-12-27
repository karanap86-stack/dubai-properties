// marketingDataService.js
// Stubs for fetching best-selling projects and market insights by region

import { getAllDevelopers } from './developerService'
import propertyTypesByRegion from '../data/propertyTypesByRegion.json';

  // Returns: { [propertyType]: { [area]: bestProject } }
  const devs = getAllDevelopers().filter(d => d.region === region || (d.states && d.states.includes(region)));
  if (!devs.length) return {};

  // Find region group (uae, india, etc.)
  let regionGroup = 'uae';
  if (region.toLowerCase().includes('india')) regionGroup = 'india';
  // Add more as needed

  const categories = propertyTypesByRegion[regionGroup]?.categories || {};
  const allTypes = Object.values(categories).flat();

  // Collect all areas from projects
  const allProjects = devs.flatMap(d => d.projects || []);
  const areas = [...new Set(allProjects.map(p => p.location || p.region || 'Unknown'))];

  // For each property type and area, find best-selling project (by units or first)
  const result = {};
  allTypes.forEach(type => {
    result[type.value] = {};
    areas.forEach(area => {
      const candidates = allProjects.filter(p =>
        (p.type === type.value || (p.type === undefined && type.value === 'apartment')) &&
        (p.location === area || p.region === area)
      );
      if (candidates.length) {
        // Pick project with most units, fallback to first
        const best = candidates.reduce((best, curr) => (curr.units > (best?.units || 0) ? curr : best), candidates[0]);
        result[type.value][area] = best;
      }
    });
  });
  return result;
}

export function getMarketInsightsByRegion(region) {
  // TODO: Replace with real analytics/market data
  return {
    whatsNew: 'New luxury tower launched',
    upcoming: 'Upcoming smart city project',
    performance: 'Market up 8% YoY',
    future: 'Strong demand expected in 2026'
  }
}
