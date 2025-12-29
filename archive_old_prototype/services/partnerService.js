// Partner management service - stores partners in localStorage
export const PARTNER_STORAGE_KEY = 'dubai_properties_partners'

export const getAllPartners = () => {
  try {
    const raw = localStorage.getItem(PARTNER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) { console.error('getAllPartners', e); return [] }
}

export const savePartner = (p) => {
  try {
    const partners = getAllPartners()
    if (!p.id) p.id = 'partner_' + Date.now()
    const existing = partners.find(x => x.id === p.id)
    if (existing) {
      Object.assign(existing, p)
    } else {
      partners.push(p)
    }
    localStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(partners))
    return p
  } catch (e) { console.error('savePartner', e); throw e }
}

export const deletePartner = (id) => {
  try {
    const partners = getAllPartners().filter(p => p.id !== id)
    localStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(partners))
    return true
  } catch (e) { console.error('deletePartner', e); return false }
}

export const getPartnerById = (id) => getAllPartners().find(p => p.id === id) || null

export const recordPartnerRevenue = (partnerId, { leadId, agreementValue = 0, commissionPercent = 0 }) => {
  try {
    const partners = getAllPartners()
    const partner = partners.find(p => p.id === partnerId)
    if (!partner) throw new Error('Partner not found')
    partner.revenue = partner.revenue || []
    const entry = { id: 'rev_' + Date.now(), leadId, agreementValue, commissionPercent, commissionAmount: (agreementValue * (commissionPercent/100)), timestamp: new Date().toISOString() }
    partner.revenue.push(entry)
    localStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(partners))
    return entry
  } catch (e) { console.error('recordPartnerRevenue', e); throw e }
}

export default { getAllPartners, savePartner, deletePartner, getPartnerById, recordPartnerRevenue }
