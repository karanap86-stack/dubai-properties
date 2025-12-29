// Mock project data for Dubai and Abu Dhabi
export const COMMERCIAL_PROJECTS = [
  {
    id: 101,
    name: "Downtown Business Center",
    developer: "Emaar Properties",
    location: "Downtown Dubai",
    price: 3500000,
    type: "Office Space",
    sqft: 3000,
    imageUrl: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=500&h=400&fit=crop",
    roi: 7.8,
    appreciation: 10.1,
    amenities: ["Parking", "Conference Rooms", "Cafeteria", "Security"],
    description: "Premium office space in the heart of Dubai's business district.",
    completionDate: "2024-Q2",
    units: 200,
    avgPrice: "3.5M - 7M AED"
  },
  {
    id: 102,
    name: "Marina Retail Plaza",
    developer: "Damac Properties",
    location: "Dubai Marina",
    price: 2200000,
    type: "Retail Space",
    sqft: 1800,
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&h=400&fit=crop",
    roi: 8.2,
    appreciation: 11.4,
    amenities: ["Mall Access", "Parking", "Security"],
    description: "Retail units in a high-footfall marina location.",
    completionDate: "2023-Q4",
    units: 120,
    avgPrice: "2.2M - 4M AED"
  },
  {
    id: 103,
    name: "Industrial Logistics Park",
    developer: "Nakheel",
    location: "Jebel Ali",
    price: 12000000,
    type: "Industrial Land",
    sqft: 20000,
    imageUrl: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=500&h=400&fit=crop",
    roi: 9.5,
    appreciation: 12.7,
    amenities: ["Truck Access", "Warehouse Ready", "Security"],
    description: "Large-scale industrial land for logistics and warehousing.",
    completionDate: "2025-Q1",
    units: 10,
    avgPrice: "12M - 25M AED"
  },
  {
    id: 104,
    name: "Business Bay Commercial Tower",
    developer: "Aldar Properties",
    location: "Business Bay",
    price: 5000000,
    type: "Commercial Project",
    sqft: 5000,
    imageUrl: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=500&h=400&fit=crop",
    roi: 8.9,
    appreciation: 13.2,
    amenities: ["Offices", "Retail", "Parking", "Security"],
    description: "Mixed-use commercial tower with office and retail spaces.",
    completionDate: "2024-Q4",
    units: 300,
    avgPrice: "5M - 10M AED"
  }
];

export const DUBAI_PROJECTS = [
  // --- Add more property types as needed: hospitality, co-working, land parcels, etc. ---
  {
    id: 1,
    name: "Emaar Downtown",
    developer: "Emaar Properties",
    location: "Downtown Dubai",
    price: 1200000,
    bedrooms: 2,
    sqft: 1200,
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=400&fit=crop",
    roi: 8.5,
    appreciation: 12.3,
    amenities: ["Pool", "Gym", "Parking", "Security", "Concierge"],
    description: "Luxury apartments in the heart of Downtown Dubai",
    completionDate: "2023-Q4",
    units: 1200,
    avgPrice: "1.2M - 3M AED"
  },
  {
    id: 2,
    name: "The Pinnacle Tower",
    developer: "Damac Properties",
    location: "Dubai Marina",
    price: 950000,
    bedrooms: 1,
    sqft: 850,
    imageUrl: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=500&h=400&fit=crop",
    roi: 7.2,
    appreciation: 9.8,
    amenities: ["Gym", "Marina View", "Parking", "24/7 Security"],
    description: "Modern luxury residence with marina views",
    completionDate: "2024-Q2",
    units: 850,
    avgPrice: "950K - 2.5M AED"
  },
  {
    id: 3,
    name: "Palm Jumeirah Villas",
    developer: "Nakheel",
    location: "Palm Jumeirah",
    price: 4500000,
    bedrooms: 5,
    sqft: 5000,
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=400&fit=crop",
    roi: 6.5,
    appreciation: 14.2,
    amenities: ["Private Beach", "Pool", "Gym", "Security", "Waterfront"],
    description: "Exclusive waterfront villa with private beach access",
    completionDate: "2023-Q3",
    units: 500,
    avgPrice: "4.5M - 8M AED"
  },
  {
    id: 4,
    name: "JBR Beach Residence",
    developer: "Damac Properties",
    location: "Jumeirah Beach Residence",
    price: 850000,
    bedrooms: 1,
    sqft: 750,
    imageUrl: "https://images.unsplash.com/photo-1494145904049-0dca7b0589b0?w=500&h=400&fit=crop",
    roi: 6.8,
    appreciation: 10.5,
    amenities: ["Beach Access", "Pool", "Gym", "Restaurants"],
    description: "Beachfront apartment with premium amenities",
    completionDate: "2023-Q1",
    units: 2000,
    avgPrice: "800K - 1.5M AED"
  },
  {
    id: 5,
    name: "Arabian Ranches",
    developer: "Emaar Properties",
    location: "Arabian Ranches",
    price: 2800000,
    bedrooms: 4,
    sqft: 4200,
    imageUrl: "https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=500&h=400&fit=crop",
    roi: 9.2,
    appreciation: 13.7,
    amenities: ["Golf Course", "Community Center", "Park", "Security"],
    description: "Spacious villa in exclusive community with golf course",
    completionDate: "2024-Q1",
    units: 3000,
    avgPrice: "2.8M - 5M AED"
  },
  {
    id: 6,
    name: "Business Bay Central",
    developer: "Aldar Properties",
    location: "Business Bay",
    price: 1100000,
    bedrooms: 2,
    sqft: 1150,
    imageUrl: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=500&h=400&fit=crop",
    roi: 7.9,
    appreciation: 11.2,
    amenities: ["Gym", "Coworking", "Parking", "Concierge"],
    description: "Modern office apartments in business district",
    completionDate: "2024-Q3",
    units: 1500,
    avgPrice: "1.1M - 2.2M AED"
  }
]

