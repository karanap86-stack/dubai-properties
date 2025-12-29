/**
 * EstatelyticAI - Service Provider Invitation System (DEMO)
 * Viral Onboarding - Client invites their own service providers
 * 
 * INVESTOR DEMO - Functional Prototype
 */

const { v4: uuidv4 } = require('uuid');

// =============================================================================
// SERVICE PROVIDER INVITATION SERVICE
// =============================================================================

class ServiceProviderInvitationService {
  constructor() {
    this.invitations = new Map(); // In-memory store (use database in production)
    this.serviceProviders = new Map();
    this.reminderScheduler = null;
  }

  /**
   * Client/Partner invites service provider (ULTRA-SIMPLE: 3 fields only)
   * @param {Object} data - Invitation data
   * @returns {Object} Invitation details
   */
  async sendInvitation(data) {
    const {
      sentBy, // client_id or partner_id
      sentByType, // 'client' or 'partner'
      sentByName, // Client/Partner name
      providerName, // Service provider name
      providerEmail, // Service provider email
      providerPhone, // Service provider phone
      category, // 'lawyer', 'ca', 'inspector', etc.
      transaction, // Optional: linked transaction_id
      property // Optional: property details
    } = data;

    // Generate invitation
    const invitation = {
      id: `INV_${uuidv4().substring(0, 8).toUpperCase()}`,
      sentBy,
      sentByType,
      sentByName,
      sentTo: providerEmail,
      providerName,
      providerPhone,
      category,
      transaction,
      property,
      status: 'pending', // pending, opened, clicked, accepted, expired
      sentAt: new Date().toISOString(),
      openedAt: null,
      clickedAt: null,
      joinedAt: null,
      remindersSent: 0,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      incentive: sentByType === 'partner' ? '6 months free' : '3 months free'
    };

    // Store invitation
    this.invitations.set(invitation.id, invitation);

    // Send email (simulated)
    await this.sendInvitationEmail(invitation);

    // Send WhatsApp (simulated)
    await this.sendInvitationWhatsApp(invitation);

    // Schedule reminders
    this.scheduleReminders(invitation.id);

    return {
      success: true,
      invitationId: invitation.id,
      message: `Invitation sent to ${providerName} (${providerEmail})`,
      expiresAt: invitation.expiresAt
    };
  }

  /**
   * Send invitation email (template-based)
   */
  async sendInvitationEmail(invitation) {
    const emailTemplate = `
Subject: ${invitation.sentByName} invited you to work on their property transaction

Hi ${invitation.providerName},

Good news! ${invitation.sentByName} wants to work with you on their ${invitation.property ? `property purchase (${invitation.property})` : 'real estate transaction'}.

Transaction Details:
- Property: ${invitation.property || 'Details available after signup'}
- Service Needed: ${this.getCategoryLabel(invitation.category)}
- Expected Timeline: Next 15 days

Why join EstatelyticAI?

✅ First ${invitation.incentive} (₹${invitation.sentByType === 'partner' ? '30,000' : '15,000'} value)
✅ All communication, documents, payments in one place
✅ Get paid faster via escrow (5-day payout)
✅ Access to 500+ partners and 400+ developers
✅ Works on mobile (no computer needed)

[JOIN NOW - 2 MIN SIGNUP] https://estatelyticai.com/signup?invite=${invitation.id}

[Learn More] https://estatelyticai.com/service-providers

This is a real transaction waiting for you. Sign up now to start working.

Thanks,
EstatelyticAI Team

P.S. ${invitation.sentByName} is waiting. The faster you join, the faster you get the work.

---
[Unsubscribe] | [Privacy Policy]
    `;

    // Simulate email send (use SendGrid/AWS SES in production)
    console.log('[EMAIL SENT]', invitation.sentTo);
    console.log(emailTemplate);

    return { sent: true, channel: 'email' };
  }

