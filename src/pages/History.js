import React, { useState, useEffect } from 'react';

const COLORS = {
  CRITICAL: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  HIGH: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  MEDIUM: { bg: 'rgba(234,179,8,0.15)', color: '#facc15' },
  LOW: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
};

export default function History() {
  const [filter, setFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set('q', search);
        if (filter) params.set('type', filter);
        if (riskFilter) params.set('risk', riskFilter);

        const response = await fetch(`http://localhost:5000/api/history?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch history');
        const data = await response.json();
        setHistory(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [filter, riskFilter, search]);

  const filtered = history;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Scan History</h1>
      <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 14 }}>
        Past scans and threat detections
      </p>

      <div className="page-controls">
        <input
          className="search-input"
          placeholder="Search URL, type, risk level..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="filter-select"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
        >
          {['ALL', 'THREATS', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {loading && <p style={{ color: '#94a3b8' }}>Loading history...</p>}
      {error && <p style={{ color: '#f87171' }}>Error: {error}</p>}
      {!loading && !error && history.length === 0 && <p style={{ color: '#94a3b8' }}>No scan history yet.</p>}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['ALL', 'URL', 'Email'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '7px 16px',
              borderRadius: 8,
              border: '1px solid',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              background: filter === f ? 'rgba(99,102,241,0.2)' : 'transparent',
              borderColor: filter === f ? '#6366f1' : 'rgba(255,255,255,0.1)',
              color: filter === f ? '#818cf8' : '#94a3b8',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              {['#', 'Type', 'URL / Sender', 'Risk', 'Score', 'Time'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '14px 20px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={row.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '14px 20px', fontSize: 12, color: '#475569' }}>{row.id}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ fontSize: 12, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 4 }}>
                    {row.type === 'URL' ? '🔗' : '📧'} {row.type}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: 13, color: '#cbd5e1', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.url || row.input}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    background: COLORS[row.risk]?.bg,
                    color: COLORS[row.risk]?.color,
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {row.risk}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: COLORS[row.risk]?.color }}>
                  {row.score}
                </td>
                <td style={{ padding: '14px 20px', fontSize: 12, color: '#64748b' }}>
                  {row.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>
            No records found
          </div>
        )}
      </div>
    </div>
    );
}
            
