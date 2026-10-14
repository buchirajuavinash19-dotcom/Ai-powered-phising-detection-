import React, { useState } from 'react';

const API_URL = 'https://phishguard-backend-17id.onrender.com';

function WhoisLookup() {
const [domain, setDomain] = useState('');
const [data, setData] = useState(null);
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const lookupDomain = async () => {
if (!domain.trim()) {
setError('Please enter a domain name.');
setData(null);
return;
}

setLoading(true);
setError('');
setData(null);

try {
  const response = await fetch(`${API_URL}/api/whois`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain: domain.trim() })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'WHOIS lookup failed.');
  }

  setData(result);
} catch (err) {
  setError(err.message || 'Could not connect to the server.');
} finally {
  setLoading(false);
}

};

const fields = [
['Domain', 'domain'],
['Registrar', 'registrar'],
['Creation Date', 'creation_date'],
['Expiration Date', 'expiration_date'],
['Last Updated', 'updated_date'],
['Name Servers', 'name_servers'],
['Domain Status', 'status'],
['Registrant Emails', 'emails']
];

return (
<div>
<h1>WHOIS Lookup</h1>
<p>View available domain registration information.</p>

  <div className="card" style={{ marginTop: 20 }}>
    <label htmlFor="whois-domain">Domain Name</label>

    <input
      id="whois-domain"
      type="text"
      value={domain}
      onChange={(event) => setDomain(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') lookupDomain();
      }}
      placeholder="example.com"
      style={{
        display: 'block',
        width: '100%',
        boxSizing: 'border-box',
        padding: 12,
        marginTop: 10,
        marginBottom: 16,
        borderRadius: 8
      }}
    />

    <button
      type="button"
      className="btn-scan"
      onClick={lookupDomain}
      disabled={loading}
    >
      {loading ? 'Looking up...' : 'Lookup Domain'}
    </button>
  </div>

  {error && (
    <div className="card" style={{ marginTop: 20 }}>
      <p style={{ color: '#ef4444' }}>{error}</p>
    </div>
  )}

  {data && (
    <div className="card" style={{ marginTop: 20 }}>
      <h2>WHOIS Results</h2>
      {fields.map(([label, key]) => (
        <div
          key={key}
          style={{
            padding: '12px 0',
            borderBottom: '1px solid #64748b'
          }}
        >
          <strong>{label}</strong>
          <div style={{ marginTop: 5, overflowWrap: 'anywhere' }}>
            {data[key] || 'Not available'}
          </div>
        </div>
      ))}
      <p style={{ fontSize: 13, marginTop: 16, opacity: 0.8 }}>
        WHOIS information may be incomplete, hidden by privacy services,
        or unavailable for some domains.
      </p>
    </div>
  )}
</div>

);
}

export default WhoisLookup;
