// campaignService.js
// Comprehensive campaign management for email, SMS, and WhatsApp campaigns

import { sendWhatsAppMessage, sendBulkWhatsApp } from './whatsappService';
import { sendSMS } from './telephonyService';
import notificationService from './notificationService';

// Campaign storage key (replace with backend DB in production)
const CAMPAIGNS_KEY = 'marketing_campaigns';

/**
 * Create a new campaign
 * @param {object} campaignData - {name, type, channel, audience, message, schedule, status}
 * @returns {object}
 */
export function createCampaign(campaignData) {
  try {
    const campaigns = getAllCampaigns();
    
    const campaign = {
      id: `campaign_${Date.now()}`,
      name: campaignData.name,
      type: campaignData.type || 'promotional', // promotional, transactional, nurture, reengagement
      channel: campaignData.channel || 'email', // email, sms, whatsapp, multi
      audience: campaignData.audience || [], // Array of {id, name, contact}
      message: campaignData.message || {},
      template: campaignData.template || null,
      schedule: campaignData.schedule || { type: 'immediate' }, // immediate, scheduled, recurring
      status: 'draft', // draft, scheduled, running, paused, completed, cancelled
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        failed: 0
      },
      createdAt: new Date().toISOString(),
      createdBy: campaignData.createdBy || 'system',
      updatedAt: new Date().toISOString()
    };
    
    campaigns.push(campaign);
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
    
    return { success: true, campaign };
  } catch (e) {
    console.error('Create campaign failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Get all campaigns
 * @returns {Array}
 */
export function getAllCampaigns() {
  try {
    const campaigns = JSON.parse(localStorage.getItem(CAMPAIGNS_KEY) || '[]');
    return campaigns;
  } catch (e) {
    console.error('Get campaigns failed:', e);
    return [];
  }
}

/**
 * Get campaign by ID
 * @param {string} campaignId
 * @returns {object}
 */
export function getCampaignById(campaignId) {
  const campaigns = getAllCampaigns();
  return campaigns.find(c => c.id === campaignId) || null;
}

/**
 * Update campaign
 * @param {string} campaignId
 * @param {object} updates
 * @returns {object}
 */
export function updateCampaign(campaignId, updates) {
  try {
    const campaigns = getAllCampaigns();
    const index = campaigns.findIndex(c => c.id === campaignId);
    
    if (index === -1) {
      return { success: false, error: 'Campaign not found' };
    }
    
    campaigns[index] = {
      ...campaigns[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
    
    return { success: true, campaign: campaigns[index] };
  } catch (e) {
    console.error('Update campaign failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Execute campaign (send messages to audience)
 * @param {string} campaignId
 * @returns {Promise<object>}
 */
export async function executeCampaign(campaignId) {
  try {
    const campaign = getCampaignById(campaignId);
    
    if (!campaign) {
      return { success: false, error: 'Campaign not found' };
    }
    
    if (campaign.status === 'running') {
      return { success: false, error: 'Campaign already running' };
    }
    
    // Update status to running
    updateCampaign(campaignId, { status: 'running' });
    
    // Execute based on channel
    let results;
    
    switch (campaign.channel) {
      case 'email':
        results = await executeEmailCampaign(campaign);
        break;
      case 'sms':
        results = await executeSMSCampaign(campaign);
        break;
      case 'whatsapp':
        results = await executeWhatsAppCampaign(campaign);
        break;
      case 'multi':
        results = await executeMultiChannelCampaign(campaign);
        break;
      default:
        return { success: false, error: 'Unsupported channel' };
    }
    
    // Update campaign metrics
    updateCampaign(campaignId, {
      status: 'completed',
      metrics: {
        sent: results.sent || 0,
        delivered: results.delivered || 0,
        failed: results.failed || 0,
        opened: 0,
        clicked: 0,
        converted: 0
      },
      completedAt: new Date().toISOString()
    });
    
    return { success: true, results };
  } catch (e) {
    console.error('Execute campaign failed:', e);
    updateCampaign(campaignId, { status: 'failed', error: e.message });
    return { success: false, error: e.message };
  }
}

/**
 * Execute email campaign
 * @param {object} campaign
 * @returns {Promise<object>}
 */
async function executeEmailCampaign(campaign) {
  let sent = 0;
  let failed = 0;
  
  for (const recipient of campaign.audience) {
    try {
      // TODO: Replace with actual email service (SendGrid, AWS SES, etc.)
      await notificationService.sendEmailNotification({
        to: recipient.contact,
        subject: campaign.message.subject || campaign.name,
        body: campaign.message.body || '',
        html: campaign.message.html || null
      });
      sent++;
    } catch (e) {
      console.error(`Email send failed for ${recipient.contact}:`, e);
      failed++;
    }
  }
  
  return { sent, failed, delivered: sent, total: campaign.audience.length };
}

/**
 * Execute SMS campaign
 * @param {object} campaign
 * @returns {Promise<object>}
 */
async function executeSMSCampaign(campaign) {
  let sent = 0;
  let failed = 0;
  
  for (const recipient of campaign.audience) {
    try {
      // TODO: Replace with actual SMS service
      // await sendSMS(recipient.contact, campaign.message.body);
      console.log(`SMS sent to ${recipient.contact}: ${campaign.message.body}`);
      sent++;
      
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (e) {
      console.error(`SMS send failed for ${recipient.contact}:`, e);
      failed++;
    }
  }
  
  return { sent, failed, delivered: sent, total: campaign.audience.length };
}

/**
 * Execute WhatsApp campaign
 * @param {object} campaign
 * @returns {Promise<object>}
 */
async function executeWhatsAppCampaign(campaign) {
  try {
    const recipients = campaign.audience.map(r => ({
      to: r.contact,
      message: campaign.message.body || '',
      mediaUrl: campaign.message.mediaUrl || null
    }));
    
    const results = await sendBulkWhatsApp(recipients, 1000); // 1 second delay between messages
    
    return {
      sent: results.sent,
      failed: results.failed,
      delivered: results.sent,
      total: results.total,
      details: results.results
    };
  } catch (e) {
    console.error('WhatsApp campaign failed:', e);
    return { sent: 0, failed: campaign.audience.length, total: campaign.audience.length };
  }
}

/**
 * Execute multi-channel campaign
 * @param {object} campaign
 * @returns {Promise<object>}
 */
async function executeMultiChannelCampaign(campaign) {
  const results = {
    email: { sent: 0, failed: 0 },
    sms: { sent: 0, failed: 0 },
    whatsapp: { sent: 0, failed: 0 }
  };
  
  // Execute each channel in parallel
  const promises = [];
  
  if (campaign.message.email) {
    promises.push(executeEmailCampaign({ ...campaign, message: campaign.message.email })
      .then(r => { results.email = r; }));
  }
  
  if (campaign.message.sms) {
    promises.push(executeSMSCampaign({ ...campaign, message: campaign.message.sms })
      .then(r => { results.sms = r; }));
  }
  
  if (campaign.message.whatsapp) {
    promises.push(executeWhatsAppCampaign({ ...campaign, message: campaign.message.whatsapp })
      .then(r => { results.whatsapp = r; }));
  }
  
  await Promise.all(promises);
  
  const totalSent = results.email.sent + results.sms.sent + results.whatsapp.sent;
  const totalFailed = results.email.failed + results.sms.failed + results.whatsapp.failed;
  
  return {
    sent: totalSent,
    failed: totalFailed,
    delivered: totalSent,
    total: campaign.audience.length,
    byChannel: results
  };
}

/**
 * Schedule campaign for later execution
 * @param {string} campaignId
 * @param {Date} scheduleDate
 * @returns {object}
 */
export function scheduleCampaign(campaignId, scheduleDate) {
  try {
    const campaign = getCampaignById(campaignId);
    
    if (!campaign) {
      return { success: false, error: 'Campaign not found' };
    }
    
    updateCampaign(campaignId, {
      status: 'scheduled',
      schedule: {
        type: 'scheduled',
        date: scheduleDate.toISOString()
      }
    });
    
    // TODO: In production, use a job scheduler (e.g., Bull, Agenda, AWS EventBridge)
    const delay = scheduleDate.getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        executeCampaign(campaignId);
      }, delay);
    }
    
    return { success: true, scheduledFor: scheduleDate.toISOString() };
  } catch (e) {
    console.error('Schedule campaign failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Pause running campaign
 * @param {string} campaignId
 * @returns {object}
 */
export function pauseCampaign(campaignId) {
  return updateCampaign(campaignId, { status: 'paused' });
}

/**
 * Resume paused campaign
 * @param {string} campaignId
 * @returns {Promise<object>}
 */
export async function resumeCampaign(campaignId) {
  const campaign = getCampaignById(campaignId);
  
  if (!campaign || campaign.status !== 'paused') {
    return { success: false, error: 'Campaign not found or not paused' };
  }
  
  return await executeCampaign(campaignId);
}

/**
 * Cancel campaign
 * @param {string} campaignId
 * @returns {object}
 */
export function cancelCampaign(campaignId) {
  return updateCampaign(campaignId, { status: 'cancelled' });
}

/**
 * Get campaign analytics
 * @param {string} campaignId
 * @returns {object}
 */
export function getCampaignAnalytics(campaignId) {
  const campaign = getCampaignById(campaignId);
  
  if (!campaign) {
    return { success: false, error: 'Campaign not found' };
  }
  
  const metrics = campaign.metrics || {};
  const audience = campaign.audience || [];
  
  return {
    success: true,
    campaignId,
    campaignName: campaign.name,
    status: campaign.status,
    metrics: {
      ...metrics,
      deliveryRate: audience.length > 0 ? (metrics.delivered / audience.length * 100).toFixed(2) + '%' : '0%',
      openRate: metrics.delivered > 0 ? (metrics.opened / metrics.delivered * 100).toFixed(2) + '%' : '0%',
      clickRate: metrics.opened > 0 ? (metrics.clicked / metrics.opened * 100).toFixed(2) + '%' : '0%',
      conversionRate: metrics.sent > 0 ? (metrics.converted / metrics.sent * 100).toFixed(2) + '%' : '0%'
    },
    audience: {
      total: audience.length,
      targeted: audience.length,
      reached: metrics.delivered || 0
    },
    timeline: {
      created: campaign.createdAt,
      started: campaign.startedAt || null,
      completed: campaign.completedAt || null
    }
  };
}

export default {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  executeCampaign,
  scheduleCampaign,
  pauseCampaign,
  resumeCampaign,
  cancelCampaign,
  getCampaignAnalytics
};
