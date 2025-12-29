// Notification Service: Comprehensive notification management
// Usage: import notificationService from './notificationService'

import whatsappService from './whatsappService';
import { sendSMS } from './telephonyService';

let noContactTimeout = null;
const NOTIFICATION_LOG_KEY = 'notification_logs';

// Call this when a client visits the site
export function scheduleNoContactNotification(clientDetails, delayMs = 4 * 60 * 60 * 1000) {
  cancelNoContactNotification();
  noContactTimeout = setTimeout(() => {
    sendNoContactWhatsApp(clientDetails);
  }, delayMs);
}

// Call this when a client contacts, selects, or proceeds
export function cancelNoContactNotification() {
  if (noContactTimeout) {
    clearTimeout(noContactTimeout);
    noContactTimeout = null;
  }
}

// Send WhatsApp notification to admin
async function sendNoContactWhatsApp(clientDetails) {
  const message = `Client visited but did not proceed.\nDetails: ${JSON.stringify(clientDetails)}\nStatus: visited but didn't proceed.`;
  try {
    await whatsappService.sendWhatsAppMessage('+917028923314', message);
    logNotification({ type: 'no_contact', channel: 'whatsapp', recipient: 'admin', status: 'sent' });
  } catch (e) {
    console.error('Failed to send no-contact WhatsApp notification', e);
    logNotification({ type: 'no_contact', channel: 'whatsapp', recipient: 'admin', status: 'failed', error: e.message });
  }
}

/**
 * Notify client that KYC is pending
 * @param {string} leadId
 */