export const ABU_DHABI_PROJECTS = [
  {
    id: 7,
    name: "Saadiyat Island Residences",
    developer: "Aldar Properties",
    location: "Saadiyat Island",
    price: 1800000,
    bedrooms: 3,
    sqft: 2000,
    imageUrl: "https://images.unsplash.com/photo-1512818776299-30ba67c3fa45?w=500&h=400&fit=crop",
    roi: 8.1,
    appreciation: 15.5,
    amenities: ["Beach", "Museum", "Mall", "Park", "Golf"],
    description: "Premium residences in cultural and leisure destination",
    completionDate: "2024-Q2",
    units: 1200,
    avgPrice: "1.8M - 4M AED"
  },
  {
    id: 8,
    name: "The Ritz-Carlton Residences",
    developer: "Hilton Hotels",
    location: "Saadiyat Island",
    price: 3200000,
    bedrooms: 3,
    sqft: 2500,
    imageUrl: "https://images.unsplash.com/photo-1551632786-9d42e5b1b1a7?w=500&h=400&fit=crop",
    roi: 7.5,
    appreciation: 13.2,
    amenities: ["Hotel Services", "Spa", "Fine Dining", "Beach", "Concierge"],
    description: "Luxury residences with 5-star hotel amenities",
    completionDate: "2023-Q4",
    units: 600,
    avgPrice: "3.2M - 6M AED"
  },
  {
    id: 9,
    name: "Al Reef Downtown",
    developer: "Aldar Properties",
    location: "Al Reef",
    price: 950000,
    bedrooms: 2,
    sqft: 1100,
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc4cde38b810?w=500&h=400&fit=crop",
    roi: 8.4,
    appreciation: 11.9,
    amenities: ["Mall", "Gym", "Restaurants", "Parking"],
    description: "Vibrant community with shopping and dining",
    completionDate: "2024-Q1",
    units: 2500,
    avgPrice: "950K - 1.8M AED"
  },
  {
    id: 10,
    name: "Yas Waterfront",
    developer: "Aldar Properties",
    location: "Yas Island",
    price: 1350000,
    bedrooms: 2,
    sqft: 1250,
    imageUrl: "https://images.unsplash.com/photo-1505873242777-f033b278f72e?w=500&h=400&fit=crop",
    roi: 8.6,
    appreciation: 12.8,
    amenities: ["Marina", "F1 Track", "Entertainment", "Waterfront"],
    description: "Modern living on entertainment island with marina views",
    completionDate: "2024-Q2",
    units: 1800,
    avgPrice: "1.35M - 3.2M AED"
  },
  {
    id: 11,
    name: "Shams Abu Dhabi",
    developer: "Omniyat",
    location: "Al Marjan Island",
    price: 2200000,
    bedrooms: 3,
    sqft: 1800,
    imageUrl: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=500&h=400&fit=crop",
    roi: 7.8,
    appreciation: 14.5,
    amenities: ["Beach", "Park", "Marina", "Luxury Dining"],
    description: "Ultra-luxury waterfront development",
    completionDate: "2025-Q1",
    units: 900,
    avgPrice: "2.2M - 4.5M AED"
  },
  {
    id: 12,
    name: "Khalifa City Apartments",
    developer: "Aldar Properties",
    location: "Khalifa City",
    price: 650000,
    bedrooms: 1,
    sqft: 700,
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop",
    roi: 9.1,
    appreciation: 10.2,
    amenities: ["School", "Hospital", "Shopping", "Park"],
    description: "Affordable family-friendly residential community",
    completionDate: "2024-Q3",
    units: 5000,
    avgPrice: "650K - 1.2M AED"
  }
]

export const getAllProjects = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        ...DUBAI_PROJECTS,
        ...ABU_DHABI_PROJECTS,
        ...COMMERCIAL_PROJECTS
      ])
    }, 500)
  })
}

export const getProjectsByFilter = async (filters) => {
  const allProjects = await getAllProjects()
  
  return allProjects.filter(project => {
    const priceMatch = project.price >= filters.budget.min && project.price <= filters.budget.max
    const areaMatch = filters.area.length === 0 || filters.area.some(area => project.location.toLowerCase().includes(area.toLowerCase()))
    // Support both residential and commercial property types
    const typeMatch = filters.propertyType.length === 0 ||
      filters.propertyType.includes(project.bedrooms?.toString()) ||
      (project.type && filters.propertyType.includes(project.type))
    return priceMatch && areaMatch && typeMatch
  })
// --- Add more property types as needed: hospitality, co-working, land parcels, etc. ---
}

export const calculateROI = (project) => {
  // ROI calculation based on property type and location
  const baseROI = project.roi || 8
  return baseROI
}

export const calculateAppreciation = (project) => {
  // Annual appreciation percentage
  return project.appreciation || 10
}

export const getRoiReasons = (project) => {
  return [
    `High demand in ${project.location}`,
    `Limited supply of properties at this price point`,
    `Nearby developments and infrastructure`,
    `Strong rental yield potential`,
    `Growing community with amenities`
  ]
}
