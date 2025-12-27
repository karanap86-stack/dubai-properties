// fxService.js - Foreign exchange rate service integration
// Example uses Open Exchange Rates (https://openexchangerates.org/) but can be swapped for any FX API
const axios = require('axios');

const FX_API_URL = 'https://openexchangerates.org/api/latest.json';
const FX_APP_ID = process.env.FX_APP_ID; // Store your API key in environment variables
const BASE_CURRENCY = 'USD';


// Simple in-memory cache for rates (10 min)
let cachedRates = null;
let lastFetch = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

async function getFxRate(fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return 1;
  const now = Date.now();
  if (!cachedRates || now - lastFetch > CACHE_DURATION) {
    const { data } = await axios.get(FX_API_URL, {
      params: { app_id: FX_APP_ID, base: BASE_CURRENCY }
    });
    cachedRates = data.rates;
    lastFetch = now;
  }
  const rates = cachedRates;
  if (!rates[fromCurrency] || !rates[toCurrency]) throw new Error('Currency not supported');
  // Convert fromCurrency to base, then to toCurrency
  const rate = rates[toCurrency] / rates[fromCurrency];
  return rate;
}

module.exports = { getFxRate, BASE_CURRENCY };
