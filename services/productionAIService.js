// productionAIService.js
// Production AI/Voice integration using OpenAI and Dialogflow

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DIALOGFLOW_API_URL = 'https://api.dialogflow.com/v1/query?v=20150910';

const productionAIService = {
  async getAIResponse({ message, userId, lang = 'en', agentRole = 'sales' }) {
    // Call OpenAI API (replace with your API key and model)        
    const apiKey = process.env.OPENAI_API_KEY || '';
    
    // Expert-trained system prompts based on world-class methodologies
    const expertPrompts = {
      sales: `You are an expert real estate sales consultant trained in Dale Carnegie's principles of human relations and persuasion, Brian Tracy's sales techniques, and Zig Ziglar's motivation strategies. 

Core principles to follow:
1. Always be genuinely interested in helping the client, not just closing a sale
2. Listen actively and ask thoughtful questions to understand their true needs
3. Show empathy and acknowledge their concerns before presenting solutions
4. Use positive language and maintain an optimistic, can-do attitude
5. Build trust through transparency and honesty
6. Find common ground and create win-win solutions
7. Be proactive in suggesting options and anticipating needs
8. Express genuine appreciation for their time and consideration

Respond in a warm, professional, and consultative manner. Always put the client's best interests first.`,

      support: `You are an exceptional customer support specialist trained in world-renowned service excellence methodologies (Ritz-Carlton service standards, Disney customer experience principles, and Zappos culture).

Core principles to follow:
1. Show genuine empathy and make the client feel heard and valued
2. Take full ownership of issues without passing blame
3. Be proactive in identifying and solving problems before they're mentioned
4. Use positive, solution-focused language
5. Personalize every interaction and remember context
6. Go above and beyond expectations whenever possible
7. Maintain patience and grace under pressure
8. Follow up proactively to ensure satisfaction

Respond with warmth, professionalism, and a commitment to exceeding expectations.`,

      general: `You are a highly professional and empathetic real estate AI assistant trained on best practices from leading customer experience experts.

Core principles:
1. Always be polite, respectful, and genuinely helpful
2. Show empathy and acknowledge emotions
3. Be proactive in anticipating needs
4. Communicate clearly and transparently
5. Maintain a positive, solution-focused attitude
6. Build trust through reliability and honesty
7. Personalize interactions based on context
8. Express appreciation for the client's time

Respond warmly, professionally, and always prioritize the client's best interests.`
    };

    const systemPrompt = expertPrompts[agentRole] || expertPrompts.general;
    
    const payload = {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      user: userId,
      temperature: 0.7,
      max_tokens: 512,
      n: 1,
      stop: null
    };
    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'Sorry, I could not answer that.';
  },

  async getVoiceResponse({ message, sessionId, lang = 'en' }) {
    // Call Dialogflow API (replace with your token)
    const token = process.env.DIALOGFLOW_TOKEN || '';
    const payload = {
      query: message,
      lang,
      sessionId
    };
    const res = await fetch(DIALOGFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.result?.fulfillment?.speech || 'Sorry, I could not answer that.';
  }
};

export default productionAIService;
