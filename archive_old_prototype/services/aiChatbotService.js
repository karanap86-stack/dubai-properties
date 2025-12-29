// aiChatbotService.js
// Mock AI chatbot service, ready for OpenAI/Dialogflow integration

const mockResponses = {
  'hello': 'Hello! How can I help you with Dubai properties today?',
  'price': 'Prices vary by location and property type. What is your budget?',
  'location': 'We have properties in Downtown, Marina, Palm Jumeirah, and more. Any preference?',
  'default': 'I am here to assist you with property search, comparisons, and more!'
};


import productionAIService from './productionAIService';
import agentSelfLearningService from './agentSelfLearningService';
import innovationMonitorService from './innovationMonitorService';

const aiChatbotService = {
  async getResponse(message, userId = 'user', lang = 'en', agentId = 'ai-agent-1') {
    // Use production AI for real responses
    let response = '';
    let success = true;
    try {
      response = await productionAIService.getAIResponse({ message, userId, lang });
      // Log conversation for self-learning
      agentSelfLearningService.logConversation({ agentId, userId, message, response, success: true });
    } catch (e) {
      // Fallback to mock
      const key = Object.keys(mockResponses).find(k => message.toLowerCase().includes(k));
      response = mockResponses[key] || mockResponses['default'];
      agentSelfLearningService.logConversation({ agentId, userId, message, response, success: false });
      agentSelfLearningService.logMistake({ agentId, userId, message, error: e.message, correction: response });
    }
    // After every 100 conversations, auto-suggest innovations
    const logs = JSON.parse(localStorage.getItem('agent_conversation_logs') || '[]');
    if (logs.length % 100 === 0 && logs.length > 0) {
      // Simulate trend analysis (could use real news/trend APIs)
      innovationMonitorService.autoSuggestFromTrends([
        { title: 'New AI Model Released', summary: 'A new AI model can improve property recommendations.', url: 'https://ai-news.com/new-model' },
        { title: 'Voice Search Popularity', summary: 'Voice search is trending in real estate apps.', url: 'https://trends.com/voice-search' }
      ]);
    }
    return response;
  },
  // For direct API call (not used in widget)
  async getResponseFromAPI(message, userId = 'user', lang = 'en') {
    return productionAIService.getAIResponse({ message, userId, lang });
  }
};

export default aiChatbotService;
