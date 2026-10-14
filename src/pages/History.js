
import React, { useState, useEffect } from 'react';

const API_URL = 'https://phishguard-backend-17id.onrender.com';

const COLORS = {
  CRITICAL: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  HIGH: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  MEDIUM: { bg: 'rgba(234,179,8,0.15)', color: '#facc15' },
  LOW: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
  SAFE: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
  SUSPICIOUS: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  PHISHING: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
};

export default function History() {
  const [filter, setFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchHistory() {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/api/history`);

        if (!response.ok) {
          throw new Error(`Failed to load history (${response.status})`);
        }

        const data = await response.json();
        const records = Array.isArray(data)
          ? data
          : Array.isArray(data.history)
            ? data.history
            : [];

        const normalized = records.map((row) => {
          const result = String(row.result || '').toUpperCase();
          let risk = result;

          if (!COLORS[risk]) {
            risk = 'LOW';
          }

          return {
            id: row.id,
            type: 'URL',
            url: row.url || '',
            risk,
            score: row.risk_score ?? '—',
            time: row.checked_at
              ? new Date(row.checked_at).toLocaleString()
              : '—',
            result: row.result || '',
          };
        });

        if (!cancelled) {
          setHistory(normalized);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load scan history.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = history.filter((row) => {
    const matchesSearch =
      `${row.url} ${row.type} ${row.risk} ${row.result}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesType =
      filter === 'ALL' || filter === 'URL';

    const matchesRisk =
      riskFilter === 'ALL' ||
      (riskFilter === 'THREATS'
        ? ['HIGH', 'CRITICAL', 'PHISHING', 'SUSPICIOUS'].includes(row.risk)
        : row.risk === riskFilter);

    return matchesSearch && matchesType && matchesRisk;
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
        Scan History
      </h1>

      <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 14 }}>
        Past scans and threat detections
      </p>

      <div className="page-controls">
        <input
          className="search-input"
          placeholder="Search URL or risk level..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
        >
          {['ALL', 'THREATS', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'SAFE', 'SUSPICIOUS', 'PHISHING'].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['ALL', 'URL'].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            style={{
              padding: '7px 16px',
              borderRadius: 8,
              border: '1px solid',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              background: filter === item ? 'rgba(99,102,241,0.2)' : 'transparent',
              borderColor: filter === item ? '#6366f1' : 'rgba(255,255,255,0.1)',
              color: filter === item ? '#818cf8' : '#94a3b8',
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#94a3b8' }}>Loading history...</p>}

      {error && <p style={{ color: '#f87171' }}>Error: {error}</p>}

      {!loading && !error && history.length === 0 && (
        <p style={{ color: '#94a3b8' }}>No scan history yet.</p>
      )}

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              {['#', 'Type', 'URL', 'Result', 'Score', 'Time'].map((heading) => (
                <th
                  key={heading}
                  style={{
                    textAlign: 'left',
                    padding: '14px 20px',
                    fontSize: 12,
                    color: '#64748b',
                    fontWeight: 600,
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map((row) => {
              const color = COLORS[row.risk] || COLORS.LOW;

              return (
                <tr
                  key={row.id}
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <td style={{ padding: '14px 20px', fontSize: 12, color: '#475569' }}>
                    {row.id}
                  </td>

                  <td style={{ padding: '14px 20px', color: '#94a3b8' }}>
                    🔗 URL
                  </td>

                  <td
                    style={{
                      padding: '14px 20px',
                      fontSize: 13,
                      color: '#cbd5e1',
                      maxWidth: 280,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {row.url}
                  </td>

                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        background: color.bg,
                        color: color.color,
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {row.result || row.risk}
                    </span>
                  </td>

                  <td style={{ padding: '14px 20px', fontSize: 13, color: color.color }}>
                    {row.score}
                  </td>

                  <td style={{ padding: '14px 20px', fontSize: 12, color: '#64748b' }}>
                    {row.time}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!loading && !error && filtered.length === 0 && history.length > 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            No matching records found.
          </div>
        )}
      </div>
    </div>
  );
        }
