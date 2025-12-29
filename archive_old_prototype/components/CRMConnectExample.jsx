// Example usage of useCRM hook in a React component
import React, { useState } from 'react';
import { useCRM } from '../services/useCRM';

export default function CRMConnectExample() {
  const { status, error, connect } = useCRM();
  const [provider, setProvider] = useState('salesforce');
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    apiKey: ''
  });

  const handleConnect = async (e) => {
    e.preventDefault();
    await connect(provider, credentials);
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Connect to CRM</h2>
      <form onSubmit={handleConnect}>
        <label>
          Provider:
          <select value={provider} onChange={e => setProvider(e.target.value)}>
            <option value="salesforce">Salesforce</option>
            <option value="hubspot">HubSpot</option>
            {/* Add more options as needed */}
          </select>
        </label>
        <br />
        <label>
          Username:
          <input type="text" value={credentials.username} onChange={e => setCredentials({ ...credentials, username: e.target.value })} />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={credentials.password} onChange={e => setCredentials({ ...credentials, password: e.target.value })} />
        </label>
        <br />
        <label>
          API Key:
          <input type="text" value={credentials.apiKey} onChange={e => setCredentials({ ...credentials, apiKey: e.target.value })} />
        </label>
        <br />
        <button type="submit">Connect</button>
      </form>
      <div style={{ marginTop: 16 }}>
        {status && <div>Status: {status}</div>}
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      </div>
    </div>
  );
}
