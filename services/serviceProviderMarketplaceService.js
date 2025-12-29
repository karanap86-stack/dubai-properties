/**
 * © 2025 EstatelyticAI. All Rights Reserved.
 * Confidential and Proprietary Information.
 * 
 * EstatelyticAI - Service Provider Marketplace System (DEMO)
 * 
 * ═══════════════════════════════════════════════════════════════════
 *     INDIA'S PROPERTY UPI: TRANSPARENT, TRACKED, TRUSTED
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Two-Tier Provider Model:
 * - TYPE 1 (Integrated): Legal, Financial services (₹5K/month subscription, full CRM integration)
 * - TYPE 2 (Marketplace): Interiors, Packers, Vastu, etc. (0 subscription, 25% commission on deals)
 *
 * INVESTOR DEMO - Lead Auction System
 * Every provider tracked | Every transaction transparent | Zero fraud
const { v4: uuidv4 } = require('uuid');

// =============================================================================
// SERVICE PROVIDER TYPES
// =============================================================================

const PROVIDER_TYPES = {
  TYPE_1_INTEGRATED: {
    categories: ['lawyer', 'notary', 'ca', 'home_loan', 'insurance', 'property_valuer', 'inspector'],
    subscription: 5000, // ₹5,000/month
    crmIntegrated: true,
    leadAssignment: 'auto', // Auto-assigned based on transaction
    commission: 0 // No commission (already paying subscription)
  },
  TYPE_2_MARKETPLACE: {
    categories: [
      'interior_designer', 'architect', 'packers_movers', 'home_cleaning', 
      'vastu', 'utility_setup', 'property_management', 'maintenance', 
      'furniture', 'appliances', 'photographer', 'videographer', 'drone_operator'
    ],
    subscription: 0, // Free to join
    crmIntegrated: false,
    leadAssignment: 'auction', // Auction-based (providers compete)
    commission: 0.25 // 25% commission on deal value
  }
};

// STANDARDIZED PHOTOGRAPHY PRICING (Platform Guidelines)
// Solves the Sypne problem: Photography is variable cost, can't be bundled in subscription
const PHOTOGRAPHY_PACKAGES = {
  BASIC: {
    price: 4000, // ₹4,000 per property
    includes: ['20-30 professional photos', 'Basic editing', 'HDR processing', '24-hour delivery'],
    photographerEarning: 3000, // ₹3,000 (75%)
    platformCommission: 1000 // ₹1,000 (25%)
  },
  PREMIUM: {
    price: 12000, // ₹12,000 per property
    includes: ['40-50 photos', 'Drone aerial shots', '3D walkthrough', 'Twilight shots', 'Professional editing', '48-hour delivery'],
    photographerEarning: 9000, // ₹9,000 (75%)
    platformCommission: 3000 // ₹3,000 (25%)
  },
  ULTRA: {
    price: 40000, // ₹40,000 per property
    includes: ['100+ photos', 'Cinematic video (2-3 min)', 'VR 360° tour', 'Drone 4K video', 'Professional staging guidance', 'Same-day delivery', '1 year hosting'],
    photographerEarning: 30000, // ₹30,000 (75%)
    platformCommission: 10000 // ₹10,000 (25%)
  }
};

// =============================================================================
// SERVICE PROVIDER MARKETPLACE SERVICE
// =============================================================================

class ServiceProviderMarketplaceService {
  constructor() {
    this.providers = new Map(); // All providers (Type 1 + Type 2)
    this.leads = new Map(); // Hot leads for Type 2 providers
    this.auctions = new Map(); // Active auctions
    this.proposals = new Map(); // Provider proposals
    this.transactions = new Map(); // Completed transactions
    this.ratings = new Map(); // Provider ratings
  }

  // ===========================================================================
  // PROVIDER ONBOARDING (Type 1 + Type 2)
  // ===========================================================================

  /**
   * Onboard service provider (auto-detect Type 1 vs Type 2 based on category)
   */
  async onboardProvider(data) {
    const {
      name,
      category,
      email,
      phone,
      businessName,
      serviceAreas, // ['Mumbai', 'Pune'] for local, ['Pan-India'] for national
      portfolio, // Array of {title, description, images, cost, rating}
      bankDetails, // {accountNumber, ifsc, upiId} - Required for Type 2
      pricing, // Starting price range
      certifications // Optional: licenses, certifications
    } = data;

    // Determine provider type
    const providerType = this.getProviderType(category);
    
    const provider = {
      id: `PROV_${uuidv4().substring(0, 8).toUpperCase()}`,
      name,
      category,
      email,
      phone,
      businessName,
      type: providerType,
      serviceAreas,
      portfolio: portfolio || [],
      bankDetails: providerType === 'TYPE_2_MARKETPLACE' ? bankDetails : null,
      pricing,
      certifications: certifications || [],
      
      // Subscription details
      subscription: PROVIDER_TYPES[providerType].subscription,
      subscriptionStatus: providerType === 'TYPE_1_INTEGRATED' ? 'active' : 'free',
      
      // Performance metrics
      rating: 0,
      totalReviews: 0,
      completedProjects: 0,
      activeProjects: 0,
      totalEarnings: 0,
      
      // Rating breakdown (service-specific)
      ratingMetrics: this.getDefaultRatingMetrics(category),
      
      // Status
      status: 'pending_verification', // pending_verification, active, suspended
      joinedAt: new Date().toISOString(),
      verifiedAt: null
    };

    this.providers.set(provider.id, provider);

    console.log(`[PROVIDER ONBOARDED] ${name} (${category}) - Type: ${providerType}`);
    console.log(`  Subscription: ₹${provider.subscription}/month`);
    console.log(`  Service Areas: ${serviceAreas.join(', ')}`);

    return provider;
  }

  /**
   * Get provider type based on category
   */
  getProviderType(category) {
    if (PROVIDER_TYPES.TYPE_1_INTEGRATED.categories.includes(category)) {
      return 'TYPE_1_INTEGRATED';
    } else if (PROVIDER_TYPES.TYPE_2_MARKETPLACE.categories.includes(category)) {
      return 'TYPE_2_MARKETPLACE';
    }
    throw new Error(`Unknown category: ${category}`);
  }

  /**
   * Get default rating metrics based on category
   */
  getDefaultRatingMetrics(category) {
    const commonMetrics = {
      professionalism: 0,
      communication: 0,
      timelineAdherence: 0,
      clientSatisfaction: 0
    };

    // Category-specific metrics
    const categoryMetrics = {
      interior_designer: { portfolioQuality: 0, budgetAdherence: 0, postCompletionSupport: 0 },
      architect: { designQuality: 0, technicalKnowledge: 0, approvalSupport: 0 },
      packers_movers: { damageFreeDelivery: 0, punctuality: 0, packingQuality: 0 },
      home_cleaning: { cleaningQuality: 0, ecoFriendlyProducts: 0, punctuality: 0 },
      vastu: { knowledgeDepth: 0, practicalSolutions: 0, followUpSupport: 0 },
      lawyer: { legalKnowledge: 0, documentAccuracy: 0, responsiveness: 0 },
      ca: { taxKnowledge: 0, loanApprovalRate: 0, responsiveness: 0 },
      inspector: { inspectionThoroughness: 0, reportClarity: 0, technicalKnowledge: 0 }
    };

    return {
      ...commonMetrics,
      ...(categoryMetrics[category] || {})
    };
  }

  // ===========================================================================
  // LEAD AUCTION SYSTEM (Type 2 Marketplace Providers Only)
  // ===========================================================================

  /**
   * Client posts a job (creates hot lead for Type 2 providers)
   */
  async createLead(data) {
    const {
      clientId,
      clientName,
      category, // 'interior_designer', 'packers_movers', etc.
      propertyId,
      propertyAddress,
      propertySize,
      budget, // {min, max}
      requirements, // Description of what client needs
      timeline, // Expected start date
      preferredAreas // Service areas where provider should operate
    } = data;

    // Verify this is a Type 2 category
    const providerType = this.getProviderType(category);
    if (providerType !== 'TYPE_2_MARKETPLACE') {
      throw new Error(`Category ${category} is not a marketplace category`);
    }

    const lead = {
      id: `LEAD_${uuidv4().substring(0, 8).toUpperCase()}`,
      clientId,
      clientName,
      category,
      propertyId,
      propertyAddress,
      propertySize,
      budget,
      requirements,
      timeline,
      preferredAreas,
      
      // Auction details
      status: 'open', // open, closed, awarded, completed
      postedAt: new Date().toISOString(),
      closesAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      
      // Engagement
      views: 0,
      proposals: [],
      shortlistedProposals: [], // Top 3-5 providers
      awardedTo: null,
      
      // Platform metrics
      isPanIndia: preferredAreas.includes('Pan-India'),
      isUrgent: false
    };

    this.leads.set(lead.id, lead);

    // Notify matching providers
    await this.notifyMatchingProviders(lead);

    console.log(`[LEAD CREATED] ${category} job in ${propertyAddress}`);
    console.log(`  Budget: ₹${budget.min}L - ₹${budget.max}L`);
    console.log(`  Closes in: 24 hours`);

    return lead;
  }

  /**
   * Notify providers who match the lead criteria
   */
  async notifyMatchingProviders(lead) {
    const matchingProviders = [];

    for (const provider of this.providers.values()) {
      // Check if provider matches category
      if (provider.category !== lead.category) continue;
      
      // Check if provider is Type 2
      if (provider.type !== 'TYPE_2_MARKETPLACE') continue;
      
      // Check if provider is active
      if (provider.status !== 'active') continue;
      
      // Check if provider serves this area
      const servesArea = lead.isPanIndia 
        ? provider.serviceAreas.includes('Pan-India')
        : provider.serviceAreas.some(area => lead.preferredAreas.includes(area));
      
      if (servesArea) {
        matchingProviders.push(provider);
      }
    }

    console.log(`  → Notified ${matchingProviders.length} matching providers`);
    
    // In production: Send WhatsApp/Email notifications
    // await communicationService.sendWhatsApp({...})
    
    return matchingProviders;
  }

  /**
   * Provider submits proposal for a lead
   */
  async submitProposal(data) {
    const {
      leadId,
      providerId,
      proposedBudget,
      timeline, // In weeks
      approach, // Design philosophy, methodology
      portfolioImages, // 3-5 images from their portfolio
      references // Previous client references
    } = data;

    const lead = this.leads.get(leadId);
    const provider = this.providers.get(providerId);

    if (!lead) throw new Error('Lead not found');
    if (!provider) throw new Error('Provider not found');
    if (lead.status !== 'open') throw new Error('Lead is closed');

    const proposal = {
      id: `PROP_${uuidv4().substring(0, 8).toUpperCase()}`,
      leadId,
      providerId,
      providerName: provider.name,
      providerRating: provider.rating,
      providerReviews: provider.totalReviews,
      providerCompletedProjects: provider.completedProjects,
      
      proposedBudget,
      timeline,
      approach,
      portfolioImages,
      references,
      
      submittedAt: new Date().toISOString(),
      status: 'pending', // pending, shortlisted, awarded, rejected
      
      // Client engagement
      viewedByClient: false,
      viewedAt: null
    };

    this.proposals.set(proposal.id, proposal);
    
    // Add to lead's proposals
    lead.proposals.push(proposal.id);
    this.leads.set(leadId, lead);

    console.log(`[PROPOSAL SUBMITTED] ${provider.name} → Lead ${leadId}`);
    console.log(`  Budget: ₹${proposedBudget}L, Timeline: ${timeline} weeks`);

    return proposal;
  }

  /**
   * Client shortlists top 3-5 proposals
   */
  async shortlistProposals(leadId, proposalIds) {
    const lead = this.leads.get(leadId);
    
    if (!lead) throw new Error('Lead not found');
    if (proposalIds.length > 5) throw new Error('Can shortlist max 5 proposals');

    lead.shortlistedProposals = proposalIds;
    lead.status = 'shortlisting';
    this.leads.set(leadId, lead);

    // Update proposal statuses
    for (const proposalId of proposalIds) {
      const proposal = this.proposals.get(proposalId);
      proposal.status = 'shortlisted';
      this.proposals.set(proposalId, proposal);
    }

    console.log(`[PROPOSALS SHORTLISTED] Lead ${leadId}: ${proposalIds.length} providers shortlisted`);

    return lead;
  }

  /**
   * Client awards lead to a provider
   */
  async awardLead(leadId, proposalId) {
    const lead = this.leads.get(leadId);
    const proposal = this.proposals.get(proposalId);

    if (!lead) throw new Error('Lead not found');
    if (!proposal) throw new Error('Proposal not found');

    lead.status = 'awarded';
    lead.awardedTo = proposal.providerId;
    this.leads.set(leadId, lead);

    proposal.status = 'awarded';
    this.proposals.set(proposalId, proposal);

    // Update provider metrics
    const provider = this.providers.get(proposal.providerId);
    provider.activeProjects++;
    this.providers.set(provider.id, provider);

    console.log(`[LEAD AWARDED] Lead ${leadId} → ${provider.name}`);

    return { lead, proposal, provider };
  }

  // ===========================================================================
  // BILLING & COMMISSION SYSTEM (Type 2 Only)
  // ===========================================================================

  /**
   * Provider marks project as completed and submits invoice
   */
  async submitInvoice(data) {
    const {
      leadId,
      providerId,
      finalAmount, // Actual billed amount
      workCompletedDate,
      invoiceDetails, // Breakdown of costs
      clientApproved // true/false (client must approve)
    } = data;

    const lead = this.leads.get(leadId);
    const provider = this.providers.get(providerId);

    if (!lead) throw new Error('Lead not found');
    if (!provider) throw new Error('Provider not found');
    if (lead.awardedTo !== providerId) throw new Error('Lead not awarded to this provider');

    const transaction = {
      id: `TXN_${uuidv4().substring(0, 8).toUpperCase()}`,
      leadId,
      providerId,
      providerName: provider.name,
      clientId: lead.clientId,
      
      finalAmount,
      platformCommission: finalAmount * PROVIDER_TYPES.TYPE_2_MARKETPLACE.commission,
      providerEarnings: finalAmount * (1 - PROVIDER_TYPES.TYPE_2_MARKETPLACE.commission),
      
      invoiceDetails,
      workCompletedDate,
      clientApproved,
      
      status: clientApproved ? 'approved' : 'pending_approval',
      createdAt: new Date().toISOString(),
      paidAt: null
    };

    this.transactions.set(transaction.id, transaction);

    console.log(`[INVOICE SUBMITTED] ${provider.name} → ₹${finalAmount}L`);
    console.log(`  Platform Commission (25%): ₹${transaction.platformCommission.toFixed(2)}L`);
    console.log(`  Provider Earnings (75%): ₹${transaction.providerEarnings.toFixed(2)}L`);

    return transaction;
  }

  /**
   * Client approves invoice and payment is processed
   */
  async approveInvoice(transactionId) {
    const transaction = this.transactions.get(transactionId);
    
    if (!transaction) throw new Error('Transaction not found');

    transaction.status = 'approved';
    transaction.paidAt = new Date().toISOString();
    this.transactions.set(transactionId, transaction);

    // Update provider metrics
    const provider = this.providers.get(transaction.providerId);
    provider.activeProjects--;
    provider.completedProjects++;
    provider.totalEarnings += transaction.providerEarnings;
    this.providers.set(provider.id, provider);

    // Update lead status
    const lead = this.leads.get(transaction.leadId);
    lead.status = 'completed';
    this.leads.set(lead.id, lead);

    console.log(`[INVOICE APPROVED] Transaction ${transactionId} - ₹${transaction.providerEarnings.toFixed(2)}L paid to provider`);

    return transaction;
  }

  // ===========================================================================
  // RATING SYSTEM (Service-Specific)
  // ===========================================================================

  /**
   * Client rates provider after project completion
   */
  async rateProvider(data) {
    const {
      transactionId,
      providerId,
      overallRating, // 1-5 stars
      metrics, // Category-specific metrics (e.g., portfolioQuality, timelineAdherence)
      review, // Written review
      images // Optional: project images
    } = data;

    const provider = this.providers.get(providerId);
    
    if (!provider) throw new Error('Provider not found');

    const rating = {
      id: `RATING_${uuidv4().substring(0, 8).toUpperCase()}`,
      transactionId,
      providerId,
      overallRating,
      metrics,
      review,
      images: images || [],
      createdAt: new Date().toISOString()
    };

    this.ratings.set(rating.id, rating);

    // Update provider's rating
    const newTotalReviews = provider.totalReviews + 1;
    const newRating = ((provider.rating * provider.totalReviews) + overallRating) / newTotalReviews;
    
    provider.rating = parseFloat(newRating.toFixed(2));
    provider.totalReviews = newTotalReviews;

    // Update category-specific metrics
    for (const [metric, score] of Object.entries(metrics)) {
      if (provider.ratingMetrics[metric] !== undefined) {
        const currentScore = provider.ratingMetrics[metric];
        const newScore = ((currentScore * (provider.totalReviews - 1)) + score) / provider.totalReviews;
        provider.ratingMetrics[metric] = parseFloat(newScore.toFixed(2));
      }
    }

    this.providers.set(provider.id, provider);

    console.log(`[PROVIDER RATED] ${provider.name}: ${overallRating}/5 (${newTotalReviews} reviews)`);

    return { provider, rating };
  }

  // ===========================================================================
  // ANALYTICS & REPORTING
  // ===========================================================================

  /**
   * Get provider analytics (for provider portal)
   */
  getProviderAnalytics(providerId) {
    const provider = this.providers.get(providerId);
    
    if (!provider) throw new Error('Provider not found');

    // Get provider's transactions
    const providerTransactions = [];
    for (const txn of this.transactions.values()) {
      if (txn.providerId === providerId && txn.status === 'approved') {
        providerTransactions.push(txn);
      }
    }

    // Calculate monthly earnings
    const thisMonth = new Date().getMonth();
    const monthlyTransactions = providerTransactions.filter(txn => {
      const txnDate = new Date(txn.paidAt);
      return txnDate.getMonth() === thisMonth;
    });

    const monthlyEarnings = monthlyTransactions.reduce((sum, txn) => sum + txn.providerEarnings, 0);
    const monthlyCommission = monthlyTransactions.reduce((sum, txn) => sum + txn.platformCommission, 0);

    return {
      providerId: provider.id,
      name: provider.name,
      category: provider.category,
      type: provider.type,
      
      // Performance
      rating: provider.rating,
      totalReviews: provider.totalReviews,
      completedProjects: provider.completedProjects,
      activeProjects: provider.activeProjects,
      
      // Earnings
      totalEarnings: provider.totalEarnings,
      monthlyEarnings,
      monthlyCommission,
      
      // Rating breakdown
      ratingMetrics: provider.ratingMetrics,
      
      // Hot leads available
      hotLeads: this.getAvailableLeads(provider.category, provider.serviceAreas).length
    };
  }

  /**
   * Get available leads for a provider
   */
  getAvailableLeads(category, serviceAreas) {
    const availableLeads = [];

    for (const lead of this.leads.values()) {
      if (lead.category !== category) continue;
      if (lead.status !== 'open') continue;
      
      const servesArea = lead.isPanIndia 
        ? serviceAreas.includes('Pan-India')
        : serviceAreas.some(area => lead.preferredAreas.includes(area));
      
      if (servesArea) {
        availableLeads.push(lead);
      }
    }

    return availableLeads;
  }

  /**
   * Get platform marketplace analytics
   */
  getPlatformMarketplaceAnalytics() {
    const type2Providers = [];
    for (const provider of this.providers.values()) {
      if (provider.type === 'TYPE_2_MARKETPLACE') {
        type2Providers.push(provider);
      }
    }

    // Calculate commission revenue
    let totalCommissionRevenue = 0;
    for (const txn of this.transactions.values()) {
      if (txn.status === 'approved') {
        totalCommissionRevenue += txn.platformCommission;
      }
    }

    return {
      totalType2Providers: type2Providers.length,
      activeLeads: Array.from(this.leads.values()).filter(l => l.status === 'open').length,
      totalProposals: this.proposals.size,
      totalTransactions: this.transactions.size,
      totalCommissionRevenue: totalCommissionRevenue.toFixed(2),
      
      // Category breakdown
      providersByCategory: this.groupByCategory(type2Providers),
      
      // Top performers
      topProviders: type2Providers
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map(p => ({ name: p.name, category: p.category, rating: p.rating, projects: p.completedProjects }))
    };
  }

  groupByCategory(providers) {
    const groups = {};
    for (const provider of providers) {
      if (!groups[provider.category]) {
        groups[provider.category] = 0;
      }
      groups[provider.category]++;
    }
    return groups;
  }
}

