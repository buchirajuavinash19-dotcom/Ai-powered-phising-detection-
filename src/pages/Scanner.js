
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://phishguard-backend-17id.onrender.com';

export default function Scanner() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function scanURL() {
    const value = url.trim();

    setResult(null);
    setError('');

    if (!value) {
      setError('Please enter a URL.');
      return;
    }

    let normalizedURL;

    try {
      normalizedURL = /^https?:\/\//i.test(value)
        ? value
        : `https://${value}`;

      const parsed = new URL(normalizedURL);

      if (
        !['http:', 'https:'].includes(parsed.protocol) ||
        !parsed.hostname.includes('.') ||
        parsed.hostname.startsWith('.') ||
        parsed.hostname.endsWith('.')
      ) {
        setError('Please enter a valid website URL.');
        return;
      }
    } catch {
      setError('Please enter a valid website URL.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/scan`,
        { url: normalizedURL },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Unable to scan URL. Please check the backend connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="scanner-page">
      <h1>URL Security Scanner</h1>

      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !loading) {
            scanURL();
          }
        }}
        placeholder="https://example.com"
      />

      <button onClick={scanURL} disabled={loading}>
        {loading ? 'Scanning...' : 'Scan URL'}
      </button>

      {error && (
        <p role="alert" style={{ color: '#ef4444' }}>
          {error}
        </p>
      )}

      {result && (
        <div className="scan-result">
          <h3>Scan Result: {result.result}</h3>
          <p><strong>URL:</strong> {result.url}</p>
          <p><strong>Risk Score:</strong> {result.risk_score}/100</p>
          <p><strong>Risk Level:</strong> {result.risk_level}</p>

          <p><strong>Indicators:</strong></p>
          <ul>
            {result.indicators?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <small>
            Basic heuristic analysis only. A low-risk result does not
            guarantee that a website is safe. Live threat databases
            are not checked by this endpoint.
          </small>
        </div>
      )}
    </section>
  );
}
