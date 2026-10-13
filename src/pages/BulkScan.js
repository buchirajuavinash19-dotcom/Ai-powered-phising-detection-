import React, { useMemo, useState } from 'react';
import axios from 'axios';

const RISK_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f59e0b',
  MEDIUM: '#eab308',
  LOW: '#10b981',
};

export default function BulkScan() {
  const [mode, setMode] = useState('urls');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const placeholder = useMemo(() => {
    if (mode === 'urls') {
      return 'https://example.com/login\nhttps://secure-bank-verify.xyz\nhttps://google.com';
    }

    return 'alice@example.com, suspicious@example.com\nsubject: Verify your account\nbody: Click here to update your password';
  }, [mode]);

  const parseInput = () => {
    const lines = inputText
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (mode === 'urls') {
      return { urls: lines.filter((value) => value.includes('http')) };
    }

    const emails = [];
    const current = { sender: '', subject: '', body: '' };

    lines.forEach((line) => {
      if (line.toLowerCase().startsWith('sender:')) {
        current.sender = line.split(':').slice(1).join(':').trim();
      } else if (line.toLowerCase().startsWith('subject:')) {
        current.subject = line.split(':').slice(1).join(':').trim();
      } else if (line.toLowerCase().startsWith('body:')) {
        current.body = line.split(':').slice(1).join(':').trim();
      } else if (line.includes('@')) {
        current.sender = line.trim();
      } else if (line) {
        current.body = (current.body ? current.body + '\n' : '') + line;
      }

      if (current.sender && current.body) {
        emails.push({ sender: current.sender, subject: current.subject || 'Bulk email check', body: current.body });
        current.sender = '';
        current.subject = '';
        current.body = '';
      }
    });

    if (current.sender || current.body || current.subject) {
      emails.push({ sender: current.sender || 'unknown@example.com', subject: current.subject || 'Bulk email check', body: current.body || 'No body provided' });
    }

    return { emails };
  };

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = parseInput();
      const hasEntries = (payload.urls && payload.urls.length > 0) || (payload.emails && payload.emails.length > 0);

      if (!hasEntries) {
        throw new Error('Add at least one valid URL or email entry before scanning.');
      }

      const response = await axios.post('/api/scan/batch', payload);
      setResult(response.data);
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Bulk scan failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Bulk Scan</h1>
      <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 14 }}>
        Run a batch scan across multiple URLs or suspicious email entries.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { id: 'urls', label: '🔗 URL Batch' },
          { id: 'emails', label: '📧 Email Batch' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setMode(tab.id);
              setResult(null);
              setError(null);
            }}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: '1px solid',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              background: mode === tab.id ? 'rgba(99,102,241,0.2)' : 'transparent',
              borderColor: mode === tab.id ? '#6366f1' : 'rgba(255,255,255,0.1)',
              color: mode === tab.id ? '#818cf8' : '#94a3b8',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card bulk-card">
        <textarea
          className="scanner-input bulk-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={placeholder}
        />

        <div className="bulk-actions">
          <button className="btn-scan" onClick={handleScan} disabled={loading || !inputText.trim()}>
            {loading ? '⏳ Scanning...' : mode === 'urls' ? '🔎 Scan URLs' : '📨 Scan Emails'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: 16, color: '#fca5a5' }}>
          ❌ {error}
        </div>
      )}

      {result && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-title">Batch Summary</div>
          <div className="bulk-summary">
            <div>Total scanned: {result.total}</div>
            <div>Batch ID: {result.batch_id}</div>
            <div>Checked at: {new Date(result.scanned_at).toLocaleString()}</div>
          </div>

          <div className="bulk-results">
            {result.results.map((entry, index) => (
              <div key={`${entry.type}-${index}`} className="bulk-result-item">
                <div className="bulk-result-header">
                  <span className="bulk-result-type">{entry.type === 'url' ? 'URL' : 'Email'}</span>
                  <span className="bulk-result-risk" style={{ color: RISK_COLORS[entry.risk_level] || '#94a3b8' }}>
                    {entry.risk_level || 'LOW'}
                  </span>
                </div>
                <div className="bulk-result-input">{entry.input || entry.url || entry.sender}</div>
                <div className="bulk-result-meta">
                  <span>Score: {entry.risk_score ?? 0}</span>
                  <span>Phishing: {entry.is_phishing ? 'Yes' : 'No'}</span>
                </div>
                {entry.indicators?.length > 0 && (
                  <ul className="bulk-indicators">
                    {entry.indicators.slice(0, 3).map((indicator, i) => (
                      <li key={i}>{indicator}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  }