// =============================================================================
// DEMO USAGE
// =============================================================================

async function demoMarketplaceSystem() {
  const marketplace = new ServiceProviderMarketplaceService();

  console.log('='.repeat(80));
  console.log('EstatelyticAI - Service Provider Marketplace System (DEMO)');
  console.log('Two-Tier Model: Type 1 (Integrated) + Type 2 (Marketplace)');
  console.log('='.repeat(80));
  console.log();

  // Scenario 1: Onboard Type 1 provider (Legal - Subscription based)
  console.log('📋 SCENARIO 1: Type 1 Provider Onboarding (Legal - Subscription)');
  console.log('-'.repeat(80));
  
  const lawyer = await marketplace.onboardProvider({
    name: 'Adv. Ramesh Iyer',
    category: 'lawyer',
    email: 'ramesh@lawfirm.com',
    phone: '+919876543210',
    businessName: 'Iyer & Associates',
    serviceAreas: ['Mumbai', 'Navi Mumbai'],
    pricing: '₹50K - ₹2L per transaction',
    certifications: ['Bar Council of Maharashtra']
  });
  console.log('✅ Lawyer onboarded with ₹5,000/month subscription');
  console.log();

  // Scenario 2: Onboard Type 2 provider (Interior Designer - Commission based)
  console.log('🎨 SCENARIO 2: Type 2 Provider Onboarding (Interior Designer - Marketplace)');
  console.log('-'.repeat(80));
  
  const designer1 = await marketplace.onboardProvider({
    name: 'Design Studio India',
    category: 'interior_designer',
    email: 'contact@designstudio.in',
    phone: '+919123456789',
    businessName: 'Design Studio India Pvt Ltd',
    serviceAreas: ['Mumbai', 'Pune'],
    portfolio: [
      { title: 'Modern Minimalist 2BHK', cost: 2.5, rating: 5.0 },
      { title: 'Luxury 3BHK', cost: 8.5, rating: 4.9 },
      { title: 'Complete Villa Interior', cost: 35, rating: 5.0 }
    ],
    bankDetails: {
      accountNumber: '1234567890',
      ifsc: 'HDFC0001234',
      upiId: 'designstudio@paytm'
    },
    pricing: '₹2.5L - ₹40L',
    certifications: ['IID Member', '15 years experience']
  });

  const designer2 = await marketplace.onboardProvider({
    name: 'Luxury Interiors Co',
    category: 'interior_designer',
    email: 'info@luxuryinteriors.com',
    phone: '+919988776655',
    businessName: 'Luxury Interiors Co',
    serviceAreas: ['Mumbai', 'Bengaluru', 'Delhi'],
    portfolio: [
      { title: 'Premium 4BHK Penthouse', cost: 45, rating: 5.0 },
      { title: 'Villa Renovation', cost: 28, rating: 4.8 }
    ],
    bankDetails: {
      accountNumber: '9876543210',
      ifsc: 'ICICI0005678',
      upiId: 'luxury@paytm'
    },
    pricing: '₹10L - ₹80L'
  });

  // Manually verify providers (in production: admin verification)
  designer1.status = 'active';
  designer2.status = 'active';
  marketplace.providers.set(designer1.id, designer1);
  marketplace.providers.set(designer2.id, designer2);
  
  console.log('✅ Interior designers onboarded with 0 subscription, 25% commission model');
  console.log();

  // Scenario 3: Client posts a job (creates hot lead)
  console.log('🔥 SCENARIO 3: Client Posts Interior Design Job');
  console.log('-'.repeat(80));
  
  const lead = await marketplace.createLead({
    clientId: 'CLIENT_12345',
    clientName: 'Rahul Sharma',
    category: 'interior_designer',
    propertyId: 'PROP_67890',
    propertyAddress: 'Skyline Residency, Bandra West, Mumbai',
    propertySize: '850 sq.ft',
    budget: { min: 5.5, max: 7 },
    requirements: 'Complete 2BHK interior - modern minimalist style, wood work, modular kitchen, false ceiling',
    timeline: 'Feb 2026',
    preferredAreas: ['Mumbai']
  });
  console.log();

  // Scenario 4: Providers submit proposals
  console.log('💬 SCENARIO 4: Providers Submit Proposals');
  console.log('-'.repeat(80));
  
  const proposal1 = await marketplace.submitProposal({
    leadId: lead.id,
    providerId: designer1.id,
    proposedBudget: 6.2,
    timeline: 6,
    approach: 'Modern minimalist with natural wood finishes. Modular kitchen with Italian hardware. LED lighting throughout.',
    portfolioImages: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
    references: ['Mr. Shah (Andheri)', 'Mrs. Patel (Juhu)']
  });

  const proposal2 = await marketplace.submitProposal({
    leadId: lead.id,
    providerId: designer2.id,
    proposedBudget: 6.8,
    timeline: 8,
    approach: 'Luxury modern interiors with imported fittings. Premium modular kitchen. Designer lighting.',
    portfolioImages: ['image4.jpg', 'image5.jpg', 'image6.jpg'],
    references: ['Mr. Ambani reference (Bandra)']
  });
  console.log();

  // Scenario 5: Client shortlists and awards
  console.log('🏆 SCENARIO 5: Client Shortlists & Awards');
  console.log('-'.repeat(80));
  
  await marketplace.shortlistProposals(lead.id, [proposal1.id, proposal2.id]);
  const award = await marketplace.awardLead(lead.id, proposal1.id);
  console.log();

  // Scenario 6: Project completion & invoice
  console.log('💰 SCENARIO 6: Project Completion & Billing');
  console.log('-'.repeat(80));
  
  const invoice = await marketplace.submitInvoice({
    leadId: lead.id,
    providerId: designer1.id,
    finalAmount: 6.5, // ₹6.5L actual billed
    workCompletedDate: '2026-03-15',
    invoiceDetails: {
      design: 0.5,
      materials: 4.2,
      labor: 1.5,
      supervision: 0.3
    },
    clientApproved: true
  });

  await marketplace.approveInvoice(invoice.id);
  console.log();

  // Scenario 7: Client rates provider
  console.log('⭐ SCENARIO 7: Client Rates Provider');
  console.log('-'.repeat(80));
  
  await marketplace.rateProvider({
    transactionId: invoice.id,
    providerId: designer1.id,
    overallRating: 5.0,
    metrics: {
      portfolioQuality: 9.5,
      timelineAdherence: 8.8,
      budgetAdherence: 9.0,
      clientSatisfaction: 9.2,
      postCompletionSupport: 8.5
    },
    review: 'Excellent work! Very professional team. Delivered on time and within budget. Highly recommend!',
    images: ['completed1.jpg', 'completed2.jpg', 'completed3.jpg']
  });
  console.log();

  // Scenario 8: Provider analytics
  console.log('📊 SCENARIO 8: Provider Analytics Dashboard');
  console.log('-'.repeat(80));
  
  const analytics = marketplace.getProviderAnalytics(designer1.id);
  console.log(JSON.stringify(analytics, null, 2));
  console.log();

  // Scenario 9: Platform marketplace analytics
  console.log('📈 SCENARIO 9: Platform Marketplace Analytics');
  console.log('-'.repeat(80));
  
  const platformAnalytics = marketplace.getPlatformMarketplaceAnalytics();
  console.log(JSON.stringify(platformAnalytics, null, 2));
  console.log();

  console.log('='.repeat(80));
  console.log('✅ DEMO COMPLETE - Marketplace System with Dual Provider Model!');
  console.log('   Type 1 (Integrated): ₹5K subscription, auto-assignment, CRM integration');
  console.log('   Type 2 (Marketplace): Free to join, 25% commission, lead auctions');
  console.log('='.repeat(80));
}

// Run demo
if (require.main === module) {
  demoMarketplaceSystem().catch(console.error);
}

module.exports = { ServiceProviderMarketplaceService, PROVIDER_TYPES, PHOTOGRAPHY_PACKAGES };
