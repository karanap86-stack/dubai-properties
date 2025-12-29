import React, { useState, useEffect } from 'react'
import { Settings, Linkedin, Image, Zap } from 'lucide-react'
import { getSocialConfigs, saveSocialConfigs, buildPostPayload, postToLinkedIn, postToInstagram } from '../services/socialService'

export default function SocialIntegration() {
  const [configs, setConfigs] = useState({ linkedin: {}, instagram: {}, autoPost: false })
  const [testPostResult, setTestPostResult] = useState(null)
  const [sampleTitle, setSampleTitle] = useState('New Dubai Project Listing')
  const [sampleBody, setSampleBody] = useState('Check out this new high-ROI property in Downtown Dubai. Great appreciation potential and modern amenities.')
  const [refreshConfig, setRefreshConfig] = useState({ autoRefreshWeekly: true, lastRefreshed: null })
  const [refreshStatus, setRefreshStatus] = useState(null)
  
  useEffect(() => {
    const cfg = getSocialConfigs()
    setConfigs(cfg)
    // load refresh config from refreshService if available
    try {
      const { getRefreshConfig } = require('../services/refreshService')
      setRefreshConfig(getRefreshConfig())
    } catch (e) {}
  }, [])

  useEffect(() => {
    const cfg = getSocialConfigs()
    setConfigs(cfg)
  }, [])

  const handleChange = (platform, key, value) => {
    const updated = { ...configs }
    updated[platform] = { ...(updated[platform] || {}), [key]: value }
    setConfigs(updated)
  }

  const handleSave = () => {
    saveSocialConfigs(configs)
    alert('Social configs saved locally. Configure backend to use these for posting.')
  }

  const handleTestLinkedIn = async () => {
    setTestPostResult(null)
    const payload = buildPostPayload({ title: sampleTitle, body: sampleBody })
    const res = await postToLinkedIn(payload, configs.linkedin)
    setTestPostResult(res)
  }

  const handleTestInstagram = async () => {
    setTestPostResult(null)
    const payload = buildPostPayload({ title: sampleTitle, body: sampleBody })
    const res = await postToInstagram(payload, configs.instagram)
    setTestPostResult(res)
  }

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 flex items-center gap-2" style={{ color: '#0a2e6d' }}><Settings size={28} style={{ color: '#00e676' }} /> Social Integrations</h1>

        <div className="rounded-xl p-6 mb-6" style={{ background: 'rgba(10,46,109,0.07)', border: '2px solid #00e676' }}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: '#0a2e6d' }}><Linkedin size={18} style={{ color: '#00e676' }} /> LinkedIn</h2>
          <p className="text-sm mb-3" style={{ color: '#0a2e6d' }}>Provide your LinkedIn Page ID and Access Token (use backend for secure storage)</p>
          <div className="grid grid-cols-1 gap-3">
            <input value={configs.linkedin.pageId || ''} onChange={(e)=> handleChange('linkedin','pageId', e.target.value)} placeholder="LinkedIn Page ID" className="px-3 py-2 rounded" style={{ background: '#fff', border: '1px solid #00e676', color: '#0a2e6d' }} />
            <input value={configs.linkedin.accessToken || ''} onChange={(e)=> handleChange('linkedin','accessToken', e.target.value)} placeholder="LinkedIn Access Token" className="px-3 py-2 rounded" style={{ background: '#fff', border: '1px solid #00e676', color: '#0a2e6d' }} />
          </div>
        </div>

        <div className="rounded-xl p-6 mb-6" style={{ background: 'rgba(10,46,109,0.07)', border: '2px solid #00e676' }}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: '#0a2e6d' }}><Image size={18} style={{ color: '#00e676' }} /> Instagram</h2>
          <p className="text-sm mb-3" style={{ color: '#0a2e6d' }}>Provide Instagram Business Account ID and Access Token (backend required for direct posting)</p>
          <div className="grid grid-cols-1 gap-3">
            <input value={configs.instagram.accountId || ''} onChange={(e)=> handleChange('instagram','accountId', e.target.value)} placeholder="Instagram Account ID" className="px-3 py-2 rounded" style={{ background: '#fff', border: '1px solid #00e676', color: '#0a2e6d' }} />
            <input value={configs.instagram.accessToken || ''} onChange={(e)=> handleChange('instagram','accessToken', e.target.value)} placeholder="Instagram Access Token" className="px-3 py-2 rounded" style={{ background: '#fff', border: '1px solid #00e676', color: '#0a2e6d' }} />
          </div>
        </div>

        <div className="rounded-xl p-6 mb-6" style={{ background: 'rgba(10,46,109,0.07)', border: '2px solid #00e676' }}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: '#0a2e6d' }}><Zap size={18} style={{ color: '#00e676' }} /> Auto-Posting</h2>
          <label className="flex items-center gap-3 text-sm" style={{ color: '#0a2e6d' }}>
            <input type="checkbox" checked={configs.autoPost} onChange={(e)=> { setConfigs(prev=> ({...prev, autoPost: e.target.checked})) }} /> Enable automatic posting when new lead/content is created
          </label>
          <p className="text-xs text-gray-400 mt-2">When enabled, the backend should use saved configs to auto-post content. This front-end stores configs locally for demo only.</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">Content Refresh</h2>
          <label className="flex items-center gap-3 text-sm text-gray-300 mb-2">
            <input type="checkbox" checked={refreshConfig.autoRefreshWeekly} onChange={(e)=> { const updated = {...refreshConfig, autoRefreshWeekly: e.target.checked }; setRefreshConfig(updated); try { require('../services/refreshService').saveRefreshConfig(updated) } catch (err) {} }} /> Enable weekly automatic refresh of projects & creatives
          </label>
          <div className="text-xs text-gray-400 mb-3">Last refreshed: {refreshConfig.lastRefreshed ? new Date(refreshConfig.lastRefreshed).toLocaleString() : 'Never'}</div>
          <div className="flex gap-2">
            <button onClick={async ()=> { setRefreshStatus('Refreshing...'); const res = await require('../services/refreshService').performRefresh(); setRefreshStatus(res.success ? 'Refresh complete' : `Failed: ${res.error || 'unknown'}`); setTimeout(()=>{ setRefreshStatus(null) }, 4000) }} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Run Refresh Now</button>
            <div className="text-sm text-gray-300 self-center">{refreshStatus}</div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Weekly refresh updates project pricing, listings, and regenerates creatives to keep content current.</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={handleSave} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Save Configs</button>
          <button onClick={handleTestLinkedIn} className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg">Test Post to LinkedIn</button>
          <button onClick={handleTestInstagram} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg">Test Post to Instagram</button>
        </div>

        {testPostResult && (
          <div className="p-4 bg-slate-800 rounded text-sm">
            <pre className="text-xs text-gray-300">{JSON.stringify(testPostResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
