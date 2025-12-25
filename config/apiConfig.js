// Configuration file for external API integrations
// Update these values with your actual API keys and endpoints

export const API_CONFIG = {
  // Google Sheets Configuration
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '',
    discoveryDocs: [
      'https://sheets.googleapis.com/$discovery/rest?version=v4',
    ],
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  },

  // Backend API
  backend: {
    baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
    endpoints: {
      exportToSheets: '/api/export-to-sheets',
      sendEmail: '/api/send-email',
      generateContent: '/api/generate-content',
      getProjects: '/api/projects',
    },
  },

  // AI Content Generation (OpenAI or similar)
  ai: {
    provider: 'openai', // or 'anthropic', 'huggingface'
    apiKey: import.meta.env.VITE_AI_API_KEY || '',
    model: 'gpt-3.5-turbo',
    maxTokens: 500,
  },

  // Email Service Configuration
  email: {
    service: 'sendgrid', // or 'mailgun', 'aws-ses'
    apiKey: import.meta.env.VITE_EMAIL_API_KEY || '',
    fromEmail: 'noreply@dubaiproperties.com',
    fromName: 'Dubai Properties',
  },

  // Analytics (Optional)
  analytics: {
    enabled: true,
    googleAnalyticsId: import.meta.env.VITE_GA_ID || '',
  },

  // App Settings
  app: {
    name: 'Dubai Properties',
    description: 'AI-Powered Real Estate Platform',
    version: '1.0.0',
    maxSelectableProjects: 5,
    itemsPerPage: 12,
  },
}

// Helper function to check if APIs are configured
export const isApiConfigured = (apiName) => {
  switch (apiName) {
    case 'google':
      return !!API_CONFIG.google.clientId && !!API_CONFIG.google.apiKey
    case 'ai':
      return !!API_CONFIG.ai.apiKey
    case 'email':
      return !!API_CONFIG.email.apiKey
    default:
      return false
  }
}

// Export function for Google Sheets
export const exportToGoogleSheets = async (sheetLink, data) => {
  try {
    const response = await fetch(
      `${API_CONFIG.backend.baseUrl}${API_CONFIG.backend.endpoints.exportToSheets}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheetLink,
          data,
          timestamp: new Date().toISOString(),
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to export to Google Sheets')
    }

    return await response.json()
  } catch (error) {
    console.error('Google Sheets export error:', error)
    throw error
  }
}

// Send email function
export const sendLeadEmail = async (customerInfo, selectedProjects) => {
  try {
    const response = await fetch(
      `${API_CONFIG.backend.baseUrl}${API_CONFIG.backend.endpoints.sendEmail}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerInfo,
          selectedProjects,
          timestamp: new Date().toISOString(),
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to send email')
    }

    return await response.json()
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}

// AI Content generation function
export const generateAIContent = async (projectData, contentType, tone = 'professional') => {
  try {
    const response = await fetch(
      `${API_CONFIG.backend.baseUrl}${API_CONFIG.backend.endpoints.generateContent}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectData,
          contentType,
          tone,
          model: API_CONFIG.ai.model,
          maxTokens: API_CONFIG.ai.maxTokens,
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to generate content')
    }

    return await response.json()
  } catch (error) {
    console.error('AI content generation error:', error)
    throw error
  }
}

// Fetch projects from backend or database
export const fetchProjects = async () => {
  try {
    const response = await fetch(
      `${API_CONFIG.backend.baseUrl}${API_CONFIG.backend.endpoints.getProjects}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch projects')
    }

    return await response.json()
  } catch (error) {
    console.error('Fetch projects error:', error)
    // Return mock data as fallback
    return []
  }
}

export default API_CONFIG