export async function notifyClientKycPending(leadId) {
  try {
    // Get lead details
    const lead = getLeadById(leadId);
    if (!lead || !lead.phone) return { success: false, error: 'Lead not found or no phone' };
    
    const message = `Dear ${lead.name || 'Customer'},\n\nYour property inquiry is progressing! To proceed further, please upload your KYC documents.\n\nUpload here: ${process.env.APP_URL}/kyc/${leadId}\n\nThank you!`;
    
    // Send via WhatsApp
    await whatsappService.sendWhatsAppMessage(lead.phone, message);
    
    // Also send SMS as backup
    await sendSMS(lead.phone, message);
    
    logNotification({ type: 'kyc_pending', leadId, channel: 'multi', status: 'sent' });
    return { success: true };
  } catch (e) {
    console.error('Notify KYC pending failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Notify client that payment is pending
 * @param {string} leadId
 */
export async function notifyClientPaymentPending(leadId) {
  try {
    const lead = getLeadById(leadId);
    if (!lead || !lead.phone) return { success: false, error: 'Lead not found or no phone' };
    
    const message = `Dear ${lead.name || 'Customer'},\n\nYour booking is almost complete! Please complete the payment to finalize your property reservation.\n\nPay now: ${process.env.APP_URL}/payment/${leadId}\n\nThank you!`;
    
    await whatsappService.sendWhatsAppMessage(lead.phone, message);
    await sendSMS(lead.phone, message);
    
    logNotification({ type: 'payment_pending', leadId, channel: 'multi', status: 'sent' });
    return { success: true };
  } catch (e) {
    console.error('Notify payment pending failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Notify agent/developer that negotiation has started
 * @param {string} leadId
 */
export async function notifyNegotiationStarted(leadId) {
  try {
    const lead = getLeadById(leadId);
    if (!lead) return { success: false, error: 'Lead not found' };
    
    const message = `Negotiation started for Lead #${leadId}.\nClient: ${lead.name}\nProperty: ${lead.propertyName || 'N/A'}\nBudget: ${lead.budget || 'N/A'}\n\nPlease review and respond.`;
    
    // Notify assigned agent
    if (lead.assignedAgentPhone) {
      await whatsappService.sendWhatsAppMessage(lead.assignedAgentPhone, message);
    }
    
    logNotification({ type: 'negotiation_started', leadId, channel: 'whatsapp', status: 'sent' });
    return { success: true };
  } catch (e) {
    console.error('Notify negotiation started failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Notify approver/admin about pending approval
 * @param {string} leadId
 */
export async function notifyPendingApproval(leadId) {
  try {
    const lead = getLeadById(leadId);
    if (!lead) return { success: false, error: 'Lead not found' };
    
    const message = `Approval Required!\nLead #${leadId}\nClient: ${lead.name}\nAmount: ${lead.amount || 'N/A'}\n\nReview here: ${process.env.APP_URL}/admin/approvals/${leadId}`;
    
    // Send to admin
    await whatsappService.sendWhatsAppMessage('+917028923314', message);
    
    // Also send email
    await sendEmailNotification({
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject: 'Lead Approval Required',
      body: message
    });
    
    logNotification({ type: 'pending_approval', leadId, channel: 'multi', status: 'sent' });
    return { success: true };
  } catch (e) {
    console.error('Notify pending approval failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Notify service provider about new lead
 * @param {string} providerId
 * @param {string} leadId
 * @param {string} type
 */
export async function notifyProvider(providerId, leadId, type) {
  try {
    const message = `New Lead Shared!\nType: ${type}\nLead ID: ${leadId}\n\nView details: ${process.env.APP_URL}/provider/leads/${leadId}`;
    
    // Get provider contact
    const providerPhone = getProviderPhone(providerId);
    if (providerPhone) {
      await whatsappService.sendWhatsAppMessage(providerPhone, message);
    }
    
    logNotification({ type: 'provider_notification', providerId, leadId, channel: 'whatsapp', status: 'sent' });
    return { success: true };
  } catch (e) {
    console.error('Notify provider failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Send email notification
 * @param {object} emailData - {to, subject, body, html}
 */
export async function sendEmailNotification(emailData) {
  try {
    console.log('Email notification:', emailData);
    
    // Production email service integration
    const emailProvider = process.env.EMAIL_PROVIDER || 'console'; // 'sendgrid', 'ses', 'console'
    
    switch (emailProvider.toLowerCase()) {
      case 'sendgrid':
        // SendGrid integration
        if (process.env.SENDGRID_API_KEY) {
          const sgMail = require('@sendgrid/mail');
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          await sgMail.send({
            to: emailData.to,
            from: process.env.SENDGRID_FROM_EMAIL || 'noreply@propertyai.com',
            subject: emailData.subject,
            text: emailData.body,
            html: emailData.html || emailData.body
          });
          console.log('✅ Email sent via SendGrid');
        } else {
          console.warn('SENDGRID_API_KEY not configured, email logged only');
        }
        break;
        
      case 'ses':
        // AWS SES integration
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
          const AWS = require('aws-sdk');
          const ses = new AWS.SES({
            region: process.env.AWS_REGION || 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          });
          
          await ses.sendEmail({
            Source: process.env.SES_FROM_EMAIL || 'noreply@propertyai.com',
            Destination: { ToAddresses: [emailData.to] },
            Message: {
              Subject: { Data: emailData.subject },
              Body: {
                Text: { Data: emailData.body },
                Html: { Data: emailData.html || emailData.body }
              }
            }
          }).promise();
          console.log('✅ Email sent via AWS SES');
        } else {
          console.warn('AWS credentials not configured, email logged only');
        }
        break;
        
      case 'smtp':
        // Generic SMTP integration
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
          const nodemailer = require('nodemailer');
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
          });
          
          await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@propertyai.com',
            to: emailData.to,
            subject: emailData.subject,
            text: emailData.body,
            html: emailData.html || emailData.body
          });
          console.log('✅ Email sent via SMTP');
        } else {
          console.warn('SMTP credentials not configured, email logged only');
        }
        break;
        
      default:
        // Development mode - just log
        console.log('📧 [DEV MODE] Email:', emailData);
        console.log('To enable real emails, set EMAIL_PROVIDER to sendgrid, ses, or smtp');
    }
    
    logNotification({ type: 'email', ...emailData, status: 'sent' });
    return { success: true };
  } catch (e) {
    console.error('Send email notification failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Log notification for analytics
 * @param {object} notificationData
 */
function logNotification(notificationData) {
  try {
    const logs = JSON.parse(localStorage.getItem(NOTIFICATION_LOG_KEY) || '[]');
    logs.push({
      ...notificationData,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(NOTIFICATION_LOG_KEY, JSON.stringify(logs.slice(-500)));
  } catch (e) {
    console.error('Log notification failed:', e);
  }
}

// Helper functions (stubs - replace with actual database queries in production)
function getLeadById(leadId) {
  // In production, fetch from database
  // Example: return await db.leads.findById(leadId);
  return null;
}

function getProviderPhone(providerId) {
  // In production, fetch from database
  // Example: const provider = await db.providers.findById(providerId);
  // return provider?.phone;
  return null;
}

export default {
  scheduleNoContactNotification,
  cancelNoContactNotification,
  notifyClientKycPending,
  notifyClientPaymentPending,
  notifyNegotiationStarted,
  notifyPendingApproval,
  notifyProvider,
  sendEmailNotification
};
