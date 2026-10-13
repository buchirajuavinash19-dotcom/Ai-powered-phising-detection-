
import React, { useState } from 'react';

export default function Scanner() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  function scanURL() {
    setResult('');
    setError('');

    const input = url.trim();

    if (!input) {
      setError('Please enter a URL.');
      return;
    }

    let parsed;

    try {
      parsed = new URL(
        /^https?:\/\//i.test(input) ? input : `https://${input}`
      );
    } catch {
      setError('Please enter a valid website URL.');
      return;
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      setError('Only HTTP and HTTPS URLs are supported.');
      return;
    }

    const suspicious =
      parsed.protocol !== 'https:' ||
      parsed.hostname.includes('xn--') ||
      parsed.hostname.split('.').length > 4 ||
      /@|%40/.test(parsed.href) ||
      /login|verify|account|password|wallet/i.test(
        parsed.hostname + parsed.pathname
      );

    setResult(
      suspicious
        ? 'Suspicious indicators found. Verify this URL carefully.'
        : 'No obvious suspicious indicators found by this basic demo check.'
    );
  }

  return (
    <section className="scanner-page">
      <h1>URL Security Scanner</h1>
      <p>Enter a website URL for a basic demo check.</p>

      <input
        type="text"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://example.com"
      />

      <button onClick={scanURL}>Scan URL</button>

      {error && <p role="alert">{error}</p>}
      {result && <p role="status">{result}</p>}

      <small>
        Demo only. This does not verify a URL against live threat databases.
      </small>
    </section>
    );
      }
       
