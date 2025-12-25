// Notification Service: Handles delayed triggers and admin alerts
// Usage: import { scheduleNoContactNotification, cancelNoContactNotification } from './notificationService'

let noContactTimeout = null;

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
  const message = `Client visited but did not proceed.\nDetails: ${JSON.stringify(clientDetails)}\nStatus: visited but didn’t proceed.`;
  try {
    await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: '+917028923314', message, isNoContact: true })
    });
  } catch (e) {
    console.error('Failed to send no-contact WhatsApp notification', e);
  }
}
