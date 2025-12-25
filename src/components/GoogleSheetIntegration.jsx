import React from 'react'
import { Mail, Send, AlertCircle, Check, MessageCircle, Flame, Zap, Snowflake } from 'lucide-react'
import { saveLead, sendLeadNotifications, LEAD_TEMPERATURE, checkForDuplicate, getAllLeads } from '../services/leadService'

export default function GoogleSheetIntegration({ selectedProjects }) {
  const [sheetLink, setSheetLink] = React.useState('')
  const [customerInfo, setCustomerInfo] = React.useState({
    name: '',
    email: '',
    phone: '',
    budget: '',
    preferences: ''
  })
  const [leadTemperature, setLeadTemperature] = React.useState(LEAD_TEMPERATURE.WARM)
    const [discussionSummary, setDiscussionSummary] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState('')
  const [isDuplicate, setIsDuplicate] = React.useState(false)
  const [duplicateWarning, setDuplicateWarning] = React.useState('')
  const [notificationStatus, setNotificationStatus] = React.useState(null)

  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo({ ...customerInfo, [field]: value })
    // Check for duplicates as user types
    if (field === 'email' || field === 'phone') {
      const allLeads = getAllLeads()
      const dupCheck = checkForDuplicate(
        { ...customerInfo, [field]: value },
        allLeads
      )
      if (dupCheck.isDuplicate) {
        setIsDuplicate(true)
        setDuplicateWarning(`⚠️ Duplicate detected (${dupCheck.reason})`)
      } else {
        setIsDuplicate(false)
        setDuplicateWarning('')
      }
    }
  }

  const handleExportToSheet = async () => {
    if (!sheetLink) {
      setError('Please enter your Google Sheet link')
      return
    }

    if (!customerInfo.email) {
      setError('Please enter your email')
      return
    }

    setLoading(true)
    setError('')
    setNotificationStatus(null)
    
    try {
      // Create lead object
      const leadData = {
        sheetLink,
        customerInfo,
        selectedProjects: selectedProjects.map(p => ({
          id: p.id,
          name: p.name,
          location: p.location,
          price: p.price,
          roi: p.roi,
          appreciation: p.appreciation,
          bedrooms: p.bedrooms
        })),
        temperature: leadTemperature,
        discussionSummary: discussionSummary,
        timestamp: new Date().toISOString()
      }

      // Save lead to local storage
      const savedLead = saveLead(leadData)
      
      // Send notifications (WhatsApp + Email)
      const notificationResult = await sendLeadNotifications(savedLead)
      
      setNotificationStatus(notificationResult)
      setSuccess(true)
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setSuccess(false)
        setCustomerInfo({ name: '', email: '', phone: '', budget: '', preferences: '' })
        setLeadTemperature(LEAD_TEMPERATURE.WARM)
        setDiscussionSummary('')
        setIsDuplicate(false)
        setDuplicateWarning('')
      }, 2000)
    } catch (err) {
      setError('Failed to create lead. Please try again.')
      console.error('Export error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!customerInfo.email) {
      setError('Please enter your email')
      return
    }

    setLoading(true)
    setError('')
    setNotificationStatus(null)
    
    try {
      // Create lead object
      const leadData = {
        customerInfo,
        selectedProjects: selectedProjects.map(p => ({
          id: p.id,
          name: p.name,
          location: p.location,
          price: p.price,
          roi: p.roi,
          appreciation: p.appreciation,
          bedrooms: p.bedrooms
        })),
        temperature: leadTemperature,
        timestamp: new Date().toISOString()
      }

      // Save lead to local storage
      const savedLead = saveLead(leadData)
      
      // Send notifications
      const notificationResult = await sendLeadNotifications(savedLead)
      
      setNotificationStatus(notificationResult)
      setSuccess(true)
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setSuccess(false)
        setCustomerInfo({ name: '', email: '', phone: '', budget: '', preferences: '' })
        setLeadTemperature(LEAD_TEMPERATURE.WARM)
        setIsDuplicate(false)
        setDuplicateWarning('')
      }, 2000)
      
    } catch (err) {
      setError('Failed to send lead. Please try again.')
      console.error('Email error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8 flex items-center gap-2">
          <Mail size={32} className="text-cyan-400" />
          Save & Export Data
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Google Sheets Export */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              📊 Export to Google Sheets
            </h2>

        <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-300 font-semibold mb-2">Google Sheet Link *</label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetLink}
                  onChange={(e) => setSheetLink(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Share your Google Sheet in "Editor" mode with the app
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-300 font-semibold mb-2">Your Name *</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={customerInfo.name}
                  onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 font-semibold mb-2">Email Address *</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={customerInfo.email}
                  onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                {duplicateWarning && (
                  <p className="text-xs text-yellow-400 mt-2">{duplicateWarning}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-300 font-semibold mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+971 50 123 4567"
                  value={customerInfo.phone}
                  onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 font-semibold mb-2">Budget (AED)</label>
                <input
                  type="text"
                  placeholder="e.g., 1,000,000 - 2,000,000"
                  value={customerInfo.budget}
                  onChange={(e) => handleCustomerInfoChange('budget', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 font-semibold mb-2">Preferences</label>
                <textarea
                  placeholder="e.g., Near beach, modern amenities, family-friendly..."
                  value={customerInfo.preferences}
                  onChange={(e) => handleCustomerInfoChange('preferences', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none h-24"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 font-semibold mb-2">Discussion Summary</label>
                <textarea
                  placeholder="Brief summary of discussion with customer (e.g., Interested in ROI properties, comparing Downtown Dubai vs Arabian Ranches, wants 8%+ return, needs completion timeline details, scheduled viewing...)"
                  value={discussionSummary}
                  onChange={(e) => setDiscussionSummary(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none h-32"
                />
                <p className="text-xs text-gray-400 mt-2">💡 Key talking points, objections, next steps, and viewing status</p>
              </div>

              <div>
                <label className="block text-sm text-gray-300 font-semibold mb-3">Lead Temperature *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: LEAD_TEMPERATURE.HOT, label: 'Hot', icon: Flame, color: 'from-red-600 to-orange-600' },
                    { value: LEAD_TEMPERATURE.WARM, label: 'Warm', icon: Zap, color: 'from-yellow-600 to-orange-500' },
                    { value: LEAD_TEMPERATURE.COLD, label: 'Cold', icon: Snowflake, color: 'from-blue-600 to-cyan-600' }
                  ].map(temp => {
                    const IconComp = temp.icon
                    return (
                      <button
                        key={temp.value}
                        onClick={() => setLeadTemperature(temp.value)}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                          leadTemperature === temp.value
                            ? `bg-gradient-to-r ${temp.color} text-white shadow-lg`
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        }`}
                      >
                        <IconComp size={18} />
                        {temp.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            

            {error && (
              <div className="p-4 bg-red-600/20 border border-red-600/50 rounded-lg mb-4 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4">
                <div className="p-4 bg-green-600/20 border border-green-600/50 rounded-lg flex items-center gap-2 text-green-400 text-sm mb-4">
                  <Check size={16} />
                  Lead created successfully!
                </div>

                {isDuplicate && (
                  <div className="p-4 bg-yellow-600/20 border border-yellow-600/50 rounded-lg mb-4">
                    <p className="text-yellow-400 text-sm font-semibold">⚠️ Duplicate Lead Alert</p>
                    <p className="text-gray-300 text-xs mt-2">This customer has been marked as a duplicate. Previous interaction history is available.</p>
                  </div>
                )}

                {notificationStatus && (
                  <div className="space-y-2">
                    {notificationStatus.whatsapp?.success && (
                      <div className="p-3 bg-green-900/30 border border-green-600/50 rounded-lg flex items-center gap-2">
                        <MessageCircle size={16} className="text-green-400" />
                        <span className="text-green-400 text-xs">✓ WhatsApp sent to +917028923314</span>
                      </div>
                    )}
                    {notificationStatus.email?.success && (
                      <div className="p-3 bg-green-900/30 border border-green-600/50 rounded-lg flex items-center gap-2">
                        <Mail size={16} className="text-green-400" />
                        <span className="text-green-400 text-xs">✓ Email sent to karanap86@gmail.com</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleExportToSheet}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Exporting...' : '📊 Export to Google Sheet'}
            </button>

            <div className="mt-4 p-4 bg-blue-600/20 border border-blue-600/50 rounded-lg text-sm text-gray-300 space-y-2">
              <p className="font-semibold text-cyan-400">How it works:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Create a Google Sheet or use an existing one</li>
                <li>Share it with editor access</li>
                <li>Copy and paste the link above</li>
                <li>Click export and your data syncs automatically</li>
              </ol>
            </div>
          </div>

          {/* Email Lead */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              ✉️ Send as Email Lead
            </h2>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-900 rounded-lg border border-slate-700">
                <h3 className="text-sm font-semibold text-white mb-3">Lead Summary</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>
                    <p className="text-gray-400 text-xs">Name</p>
                    <p className="font-semibold">{customerInfo.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Email</p>
                    <p className="font-semibold">{customerInfo.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Budget</p>
                    <p className="font-semibold">{customerInfo.budget || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-900 rounded-lg border border-slate-700">
                <h3 className="text-sm font-semibold text-white mb-3">
                  Selected Properties ({selectedProjects.length})
                </h3>
                {selectedProjects.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {selectedProjects.map((project) => (
                      <li key={project.id} className="flex justify-between text-gray-300">
                        <span>{project.name}</span>
                        <span className="text-cyan-400">{(project.price / 1000000).toFixed(1)}M AED</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm">No properties selected</p>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-600/20 border border-red-600/50 rounded-lg mb-4 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-600/20 border border-green-600/50 rounded-lg mb-4 flex items-center gap-2 text-green-400 text-sm">
                <Check size={16} />
                Email sent successfully!
              </div>
            )}

            <button
              onClick={handleSendEmail}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {loading ? 'Sending...' : 'Send Lead Email'}
            </button>

            <div className="mt-4 p-4 bg-green-600/20 border border-green-600/50 rounded-lg text-sm text-gray-300">
              <p className="font-semibold text-green-400 mb-2">Email Contents:</p>
              <ul className="text-xs space-y-1">
                <li>✓ Customer profile & preferences</li>
                <li>✓ Selected properties details</li>
                <li>✓ ROI & appreciation analysis</li>
                <li>✓ Next steps & follow-up CTA</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

        {/* Data Preview */}
        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">📋 Data Preview</h2>
          
          {selectedProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 border-b border-slate-700">
                    <th className="px-4 py-2 text-left text-cyan-400">Property</th>
                    <th className="px-4 py-2 text-right text-cyan-400">Price</th>
                    <th className="px-4 py-2 text-right text-cyan-400">ROI</th>
                    <th className="px-4 py-2 text-right text-cyan-400">Appreciation</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProjects.map((project) => (
                    <tr key={project.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                      <td className="px-4 py-2 text-white">{project.name}</td>
                      <td className="px-4 py-2 text-right text-cyan-400">{(project.price / 1000000).toFixed(1)}M AED</td>
                      <td className="px-4 py-2 text-right text-green-400">{project.roi}%</td>
                      <td className="px-4 py-2 text-right text-green-400">{project.appreciation}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Select properties from the Discover tab to include in your export</p>
          )}
        </div>
      </div>
    </div>
  )
}
