// Master disposition list for real estate journey (internal standard)
export const MASTER_DISPOSITIONS = [
  'new',
  'attempted_contact',
  'contacted',
  'callback_scheduled',
  'visit_scheduled',
  'visited',
  'proposal_sent',
  'negotiation',
  'followup_scheduled',
  'not_interested',
  'no_response',
  'on_hold',
  'lost',
  'won',
  'kyc_pending',
  'payment_pending',
  'completed'
];

// Mapping table: external CRM status → internal disposition
export const CRM_DISPOSITION_MAP = {
  salesforce: {
    'New': 'new',
    'Working': 'attempted_contact',
    'Contacted': 'contacted',
    'Callback': 'callback_scheduled',
    'Appointment Scheduled': 'visit_scheduled',
    'Appointment Completed': 'visited',
    'Proposal/Price Sent': 'proposal_sent',
    'Negotiation/Review': 'negotiation',
    'Follow Up': 'followup_scheduled',
    'Closed - Not Interested': 'not_interested',
    'Unresponsive': 'no_response',
    'On Hold': 'on_hold',
    'Closed - Lost': 'lost',
    'Closed - Won': 'won',
    'KYC Pending': 'kyc_pending',
    'Payment Pending': 'payment_pending',
    'Completed': 'completed'
  },
  zohocrm: {
    'New Lead': 'new',
    'Attempted to Contact': 'attempted_contact',
    'Contacted': 'contacted',
    'Callback Scheduled': 'callback_scheduled',
    'Site Visit Scheduled': 'visit_scheduled',
    'Site Visit Done': 'visited',
    'Proposal Sent': 'proposal_sent',
    'Negotiation': 'negotiation',
    'Follow-up': 'followup_scheduled',
    'Not Interested': 'not_interested',
    'No Response': 'no_response',
    'On Hold': 'on_hold',
    'Lost': 'lost',
    'Won': 'won',
    'KYC Pending': 'kyc_pending',
    'Payment Pending': 'payment_pending',
    'Completed': 'completed'
  },
  hubspot: {
    'New': 'new',
    'Attempted to Contact': 'attempted_contact',
    'Connected': 'contacted',
    'Callback': 'callback_scheduled',
    'Meeting Scheduled': 'visit_scheduled',
    'Meeting Done': 'visited',
    'Quote Sent': 'proposal_sent',
    'Negotiation': 'negotiation',
    'Follow Up': 'followup_scheduled',
    'Disqualified': 'not_interested',
    'Unresponsive': 'no_response',
    'On Hold': 'on_hold',
    'Lost': 'lost',
    'Closed Won': 'won',
    'KYC Pending': 'kyc_pending',
    'Payment Pending': 'payment_pending',
    'Completed': 'completed'
  },
  nobroker: {
    'Fresh': 'new',
    'Call Initiated': 'attempted_contact',
    'Connected': 'contacted',
    'Callback': 'callback_scheduled',
    'Visit Scheduled': 'visit_scheduled',
    'Visit Done': 'visited',
    'Proposal Sent': 'proposal_sent',
    'Negotiation': 'negotiation',
    'Follow Up': 'followup_scheduled',
    'Not Interested': 'not_interested',
    'No Response': 'no_response',
    'On Hold': 'on_hold',
    'Lost': 'lost',
    'Booked': 'won',
    'KYC Pending': 'kyc_pending',
    'Payment Pending': 'payment_pending',
    'Completed': 'completed'
  },
  // Add more CRMs as needed
};

// Reverse mapping: internal → external CRM (for outbound sync)
export function mapToExternalDisposition(crm, internalDisposition) {
  const crmMap = CRM_DISPOSITION_MAP[crm];
  if (!crmMap) return internalDisposition;
  const entry = Object.entries(crmMap).find(([k, v]) => v === internalDisposition);
  return entry ? entry[0] : internalDisposition;
}

// Map incoming CRM status to internal disposition
export function mapFromExternalDisposition(crm, externalStatus) {
  const crmMap = CRM_DISPOSITION_MAP[crm];
  if (!crmMap) return externalStatus;
  return crmMap[externalStatus] || externalStatus;
}

// --- Auto-update CRM mapping every 3 months ---
export async function autoUpdateCrmMappings() {
  // Example: fetch list of popular real estate CRMs from the web
  // (Stub: Replace with real web scraping or API integration)
  const knownCrms = Object.keys(CRM_DISPOSITION_MAP);
  const newCrms = await fetchNewCrmsFromWeb();
  newCrms.forEach(crm => {
    if (!CRM_DISPOSITION_MAP[crm]) {
      // Optionally: fetch or prompt for mapping
      CRM_DISPOSITION_MAP[crm] = {};
    }
  });
}

// Stub: Simulate web check for new CRMs
async function fetchNewCrmsFromWeb() {
  // In production, use web scraping or CRM directories/APIs
  // Return [] for now
  return [];
}

// Schedule auto-update every 3 months
setInterval(autoUpdateCrmMappings, 1000 * 60 * 60 * 24 * 90);
