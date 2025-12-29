
import React, { useState, useEffect } from 'react'


import { handleClientFeedback } from '../services/feedbackService'
import { detectClientLocation, getLanguageOptionsForCountry } from '../services/agentService'

// Use centralized feedback/objection handling logic
async function sendMessageToAI(message, context = {}) {
  return handleClientFeedback(message, context)
}

export default function AIChatbot({ showDropPrompt = false, onEngage }) {
  const [country, setCountry] = useState('')
  const [locale, setLocale] = useState('')
  const [languageOptions, setLanguageOptions] = useState(['English'])
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hello! I am your AI assistant. How can I help you with your property search today?' }
  ])
    // On mount, detect location and set language options
    useEffect(() => {
      (async () => {
        const loc = await detectClientLocation()
        setCountry(loc.country)
        setLocale(loc.locale)
        const langs = getLanguageOptionsForCountry(loc.country)
        setLanguageOptions(langs)
        setSelectedLanguage(langs[0] || 'English')
      })()
    }, [])
  const [input, setInput] = useState('')
  const [lastWasFeedback, setLastWasFeedback] = useState(false)
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    setMessages([...messages, { from: 'user', text: input }])
    setLoading(true)
    if (onEngage) onEngage()
    const aiReply = await sendMessageToAI(input, { lastWasFeedback, language: selectedLanguage, country })
    setMessages(msgs => [...msgs, { from: 'ai', text: aiReply.response }])
    setLastWasFeedback(!!aiReply.followUp)
    setInput('')
    setLoading(false)
  }

  // Effect: If showDropPrompt is triggered, push a follow-up message
  useEffect(() => {
    if (showDropPrompt) {
      setMessages(msgs => ([
        ...msgs,
        { from: 'ai', text: 'We noticed you were about to leave. May I ask if there was anything missing or any way I can assist you further? Your feedback helps us improve.' }
      ]))
      if (onEngage) onEngage()
    }
  }, [showDropPrompt])

  return (
    <div className="fixed bottom-6 right-6 shadow-xl rounded-lg w-96 max-w-full z-50 border" style={{ background: '#fff', borderColor: '#00e676' }}>
      <div className="p-4 border-b font-bold text-lg" style={{ background: '#00e676', color: '#0a2e6d', borderColor: '#00e676' }}>AI Chatbot</div>
      <div className="px-4 pt-2 pb-0 flex flex-col gap-2">
        <div className="text-xs" style={{ color: '#0a2e6d' }}>Detected country: <b>{country}</b></div>
        <div className="text-xs" style={{ color: '#0a2e6d' }}>Preferred language:
          <select
            className="ml-2 px-2 py-1 border rounded text-xs"
            style={{ borderColor: '#00e676', color: '#0a2e6d' }}
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
          >
            {languageOptions.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="p-4 h-64 overflow-y-auto flex flex-col gap-2">
        {messages.map((msg, i) => (
          <div key={i} className={msg.from === 'ai' ? 'text-left' : 'text-right'} style={{ color: msg.from === 'ai' ? '#0a2e6d' : '#00e676' }}>
            <span className="inline-block px-3 py-2 rounded-lg" style={{ background: msg.from === 'ai' ? '#e3fcec' : '#e3eafe', color: msg.from === 'ai' ? '#0a2e6d' : '#00e676' }}>{msg.text}</span>
          </div>
        ))}
        {loading && <div style={{ color: '#00e676' }}>AI is typing...</div>}
      </div>
      <div className="flex border-t" style={{ borderColor: '#00e676' }}>
        <input
          className="flex-1 px-3 py-2 outline-none"
          style={{ color: '#0a2e6d', borderColor: '#00e676' }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          className="px-4 py-2 font-semibold rounded-r-lg disabled:opacity-50"
          style={{ background: 'linear-gradient(90deg, #0a2e6d 0%, #00e676 100%)', color: '#fff' }}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >Send</button>
      </div>
    </div>
  )
}
