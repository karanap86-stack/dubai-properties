// marketingDataService.js
// Stubs for fetching best-selling projects and market insights by region

import { getAllDevelopers } from './developerService'

export function getBestSellingProjectByRegion(region) {
  // TODO: Replace with real sales/analytics data
  // For now, pick the first project from the first developer in the region
  const devs = getAllDevelopers().filter(d => d.region === region || (d.states && d.states.includes(region)))
  if (devs.length && devs[0].projects && devs[0].projects.length) {
    return devs[0].projects[0]
  }
  return null
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
