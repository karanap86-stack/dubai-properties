// CRM policy enforcement logic
module.exports = {
  // Enforce all document uploads and financial transactions via CRM only
  enforceInSystemOnly(req, res, next) {
    // Check if the action is being attempted outside CRM UI/API
    // (e.g., via email, WhatsApp, or direct partner/developer upload)
    // In production, check request origin, user role, and action context
    if (!req.isFromCRM) {
      return res.status(403).json({
        error: 'All document uploads and financial transactions must be performed through the official CRM system.'
      });
    }
    next();
  },

  // Notify clients to use CRM for all official actions
  notifyClientPolicy(client) {
    // In production, send email/SMS/notification
    console.log(`Notify ${client.email}: Please use our CRM for all document uploads and payments. Do not share documents or make payments outside the system for your security.`);
  },

  // Log and flag any bypass attempts
  logBypassAttempt(user, action) {
    // In production, write to audit log and notify admin
    console.warn(`Bypass attempt by ${user.email}: ${action}`);
  }
};
