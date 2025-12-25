import React, { useState, useEffect } from 'react'
import { getAllLeads, getLeadStatistics, updateLeadTemperature, addLeadNote, updateDiscussionSummary, getHotLeads, getWarmLeads, getColdLeads, getDuplicateLeads, downloadLeadsCSV, LEAD_TEMPERATURE, addProjectToLead, removeProjectFromLead, createAppointment, shareLeadWithPartner, setSharePreferences, isReturningClient, markReengagementShown } from '../services/leadService'
import { scheduleNoContactNotification, cancelNoContactNotification } from '../services/notificationService'
import partnerService from '../services/partnerService'
import { getAllProjects } from '../services/projectService'
import { Flame, Zap, Snowflake, Download, Trash2, Mail, MessageCircle, ChevronDown, Filter } from 'lucide-react'

export default function LeadsDashboard() {
  const [leads, setLeads] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [filterType, setFilterType] = useState('all') // all, hot, warm, cold, duplicates
  const [expandedLead, setExpandedLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [discussionDrafts, setDiscussionDrafts] = useState({})
  const [allProjects, setAllProjects] = useState([])
  const [notesDrafts, setNotesDrafts] = useState({})
  const [appointmentDrafts, setAppointmentDrafts] = useState({})
  const [partnerDrafts, setPartnerDrafts] = useState({})
  const [partners, setPartners] = useState([])

  useEffect(() => {
    loadLeads()
    loadAllProjects()
    loadPartners()
  }, [])

  const loadPartners = () => {
    setPartners(partnerService.getAllPartners())
  }

  const loadAllProjects = async () => {
    const projects = await getAllProjects()
    setAllProjects(projects)
  }

  const loadLeads = () => {
    const allLeads = getAllLeads()
    setLeads(allLeads)
    setStatistics(getLeadStatistics())
    // initialize discussion drafts
    const drafts = {}
    allLeads.forEach(l => { drafts[l.id] = l.discussionSummary || '' })
    setDiscussionDrafts(drafts)
    setLoading(false)
  }

  const getFilteredLeads = () => {
    switch (filterType) {
      case 'hot':
        return getHotLeads()
      case 'warm':
        return getWarmLeads()
      case 'cold':
        return getColdLeads()
      case 'duplicates':
        return getDuplicateLeads()
      default:
        return getAllLeads()
    }
  }

  const handleTemperatureChange = (leadId, newTemp) => {
    updateLeadTemperature(leadId, newTemp)
    loadLeads()
  }

  const handleAddNote = (leadId, note) => {
    if (note && note.trim()) {
      addLeadNote(leadId, note)
      setNotesDrafts(prev => ({ ...prev, [leadId]: '' }))
      loadLeads()
    }
  }

  const getTemperatureColor = (temperature) => {
    switch (temperature) {
      case LEAD_TEMPERATURE.HOT:
        return 'from-red-600 to-orange-600 text-red-400'
      case LEAD_TEMPERATURE.WARM:
        return 'from-yellow-600 to-orange-500 text-yellow-400'
      case LEAD_TEMPERATURE.COLD:
        return 'from-blue-600 to-cyan-600 text-blue-400'
      default:
        return 'from-slate-600 to-slate-700 text-slate-400'
    }
  }

  const getTemperatureIcon = (temperature) => {
    switch (temperature) {
      case LEAD_TEMPERATURE.HOT:
        return Flame
      case LEAD_TEMPERATURE.WARM:
        return Zap
      case LEAD_TEMPERATURE.COLD:
        return Snowflake
      default:
        return Zap
    }
  }

  const filteredLeads = getFilteredLeads()

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Lead Management Dashboard</h1>
          <p className="text-gray-400">Track, manage, and follow up with your leads</p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Leads', value: statistics.total, color: 'from-cyan-600 to-blue-600', icon: '📊' },
              { label: 'Hot', value: statistics.hot, color: 'from-red-600 to-orange-600', icon: '🔥' },
              { label: 'Warm', value: statistics.warm, color: 'from-yellow-600 to-orange-500', icon: '⚡' },
              { label: 'Cold', value: statistics.cold, color: 'from-blue-600 to-cyan-600', icon: '❄️' },
              { label: 'Duplicates', value: statistics.duplicates, color: 'from-slate-600 to-slate-700', icon: '⚠️' }
            ].map((stat, i) => (
              <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-lg p-4 text-white shadow-lg`}>
                <p className="text-sm opacity-90">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter & Export */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All Leads' },
                { value: 'hot', label: '🔥 Hot' },
                { value: 'warm', label: '⚡ Warm' },
                { value: 'cold', label: '❄️ Cold' },
                { value: 'duplicates', label: '⚠️ Duplicates' }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setFilterType(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filterType === filter.value
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => downloadLeadsCSV()}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {/* Leads List */}
        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No leads found in this category</p>
            </div>
          ) : (
            filteredLeads.map(lead => {
              const TempIcon = getTemperatureIcon(lead.temperature)
              // Re-engagement logic for returning clients
              const showReengage = isReturningClient(lead) && !lead.reengagementShown;
              return (
                <div
                  key={lead.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-cyan-600/50 transition-all"
                >
                  {/* Lead Header */}
                  <button
                    onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                    className="w-full p-6 flex items-start justify-between gap-4 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">{lead.customerInfo.name}</h3>
                        {lead.isDuplicate && (
                          <span className="px-2 py-1 bg-yellow-600/30 border border-yellow-600/50 rounded text-xs font-semibold text-yellow-400">
                            DUPLICATE
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <span>📧 {lead.customerInfo.email}</span>
                        <span>📱 {lead.customerInfo.phone || 'No phone'}</span>
                        <span>💰 {lead.customerInfo.budget || 'No budget'}</span>
                      </div>
                    </div>

                    {/* Temperature Badge */}
                    <div className={`bg-gradient-to-br ${getTemperatureColor(lead.temperature)} px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap`}>
                      <TempIcon size={18} />
                      <span className="font-semibold capitalize">{lead.temperature}</span>
                    </div>

                    <ChevronDown
                      size={20}
                      className={`text-gray-400 transition-transform ${
                        expandedLead === lead.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Lead Details (Expanded) */}
                  {showReengage && (
                    <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 mb-4 rounded">
                      <div className="mb-2 font-semibold text-yellow-900">Welcome back! We noticed you haven’t booked with us yet.</div>
                      <div className="mb-2 text-yellow-800">Would you like to continue with our AI assistant or connect with a human expert?</div>
                      <div className="flex gap-4">
                        <button
                          className="px-4 py-2 bg-blue-600 text-white rounded font-semibold"
                          onClick={async () => {
                            // Send WhatsApp to client
                            await fetch('/api/send-whatsapp', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ phoneNumber: lead.customerInfo.phone, message: 'We are just a message away if you need us. You can continue with our AI assistant or reach out anytime!', isReengage: true })
                            });
                            markReengagementShown(lead.id);
                            // Schedule admin notification if no action in 4 hours
                            scheduleNoContactNotification({
                              name: lead.customerInfo.name,
                              email: lead.customerInfo.email,
                              phone: lead.customerInfo.phone,
                              reengage: true,
                              leadId: lead.id
                            }, 4 * 60 * 60 * 1000);
                            alert('AI assistant is ready to help! The client will also receive a WhatsApp message.');
                            loadLeads();
                          }}
                        >Continue with AI</button>
                        <button
                          className="px-4 py-2 bg-green-600 text-white rounded font-semibold"
                          onClick={() => {
                            markReengagementShown(lead.id);
                            cancelNoContactNotification();
                            alert('Our team will contact the client shortly.');
                            loadLeads();
                          }}
                        >Connect with Us</button>
                      </div>
                    </div>
                  )}
                  {expandedLead === lead.id && (
                    <div className="border-t border-slate-700 p-6 bg-gray-900/50 space-y-4">
                      {/* Properties Interested */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Properties Interested ({lead.selectedProjects.length})</h4>
                        <div className="space-y-2">
                          {lead.selectedProjects.map(project => (
                            <div key={project.id} className="p-3 bg-slate-800 rounded-lg flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-white">{project.name}</p>
                                <p className="text-xs text-gray-400">{project.location}</p>
                              </div>
                              <div className="text-right flex items-center gap-2">
                                <div className="text-right">
                                  <p className="font-bold text-cyan-400">{(project.price / 1000000).toFixed(1)}M AED</p>
                                  <p className="text-xs text-green-400">ROI: {project.roi}%</p>
                                </div>
                                <button
                                  onClick={() => { removeProjectFromLead(lead.id, project.id); loadLeads() }}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                          {/* Add project picker */}
                          <div className="mt-2 flex gap-2">
                            <select
                              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                              value={discussionDrafts[`add_project_${lead.id}`] || ''}
                              onChange={(e) => setDiscussionDrafts(prev => ({ ...prev, [`add_project_${lead.id}`]: e.target.value }))}
                            >
                              <option value="">Select project to add</option>
                              {allProjects.filter(p => !lead.selectedProjects.find(sp => sp.id === p.id)).map(p => (
                                <option key={p.id} value={p.id}>{p.name} — {p.location} — {(p.price/1000000).toFixed(1)}M AED</option>
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                const pid = discussionDrafts[`add_project_${lead.id}`]
                                if (pid) {
                                  const project = allProjects.find(p => String(p.id) === String(pid))
                                  if (project) {
                                    addProjectToLead(lead.id, project)
                                    setDiscussionDrafts(prev => ({ ...prev, [`add_project_${lead.id}`]: '' }))
                                    loadLeads()
                                  }
                                }
                              }}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                            >
                              Add Project
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Temperature Selector */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Update Temperature</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: LEAD_TEMPERATURE.HOT, label: 'Hot', icon: Flame },
                            { value: LEAD_TEMPERATURE.WARM, label: 'Warm', icon: Zap },
                            { value: LEAD_TEMPERATURE.COLD, label: 'Cold', icon: Snowflake }
                          ].map(temp => {
                            const IconComp = temp.icon
                            return (
                              <button
                                key={temp.value}
                                onClick={() => handleTemperatureChange(lead.id, temp.value)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                  lead.temperature === temp.value
                                    ? `bg-gradient-to-r ${getTemperatureColor(temp.value).split(' ')[0]} text-white`
                                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                              >
                                <IconComp size={16} />
                                {temp.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Conversation History */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Discussion Summary</h4>
                        <textarea
                          value={discussionDrafts[lead.id] || ''}
                          onChange={(e) => setDiscussionDrafts(prev => ({ ...prev, [lead.id]: e.target.value }))}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 resize-none h-24"
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => { updateDiscussionSummary(lead.id, discussionDrafts[lead.id] || '') ; loadLeads() }}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold"
                          >
                            Save Summary
                          </button>
                          <button
                            onClick={() => { setDiscussionDrafts(prev => ({ ...prev, [lead.id]: lead.discussionSummary || '' })) }}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-200 rounded-lg font-semibold"
                          >
                            Reset
                          </button>
                        </div>

                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Conversation History</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {lead.conversationHistory.length === 0 ? (
                            <p className="text-xs text-gray-500">No conversation history yet</p>
                          ) : (
                            lead.conversationHistory.map((entry, i) => (
                              <div key={i} className="p-2 bg-slate-800 rounded text-xs">
                                <div className="flex justify-between mb-1">
                                  <span className="font-semibold text-cyan-400 capitalize">{entry.type}</span>
                                  <span className="text-gray-500">{new Date(entry.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-300">{entry.content}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Add Note */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Add Note</h4>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add conversation note..."
                            value={notesDrafts[lead.id] || ''}
                            onChange={(e) => setNotesDrafts(prev => ({ ...prev, [lead.id]: e.target.value }))}
                            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddNote(lead.id, notesDrafts[lead.id] || '')
                              }
                            }}
                          />
                          <button
                            onClick={() => handleAddNote(lead.id, notesDrafts[lead.id] || '')}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-all"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Appointments / Schedule */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Schedule Appointment</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <select className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" value={appointmentDrafts[lead.id]?.type || 'visit'} onChange={(e) => setAppointmentDrafts(prev => ({ ...prev, [lead.id]: { ...(prev[lead.id]||{}), type: e.target.value } }))}>
                            <option value="call">Call</option>
                            <option value="meeting">Meeting</option>
                            <option value="visit">Visit</option>
                          </select>
                          <input type="datetime-local" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" value={appointmentDrafts[lead.id]?.start || ''} onChange={(e) => setAppointmentDrafts(prev => ({ ...prev, [lead.id]: { ...(prev[lead.id]||{}), start: e.target.value } }))} />
                          <input type="number" min="15" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" placeholder="Duration (mins)" value={appointmentDrafts[lead.id]?.duration || 60} onChange={(e) => setAppointmentDrafts(prev => ({ ...prev, [lead.id]: { ...(prev[lead.id]||{}), duration: Number(e.target.value) } }))} />
                        </div>
                        <div className="mt-2 grid grid-cols-1 gap-2">
                          <input type="text" placeholder="Location (optional)" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" value={appointmentDrafts[lead.id]?.location || ''} onChange={(e) => setAppointmentDrafts(prev => ({ ...prev, [lead.id]: { ...(prev[lead.id]||{}), location: e.target.value } }))} />
                          <input type="text" placeholder="Reminders in minutes (comma separated) e.g. 60,30,10" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" value={appointmentDrafts[lead.id]?.reminders || '60,30,10'} onChange={(e) => setAppointmentDrafts(prev => ({ ...prev, [lead.id]: { ...(prev[lead.id]||{}), reminders: e.target.value } }))} />
                          <textarea placeholder="Notes" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" value={appointmentDrafts[lead.id]?.notes || ''} onChange={(e) => setAppointmentDrafts(prev => ({ ...prev, [lead.id]: { ...(prev[lead.id]||{}), notes: e.target.value } }))} />
                          <div className="flex gap-2">
                            <button onClick={async () => {
                              const d = appointmentDrafts[lead.id] || {}
                              if (!d.start) return alert('Select start date/time')
                              const startISO = new Date(d.start).toISOString()
                              const endISO = new Date(new Date(d.start).getTime() + ((d.duration || 60) * 60000)).toISOString()
                              const reminders = (d.reminders || '60,30,10').split(',').map(s => Number(s.trim())).filter(Boolean)
                              try {
                                await createAppointment(lead.id, { type: d.type || 'visit', title: d.title || '', startISO, endISO, location: d.location || '', reminderMinutes: reminders, notes: d.notes || '' })
                                loadLeads()
                                setAppointmentDrafts(prev => ({ ...prev, [lead.id]: {} }))
                                alert('Appointment scheduled')
                              } catch (e) { console.error(e); alert('Failed to schedule') }
                            }} className="px-4 py-2 bg-emerald-600 rounded text-white">Schedule</button>
                            <button onClick={() => setAppointmentDrafts(prev => ({ ...prev, [lead.id]: {} }))} className="px-4 py-2 bg-slate-700 rounded text-gray-200">Reset</button>
                          </div>
                        </div>
                      </div>

                      {/* Partner Sharing */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Partner Sharing</h4>
                        <div className="space-y-2">
                          {(lead.sharedWith || []).map((s, idx) => (
                            <div key={idx} className="p-3 bg-slate-800 rounded-lg flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-white">{s.partnerName || s.partnerId}</p>
                                <p className="text-xs text-gray-400">Status: {s.status}</p>
                                <p className="text-xs text-gray-400">Consent: {s.consent ? Object.keys(s.consent).filter(k => s.consent[k]).join(', ') : '—'}</p>
                              </div>
                            </div>
                          ))}

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <select className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" value={partnerDrafts[lead.id]?.id || ''} onChange={(e) => {
                              const pid = e.target.value
                              const p = partners.find(pp => pp.id === pid)
                              setPartnerDrafts(prev => ({ ...prev, [lead.id]: { ...(prev[lead.id]||{}), id: pid, name: p?.name || '', url: p?.callbackUrl || '', shareContact: p?.shareContact ?? true, shareBudget: p?.shareBudget ?? true, shareRequirements: p?.shareRequirements ?? true } }))
                            }}>
                              <option value="">-- Select partner (or fill new) --</option>
                              {partners.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
                            </select>
                            <input placeholder="Partner callback URL (optional)" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" value={partnerDrafts[lead.id]?.url || ''} onChange={(e) => setPartnerDrafts(prev => ({ ...prev, [lead.id]: { ...(prev[lead.id]||{}), url: e.target.value } }))} />
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-300">Share contact</label>
                              <input type="checkbox" checked={partnerDrafts[lead.id]?.shareContact ?? true} onChange={(e) => setPartnerDrafts(prev => ({ ...prev, [lead.id]: { ...(prev[lead.id]||{}), shareContact: e.target.checked } }))} />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-300">Share budget</label>
                              <input type="checkbox" checked={partnerDrafts[lead.id]?.shareBudget ?? true} onChange={(e) => setPartnerDrafts(prev => ({ ...prev, [lead.id]: { ...(prev[lead.id]||{}), shareBudget: e.target.checked } }))} />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-300">Share requirements</label>
                              <input type="checkbox" checked={partnerDrafts[lead.id]?.shareRequirements ?? true} onChange={(e) => setPartnerDrafts(prev => ({ ...prev, [lead.id]: { ...(prev[lead.id]||{}), shareRequirements: e.target.checked } }))} />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={async () => {
                                const p = partnerDrafts[lead.id] || {}
                                if (!p.name && !p.id) return alert('Select an existing partner or enter a name')
                                try {
                                  const partnerId = p.id || ('p_' + Date.now())
                                  await shareLeadWithPartner(lead.id, { partnerId, partnerName: p.name || partners.find(pp=>pp.id===p.id)?.name, callbackUrl: p.url || partners.find(pp=>pp.id===p.id)?.callbackUrl, note: '', consent: { shareContact: !!p.shareContact, shareBudget: !!p.shareBudget, shareRequirements: !!p.shareRequirements } })
                                  // if selected partner exists, ensure consent saved
                                  if (p.id) setSharePreferences(lead.id, p.id, { shareContact: !!p.shareContact, shareBudget: !!p.shareBudget, shareRequirements: !!p.shareRequirements })
                                  setPartnerDrafts(prev => ({ ...prev, [lead.id]: {} }))
                                  loadLeads()
                                  alert('Lead shared with partner')
                                } catch (e) { console.error(e); alert('Failed to share') }
                              }} className="px-4 py-2 bg-blue-600 rounded text-white">Share</button>
                              <button onClick={() => setPartnerDrafts(prev => ({ ...prev, [lead.id]: {} }))} className="px-4 py-2 bg-slate-700 rounded text-gray-200">Reset</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Meta Information */}
                      <div className="pt-4 border-t border-slate-700 flex gap-4 text-xs text-gray-500">
                        <div>
                          <span className="block text-gray-400">Created</span>
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="block text-gray-400">Last Updated</span>
                          {new Date(lead.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
