import React, { useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';

const API_URL = 'https://phishguard-backend-17id.onrender.com';

export default function Scanner() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

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

  function downloadPDF() {
    if (!result) return;

    setPdfLoading(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18;
      const usableWidth = pageWidth - margin * 2;
      let y = 20;

      function addPageIfNeeded(height = 10) {
        if (y + height > pageHeight - 18) {
          doc.addPage();
          y = 20;
        }
      }

      function addHeading(text) {
        addPageIfNeeded(14);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(text, margin, y);
        y += 8;
      }

      function addText(label, value) {
        const text = `${label}: ${value ?? 'Not available'}`;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const lines = doc.splitTextToSize(
          String(text),
          usableWidth
        );

        addPageIfNeeded(lines.length * 5 + 4);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 3;
      }

      // Report title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('PhishGuard AI', margin, y);
      y += 9;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text('URL Security Scan Report', margin, y);
      y += 10;

      doc.setDrawColor(100);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Scan details
      addHeading('Scan Details');

      addText('Scanned URL', result.url || result.input);
      addText(
        'Scan Date (UTC)',
        result.checked_at || new Date().toISOString()
      );
      addText('Scan ID', result.id ?? 'Not available');
      addText('Result', result.result || 'Not available');
      addText(
        'Risk Score',
        `${result.risk_score ?? 0}/100`
      );
      addText('Risk Level', result.risk_level || 'Not available');

      // Indicators
      y += 3;
      addHeading('Security Indicators');

      const indicators = Array.isArray(result.indicators)
        ? result.indicators
        : [];

      if (indicators.length === 0) {
        addText('Indicators', 'No indicators were returned.');
      } else {
        indicators.forEach((indicator, index) => {
          addText(` ${index + 1}`, indicator);
        });
      }

      // Live security checks
      y += 3;
      addHeading('Live Threat Database Checks');

      const checks = result.live_checks || {};
      const google = checks.google_safe_browsing || {};
      const vt = checks.virustotal || {};

      addText('Google Safe Browsing Status', google.status);
      if (Array.isArray(google.matches) && google.matches.length) {
        addText(
          'Google Threat Matches',
          google.matches.map(
            match => match.threat_type || 'Unknown'
          ).join(', ')
        );
      }

      addText('VirusTotal Status', vt.status);
      addText('VirusTotal Malicious Detections', vt.malicious);
      addText('VirusTotal Suspicious Detections', vt.suspicious);
      addText('VirusTotal Harmless Detections', vt.harmless);
      addText('VirusTotal Undetected', vt.undetected);

      // Disclaimer
      y += 5;
      addHeading('Important Notice');

      const disclaimer =
        result.note ||
        'This report is based on the checks available at scan time. ' +
        'A low risk score does not guarantee that a website is safe. ' +
        'Threat database results may be unavailable or incomplete.';

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      const disclaimerLines = doc.splitTextToSize(
        disclaimer,
        usableWidth
      );

      addPageIfNeeded(disclaimerLines.length * 4.5 + 4);
      doc.text(disclaimerLines, margin, y);

      const safeFilename = String(result.url || 'scan-report')
        .replace(/^https?:\/\//i, '')
        .replace(/[^a-zA-Z0-9.-]+/g, '_')
        .slice(0, 70);

      doc.save(`PhishGuard_Report_${safeFilename || 'scan'}.pdf`);
    } catch (err) {
      setError('Could not generate the PDF report. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  }

  const checks = result?.live_checks || {};

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

          <h4>Live Threat Checks</h4>
          <p>
            <strong>Google Safe Browsing:</strong>{' '}
            {checks.google_safe_browsing?.status || 'Not available'}
          </p>
          <p>
            <strong>VirusTotal:</strong>{' '}
            {checks.virustotal?.status || 'Not available'}
          </p>

          <button
            type="button"
            onClick={downloadPDF}
            disabled={pdfLoading}
            style={{
              marginTop: 16,
              padding: '12px 18px',
              borderRadius: 8,
              cursor: pdfLoading ? 'wait' : 'pointer'
            }}
          >
            {pdfLoading ? 'Generating PDF...' : '📄 Download PDF Report'}
          </button>

          <p style={{ fontSize: 12, marginTop: 12 }}>
            A low-risk result does not guarantee that a website is safe.
            Live-check results may be unavailable or incomplete.
          </p>
        </div>
      )}
    </section>
  );
        }