  /**
   * Send WhatsApp invitation (higher open rate)
   */
  async sendInvitationWhatsApp(invitation) {
    const whatsappMessage = `
Hi ${invitation.providerName}! 👋

${invitation.sentByName} wants to hire you for their property transaction.

Property: ${invitation.property || 'Details after signup'}
Service: ${this.getCategoryLabel(invitation.category)}
Timeline: Next 15 days

Join EstatelyticAI to handle this transaction:
• First ${invitation.incentive}
• All documents, payments in one place
• Get paid in 5 days via escrow

Quick signup (2 mins): https://estatelyticai.com/signup?invite=${invitation.id}

Your client is waiting! 🏠
    `;

    // Simulate WhatsApp send (use Meta BSP API in production)
    console.log('[WHATSAPP SENT]', invitation.providerPhone);
    console.log(whatsappMessage);

    return { sent: true, channel: 'whatsapp' };
  }

  /**
   * Schedule auto-reminders (Day 2, Day 5)
   */
  scheduleReminders(invitationId) {
    // Day 2 reminder
    setTimeout(() => {
      this.sendReminder(invitationId, 1);
    }, 2 * 24 * 60 * 60 * 1000); // 2 days

    // Day 5 reminder
    setTimeout(() => {
      this.sendReminder(invitationId, 2);
    }, 5 * 24 * 60 * 60 * 1000); // 5 days
  }

  /**
   * Send reminder email
   */
  async sendReminder(invitationId, reminderNumber) {
    const invitation = this.invitations.get(invitationId);
    
    if (!invitation || invitation.status === 'accepted') {
      return; // Already joined or doesn't exist
    }

    let subject, body;

    if (reminderNumber === 1) {
      subject = `Reminder: ${invitation.sentByName} is waiting for you`;
      body = `Hi ${invitation.providerName},

${invitation.sentByName} invited you to work on their property transaction 2 days ago.

They're still waiting for you to join EstatelyticAI.

⏰ Join now to start working: https://estatelyticai.com/signup?invite=${invitation.id}

Benefits:
• First ${invitation.incentive}
• 5-day payouts via escrow
• All tools in one place

Don't miss this opportunity!`;
    } else {
      subject = `Last chance: ${invitation.sentByName}'s transaction is moving forward`;
      body = `Hi ${invitation.providerName},

This is your final reminder. ${invitation.sentByName} needs a ${this.getCategoryLabel(invitation.category)} for their property transaction.

If you don't join in the next 2 days, they'll work with another service provider on our platform.

⏰ Last chance: https://estatelyticai.com/signup?invite=${invitation.id}

Sign up takes 2 minutes. Don't lose this client!`;
    }

    console.log(`[REMINDER ${reminderNumber}]`, invitation.sentTo);
    console.log(`Subject: ${subject}`);
    console.log(body);

    invitation.remindersSent++;
    this.invitations.set(invitationId, invitation);
  }

  /**
   * Track email opened (via tracking pixel)
   */
  trackEmailOpen(invitationId) {
    const invitation = this.invitations.get(invitationId);
    if (invitation && !invitation.openedAt) {
      invitation.openedAt = new Date().toISOString();
      invitation.status = 'opened';
      this.invitations.set(invitationId, invitation);
    }
  }

  /**
   * Track link clicked
   */
  trackLinkClick(invitationId) {
    const invitation = this.invitations.get(invitationId);
    if (invitation && !invitation.clickedAt) {
      invitation.clickedAt = new Date().toISOString();
      invitation.status = 'clicked';
      this.invitations.set(invitationId, invitation);
    }
  }

  /**
   * Service provider accepts invitation (signs up)
   */
  async acceptInvitation(invitationId, providerData) {
    const invitation = this.invitations.get(invitationId);
    
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status === 'accepted') {
      throw new Error('Invitation already accepted');
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      throw new Error('Invitation expired');
    }

