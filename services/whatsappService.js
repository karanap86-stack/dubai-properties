// whatsappService.js
// Native WhatsApp messaging integration using Twilio WhatsApp API or WhatsApp Business API

import twilio from 'twilio';

const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const WHATSAPP_FROM = process.env.WHATSAPP_FROM || 'whatsapp:+14155238886'; // Twilio Sandbox number
const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

/**
 * Send a WhatsApp message to a client
 * @param {string} to - Client's WhatsApp number in E.164 format with 'whatsapp:' prefix
 * @param {string} message - Text message to send
 * @param {object} options - Additional options (mediaUrl for images/videos, etc.)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendWhatsAppMessage(to, message, options = {}) {
  try {
    // Ensure 'whatsapp:' prefix
    const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    const messageData = {
      from: WHATSAPP_FROM,
      to: toNumber,
      body: message
    };
    
    // Add media if provided
    if (options.mediaUrl) {
      messageData.mediaUrl = Array.isArray(options.mediaUrl) ? options.mediaUrl : [options.mediaUrl];
    }
    
    const result = await client.messages.create(messageData);
    
    return {
      success: true,
      messageId: result.sid,
      status: result.status,
      to: result.to
    };
  } catch (e) {
    console.error('WhatsApp send failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Send a templated WhatsApp message (for WhatsApp Business API)
 * @param {string} to - Client's WhatsApp number
 * @param {string} templateName - Name of approved template
 * @param {object} templateParams - Parameters for the template
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendWhatsAppTemplate(to, templateName, templateParams = {}) {
  try {
    const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    // For Twilio Content API (templates)
    const message = await client.messages.create({
      from: WHATSAPP_FROM,
      to: toNumber,
      contentSid: templateName, // Content Template SID from Twilio
      contentVariables: JSON.stringify(templateParams)
    });
    
    return {
      success: true,
      messageId: message.sid,
      status: message.status
    };
  } catch (e) {
    console.error('WhatsApp template send failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Handle incoming WhatsApp messages (webhook handler)
 * @param {object} req - Express request object containing webhook data
 * @returns {object} Processed message data
 */
export function handleIncomingWhatsApp(req) {
  try {
    const { From, To, Body, MediaUrl0, MessageSid, ProfileName } = req.body;
    
    // Clean phone numbers
    const clientNumber = From.replace('whatsapp:', '');
    const recipientNumber = To.replace('whatsapp:', '');
    
    // Log incoming message
    const messageData = {
      messageId: MessageSid,
      from: clientNumber,
      to: recipientNumber,
      body: Body,
      mediaUrl: MediaUrl0,
      profileName: ProfileName,
      timestamp: new Date().toISOString(),
      direction: 'inbound'
    };
    
    // TODO: Store in database for conversation history
    // TODO: Trigger AI agent response or route to human agent
    
    return {
      success: true,
      message: messageData
    };
  } catch (e) {
    console.error('Handle incoming WhatsApp failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Send bulk WhatsApp messages (for campaigns)
 * @param {Array} recipients - Array of {to, message, mediaUrl} objects
 * @param {number} delayMs - Delay between messages to avoid rate limits
 * @returns {Promise<{success: boolean, sent: number, failed: number, results: Array}>}
 */
export async function sendBulkWhatsApp(recipients, delayMs = 1000) {
  const results = [];
  let sent = 0;
  let failed = 0;
  
  for (const recipient of recipients) {
    try {
      const result = await sendWhatsAppMessage(
        recipient.to,
        recipient.message,
        { mediaUrl: recipient.mediaUrl }
      );
      
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
      
      results.push({
        to: recipient.to,
        ...result
      });
      
      // Delay to respect rate limits
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (e) {
      failed++;
      results.push({
        to: recipient.to,
        success: false,
        error: e.message
      });
    }
  }
  
  return {
    success: true,
    sent,
    failed,
    total: recipients.length,
    results
  };
}

/**
 * Log WhatsApp conversation for analytics and compliance
 * @param {object} messageData - Message details to log
 */
export function logWhatsAppConversation(messageData) {
  try {
    // TODO: Store in database for conversation history and analytics
    // For now, just console log
    console.log('WhatsApp conversation:', messageData);
    return { success: true };
  } catch (e) {
    console.error('Log WhatsApp conversation failed:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Get WhatsApp conversation history for a client
 * @param {string} clientNumber - Client's phone number
 * @param {number} limit - Number of messages to retrieve
 * @returns {Promise<Array>}
 */
export async function getWhatsAppHistory(clientNumber, limit = 50) {
  try {
    const messages = await client.messages.list({
      from: `whatsapp:${clientNumber}`,
      limit
    });
    
    return {
      success: true,
      messages: messages.map(m => ({
        messageId: m.sid,
        from: m.from,
        to: m.to,
        body: m.body,
        status: m.status,
        dateSent: m.dateSent,
        direction: m.direction
      }))
    };
  } catch (e) {
    console.error('Get WhatsApp history failed:', e);
    return { success: false, error: e.message, messages: [] };
  }
}

export default {
  sendWhatsAppMessage,
  sendWhatsAppTemplate,
  handleIncomingWhatsApp,
  sendBulkWhatsApp,
  logWhatsAppConversation,
  getWhatsAppHistory
};
