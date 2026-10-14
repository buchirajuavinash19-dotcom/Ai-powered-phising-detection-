import React, { useState } from 'react';

function EmailScan() {
const [emailText, setEmailText] = useState('');
const [result, setResult] = useState(null);

const scanEmail = () => {
if (!emailText.trim()) {
setResult({
score: 0,
status: 'error',
title: 'Email Required',
indicators: ['Please paste an email message before scanning.']
});
return;
}

const checks = [
  {
    pattern: /\b(urgent|immediately|act now|account suspended|account blocked)\b/i,
    points: 20,
    message: 'Urgent or threatening language detected.'
  },
  {
    pattern: /\b(password|verify your account|login credentials|confirm your account)\b/i,
    points: 25,
    message: 'Account verification or password-related language detected.'
  },
  {
    pattern: /\b(otp|one-time password|security code)\b/i,
    points: 25,
    message: 'OTP or security-code-related language detected.'
  },
  {
    pattern: /\b(send money|payment required|bank details|wire transfer|claim your prize)\b/i,
    points: 25,
    message: 'Potential financial scam language detected.'
  },
  {
    pattern: /\b(click here|confirm now|claim your reward|open this link)\b/i,
    points: 15,
    message: 'The message encourages clicking a link or claiming a reward.'
  },
  {
    pattern: /https?:\/\/[^\s<>"']+/i,
    points: 10,
    message: 'A URL is present. Check its destination carefully.'
  },
  {
    pattern: /\b(dear customer|dear user|valued customer)\b/i,
    points: 5,
    message: 'A generic greeting was found; this alone does not prove phishing.'
  }
];

let score = 0;
const indicators = [];

checks.forEach((check) => {
  if (check.pattern.test(emailText)) {
    score += check.points;
    indicators.push(check.message);
  }
});

score = Math.min(score, 100);

let title = 'No Common Warning Patterns Found';
let status = 'safe';

if (score >= 50) {
  title = 'Potential Phishing Email';
  status = 'danger';
} else if (score >= 20) {
  title = 'Suspicious Email';
  status = 'warning';
}

if (indicators.length === 0) {
  indicators.push('No warning patterns from this basic checklist were detected.');
}

setResult({ score, status, title, indicators });

};

const clearEmail = () => {
setEmailText('');
setResult(null);
};

const resultColor = {
error: '#ef4444',
danger: '#ef4444',
warning: '#f59e0b',
safe: '#10b981'
};

return (
<div className="email-scan-page">
<h1>Email Phishing Scanner</h1>
<p>
Paste an email message to check for common phishing warning signs.
</p>

  <div className="card">
    <h3>Email Message</h3>

    <textarea
      value={emailText}
      onChange={(event) => setEmailText(event.target.value)}
      placeholder="Paste the email subject and message here..."
      rows={10}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '14px',
        borderRadius: '8px',
        border: '1px solid #64748b',
        background: 'transparent',
        color: 'inherit',
        fontSize: '15px',
        resize: 'vertical'
      }}
      aria-label="Email message"
    />

    <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
      <button type="button" className="btn-scan" onClick={scanEmail}>
        Scan Email
      </button>

      <button
        type="button"
        onClick={clearEmail}
        style={{
          padding: '10px 18px',
          border: 'none',
          borderRadius: '6px',
          background: '#475569',
          color: '#ffffff',
          cursor: 'pointer'
        }}
      >
        Clear
      </button>
    </div>
  </div>

  {result && (
    <div className="card" style={{ marginTop: '20px' }}>
      <h2 style={{ color: resultColor[result.status] }}>
        {result.title}
      </h2>

      {result.status !== 'error' && (
        <p>
          Heuristic Risk Score: <strong>{result.score}/100</strong>
        </p>
      )}

      <h3>Indicators</h3>
      <ul>
        {result.indicators.map((indicator, index) => (
          <li key={index} style={{ marginBottom: '8px' }}>
            {indicator}
          </li>
        ))}
      </ul>

      <p style={{ fontSize: '13px', opacity: 0.8, lineHeight: 1.6 }}>
        This is a basic text-pattern demo, not a trained AI model. It does
        not verify the sender, open links, or query live threat databases.
        A low score does not guarantee that an email is safe.
      </p>
    </div>
  )}
</div>

);
}

export default EmailScan;