    // Create service provider account
    const provider = {
      id: `SP_${uuidv4().substring(0, 8).toUpperCase()}`,
      name: invitation.providerName,
      email: invitation.sentTo,
      phone: invitation.providerPhone,
      category: invitation.category,
      ...providerData, // Additional data from signup form
      joinedAt: new Date().toISOString(),
      invitedBy: invitation.sentBy,
      freeMonths: invitation.sentByType === 'partner' ? 6 : 3,
      subscriptionStartsAt: new Date(Date.now() + (invitation.sentByType === 'partner' ? 6 : 3) * 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    this.serviceProviders.set(provider.id, provider);

    // Update invitation
    invitation.status = 'accepted';
    invitation.joinedAt = new Date().toISOString();
    invitation.serviceProviderId = provider.id;
    this.invitations.set(invitationId, invitation);

    // Auto-link to transaction (if specified)
    if (invitation.transaction) {
      await this.linkToTransaction(provider.id, invitation.transaction);
    }

    // Notify inviter
    await this.notifyInviter(invitation, provider);

    return {
      success: true,
      providerId: provider.id,
      message: `Welcome to EstatelyticAI! You have ${provider.freeMonths} months free.`,
      linkedTransaction: invitation.transaction
    };
  }

  /**
   * Link service provider to transaction
   */
  async linkToTransaction(providerId, transactionId) {
    console.log(`[LINKED] Provider ${providerId} linked to transaction ${transactionId}`);
    // In production: Update transaction record, notify all parties
  }

  /**
   * Notify inviter that provider joined
   */
  async notifyInviter(invitation, provider) {
    const notification = {
      to: invitation.sentBy,
      type: 'service_provider_joined',
      message: `${provider.name} has joined EstatelyticAI and is ready to work on your transaction!`,
      providerName: provider.name,
      category: provider.category,
      transaction: invitation.transaction
    };

    console.log('[NOTIFICATION]', notification);
    // In production: Send push notification, email, SMS
  }

  /**
   * Suggest alternative providers (if invited provider doesn't join within 7 days)
   */
  async suggestAlternatives(invitationId) {
    const invitation = this.invitations.get(invitationId);
    
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    // Find alternative providers in same category
    const alternatives = Array.from(this.serviceProviders.values())
      .filter(sp => sp.category === invitation.category)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);

    return {
      originalProvider: invitation.providerName,
      status: invitation.status,
      alternatives: alternatives.map(sp => ({
        id: sp.id,
        name: sp.name,
        category: sp.category,
        rating: sp.rating || 4.5,
        completedJobs: sp.completedJobs || 20,
        pricing: sp.pricing || '₹5,000'
      }))
    };
  }

  /**
   * Get category label (human-readable)
   */
  getCategoryLabel(category) {
    const labels = {
      lawyer: 'Sale deed drafting + registration',
      ca: 'Tax filing + capital gains calculation',
      inspector: 'Property inspection + structural survey',
      architect: 'Renovation plans + building permits',
      interior_designer: 'Interior design + execution',
      home_loan: 'Home loan assistance',
      valuer: 'Property valuation certificate',
      insurance: 'Home insurance',
      packers: 'Moving & packing services',
      utilities: 'Utility connection setup',
      cleaning: 'Deep cleaning before move-in',
      property_management: 'Rental property management',
      maintenance: 'Ongoing maintenance services'
    };

    return labels[category] || category;
  }

  /**
   * Get invitation analytics (for inviter dashboard)
   */
  getAnalytics(userId) {
    const userInvitations = Array.from(this.invitations.values())
      .filter(inv => inv.sentBy === userId);

    return {
      total: userInvitations.length,
      pending: userInvitations.filter(inv => inv.status === 'pending').length,
      opened: userInvitations.filter(inv => inv.status === 'opened').length,
      clicked: userInvitations.filter(inv => inv.status === 'clicked').length,
      accepted: userInvitations.filter(inv => inv.status === 'accepted').length,
      expired: userInvitations.filter(inv => new Date() > new Date(inv.expiresAt) && inv.status !== 'accepted').length,
      conversionRate: (userInvitations.filter(inv => inv.status === 'accepted').length / userInvitations.length * 100).toFixed(1) + '%'
    };
  }
}

