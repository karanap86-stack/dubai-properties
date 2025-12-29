// livePropertyService.js
// Mock service for live property data (ready for real API integration)

const mockProperties = [
  {
    id: 'prop1',
    name: 'Downtown Luxury Tower',
    location: 'Downtown Dubai',
    price: 2500000,
    status: 'available',
    updatedAt: new Date().toISOString(),
    image: 'https://via.placeholder.com/300x200?text=Downtown+Luxury',
  },
  {
    id: 'prop2',
    name: 'Palm Beach Villa',
    location: 'Palm Jumeirah',
    price: 8000000,
    status: 'sold',
    updatedAt: new Date().toISOString(),
    image: 'https://via.placeholder.com/300x200?text=Palm+Beach+Villa',
  },
  {
    id: 'prop3',
    name: 'Marina Heights',
    location: 'Dubai Marina',
    price: 3500000,
    status: 'available',
    updatedAt: new Date().toISOString(),
    image: 'https://via.placeholder.com/300x200?text=Marina+Heights',
  },
];

const livePropertyService = {
  async fetchProperties() {
    // Simulate API delay
    await new Promise(res => setTimeout(res, 500));
    return mockProperties;
  },
  // Placeholder for real API integration
  async fetchFromAPI(apiUrl, params) {
    // TODO: Implement real API call
    return [];
  },
};

export default livePropertyService;
