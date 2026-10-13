import React, { useState } from 'react';

export default function Scanner() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');

  function scanURL() {
    const value = url.trim();
    if (!value) {
      setResult('Please enter a URL.');
      return;
    }

    try {
      const parsed = new URL(
        /^https?:\/\//i.test(value) ? value : `https://${value}`
      );

      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setResult('Please enter a valid HTTP or HTTPS URL.');
        return;
      }

      const suspicious =
        parsed.protocol !== 'https:' ||
        parsed.hostname.includes('xn--') ||
        /login|verify|account|password|wallet/i.test(
          parsed.hostname + parsed.pathname
        );

      setResult(
        suspicious
          ? 'Suspicious indicators found. Check this URL carefully.'
          : 'No obvious suspicious indicators found in this basic demo check.'
      );
    } catch {
      setResult('Please enter a valid website URL.');
    }
  }

  return (
    <section className="scanner-page">
      <h1>URL Security Scanner</h1>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
      />
      <button onClick={scanURL}>Scan URL</button>
      {result && <p>{result}</p>}
      <small>Basic demo only; this does not check live threat databases.</small>
    </section>
  );
      }
