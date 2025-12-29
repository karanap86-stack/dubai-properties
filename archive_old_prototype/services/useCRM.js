// useCRM.js
// React hook for CRM integration
import { useState } from 'react';
import crmService from './crmService';

export function useCRM() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  // Connect to a CRM provider
  const connect = async (provider, credentials) => {
    setStatus('connecting');
    setError(null);
    try {
      const result = await crmService.connect(provider, credentials);
      setStatus(result.status);
      return result;
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return { status, error, connect };
}
