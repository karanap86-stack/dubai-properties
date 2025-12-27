// crmService.js
// Service for integrating with multiple CRMs (Salesforce, HubSpot, and generic)


import axios from 'axios';

class CRMService {
  constructor() {
    this.providers = {
      salesforce: this.salesforceAPI.bind(this),
      hubspot: this.hubspotAPI.bind(this),
      // Add more providers as needed
    };
  }

  // Generic method to connect to any CRM
  async connect(provider, credentials) {
    if (this.providers[provider]) {
      return this.providers[provider](credentials);
    }
    throw new Error('Unsupported CRM provider');
  }

  // --- Salesforce Integration ---
  // credentials: { clientId, clientSecret, username, password, securityToken }
  async salesforceAPI(credentials) {
    // Authenticate with Salesforce (OAuth2 Password Grant)
    const tokenUrl = 'https://login.salesforce.com/services/oauth2/token';
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('client_id', credentials.clientId);
      params.append('client_secret', credentials.clientSecret);
      params.append('username', credentials.username);
      params.append('password', credentials.password + credentials.securityToken);
      const response = await axios.post(tokenUrl, params);
      const { access_token, instance_url } = response.data;
      return { status: 'connected', provider: 'Salesforce', access_token, instance_url };
    } catch (e) {
      return { status: 'error', provider: 'Salesforce', error: e.message };
    }
  }

  // Push a lead to Salesforce
  async pushLeadToSalesforce(access_token, instance_url, lead) {
    try {
      const url = `${instance_url}/services/data/v58.0/sobjects/Lead`;
      const response = await axios.post(url, lead, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      return { success: true, id: response.data.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Fetch updated leads from Salesforce
  async fetchUpdatedLeadsFromSalesforce(access_token, instance_url, lastSyncDate) {
    try {
      const soql = `SELECT Id, FirstName, LastName, Company, Status, Email, Phone, LastModifiedDate FROM Lead WHERE LastModifiedDate > ${lastSyncDate}`;
      const url = `${instance_url}/services/data/v58.0/query?q=${encodeURIComponent(soql)}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      return { success: true, records: response.data.records };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // --- HubSpot Integration ---
  // credentials: { apiKey }
  async hubspotAPI(credentials) {
    // Test HubSpot API key by fetching basic account info
    try {
      const url = `https://api.hubapi.com/integrations/v1/me?hapikey=${credentials.apiKey}`;
      const response = await axios.get(url);
      if (response.status === 200) {
        return { status: 'connected', provider: 'HubSpot', apiKey: credentials.apiKey };
      }
      return { status: 'error', provider: 'HubSpot', error: 'API key invalid' };
    } catch (e) {
      return { status: 'error', provider: 'HubSpot', error: e.message };
    }
  }

  // Push a lead to HubSpot
  async pushLeadToHubSpot(apiKey, lead) {
    try {
      const url = `https://api.hubapi.com/crm/v3/objects/contacts?hapikey=${apiKey}`;
      const data = {
        properties: {
          firstname: lead.firstName,
          lastname: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          status: lead.status
        }
      };
      const response = await axios.post(url, data);
      return { success: true, id: response.data.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Fetch updated leads from HubSpot
  async fetchUpdatedLeadsFromHubSpot(apiKey, lastSyncDate) {
    try {
      const url = `https://api.hubapi.com/crm/v3/objects/contacts?hapikey=${apiKey}&limit=100&properties=firstname,lastname,email,phone,company,status,lastmodifieddate&filter=lastmodifieddate>='${lastSyncDate}'`;
      const response = await axios.get(url);
      return { success: true, records: response.data.results };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Add more CRM provider methods here (Zoho, Freshsales, etc.)
}

const crmService = new CRMService();
export default crmService;