// =============================================================================
// DEMO USAGE
// =============================================================================

async function demoInvitationSystem() {
  const invitationService = new ServiceProviderInvitationService();

  console.log('='.repeat(80));
  console.log('EstatelyticAI - Service Provider Invitation System (DEMO)');
  console.log('='.repeat(80));
  console.log();

  // Scenario 1: Client invites their lawyer
  console.log('📧 SCENARIO 1: Client invites their own lawyer');
  console.log('-'.repeat(80));
  
  const invitation1 = await invitationService.sendInvitation({
    sentBy: 'CLIENT_12345',
    sentByType: 'client',
    sentByName: 'Amit Patel',
    providerName: 'Adv. Ramesh Kumar',
    providerEmail: 'ramesh@kumarlaw.com',
    providerPhone: '+919876543210',
    category: 'lawyer',
    transaction: 'TXN_456',
    property: '2BHK Apartment, Bandra, Mumbai'
  });

  console.log('✅ Invitation sent:', invitation1);
  console.log();

  // Scenario 2: Partner invites their CA (gets 6 months free)
  console.log('📧 SCENARIO 2: Partner invites their preferred CA');
  console.log('-'.repeat(80));
  
  const invitation2 = await invitationService.sendInvitation({
    sentBy: 'PARTNER_67890',
    sentByType: 'partner',
    sentByName: 'Priya Sharma (Partner)',
    providerName: 'CA Suresh Mehta',
    providerEmail: 'suresh@mehtaca.com',
    providerPhone: '+919123456789',
    category: 'ca',
    transaction: 'TXN_789',
    property: '3BHK Villa, Whitefield, Bengaluru'
  });

  console.log('✅ Invitation sent:', invitation2);
  console.log();

  // Simulate lawyer accepting invitation
  console.log('🎉 SCENARIO 3: Lawyer accepts invitation');
  console.log('-'.repeat(80));

  const acceptance = await invitationService.acceptInvitation(invitation1.invitationId, {
    barCouncilNumber: 'BAR/MH/2010/12345',
    services: ['sale_deed', 'registration', 'documentation'],
    pricing: '₹5,000 per transaction',
    experience: '15 years'
  });

  console.log('✅ Provider joined:', acceptance);
  console.log();

  // Analytics
  console.log('📊 ANALYTICS: Client\'s invitation performance');
  console.log('-'.repeat(80));

  const analytics = invitationService.getAnalytics('CLIENT_12345');
  console.log('Analytics:', analytics);
  console.log();

  // Suggest alternatives (if provider doesn't join)
  console.log('🔄 SCENARIO 4: Suggest alternatives (if invited provider doesn\'t join)');
  console.log('-'.repeat(80));

  // Add some dummy service providers
  invitationService.serviceProviders.set('SP_001', {
    id: 'SP_001',
    name: 'Adv. Priya Sharma',
    category: 'lawyer',
    rating: 4.8,
    completedJobs: 50,
    pricing: '₹4,500'
  });

  invitationService.serviceProviders.set('SP_002', {
    id: 'SP_002',
    name: 'Adv. Suresh Patel',
    category: 'lawyer',
    rating: 4.6,
    completedJobs: 30,
    pricing: '₹5,500'
  });

  const alternatives = await invitationService.suggestAlternatives(invitation2.invitationId);
  console.log('Alternative Providers:', alternatives);
  console.log();

  console.log('='.repeat(80));
  console.log('✅ DEMO COMPLETE - Viral onboarding system functional!');
  console.log('='.repeat(80));
}

// Run demo
if (require.main === module) {
  demoInvitationSystem().catch(console.error);
}

module.exports = { ServiceProviderInvitationService };
