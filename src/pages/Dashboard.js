import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const API_URL = 'https://phishguard-backend-17id.onrender.com';

const COLORS = {
  Safe: '#10b981',
  Suspicious: '#f59e0b',
  Phishing: '#ef4444',
  Other: '#6366f1',
};

function getCategory(result) {
  const value = String(result || '').toLowerCase();

  if (value.includes('phishing') || value.includes('malicious') ||
      value.includes('critical') || value.includes('high')) {
    return 'Phishing';
  }

  if (value.includes('suspicious') || value.includes('medium')) {
    return 'Suspicious';
  }

  if (value.includes('safe') || value.includes('low')) {
    return 'Safe';
  }

  return 'Other';
}

function formatTime(value) {
  if (!value) return 'Time unavailable';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time unavailable';

  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  return `${Math.floor(hours / 24)} days ago`;
}

export default function Dashboard() {
  const [scanHistory, setScanHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        const response = await fetch(`${API_URL}/api/history`);

        if (!response.ok) {
          throw new Error('Unable to fetch scan history.');
        }

        const data = await response.json();
        const history = Array.isArray(data)
          ? data
          : Array.isArray(data.history)
            ? data.history
            : [];

        if (active) {
          setScanHistory(history);
          setError('');
        }
      } catch (err) {
        if (active) setError('Could not load dashboard data. Please try again.');
        console.error('Dashboard history error:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHistory();

    return () => {
      active = false;
    };
  }, []);

  const totalScans = scanHistory.length;

  const safeScans = scanHistory.filter(
    item => getCategory(item.result) === 'Safe'
  ).length;

  const phishingScans = scanHistory.filter(
    item => getCategory(item.result) === 'Phishing'
  ).length;

  const suspiciousScans = scanHistory.filter(
    item => getCategory(item.result) === 'Suspicious'
  ).length;

  const threatCount = phishingScans + suspiciousScans;
  const threatRate = totalScans
    ? Math.round((threatCount / totalScans) * 100)
    : 0;

  const stats = [
    { label: 'Total Scans', value: totalScans, sub: 'Recorded URL scans' },
    { label: 'Safe Scans', value: safeScans, sub: 'Classified as safe' },
    { label: 'Phishing Scans', value: phishingScans, sub: 'Classified as threats' },
    { label: 'Threat Rate', value: `${threatRate}%`, sub: 'Phishing and suspicious results' },
  ];

  const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
    (day, index) => {
      const scans = scanHistory.filter(item => {
        const date = new Date(item.checked_at);
        return !Number.isNaN(date.getTime()) &&
          (date.getDay() + 6) % 7 === index;
      });

      return {
        day,
        scans: scans.length,
        phishing: scans.filter(
          item => getCategory(item.result) === 'Phishing'
        ).length,
      };
    }
  );

  const threatTypes = [
    { name: 'Safe', value: safeScans, color: COLORS.Safe },
    { name: 'Suspicious', value: suspiciousScans, color: COLORS.Suspicious },
    { name: 'Phishing', value: phishingScans, color: COLORS.Phishing },
    {
      name: 'Other',
      value: scanHistory.filter(
        item => getCategory(item.result) === 'Other'
      ).length,
      color: COLORS.Other,
    },
  ].filter(item => item.value > 0);

  const recentThreats = scanHistory
    .filter(item => getCategory(item.result) !== 'Safe')
    .slice()
    .sort((a, b) => new Date(b.checked_at) - new Date(a.checked_at))
    .slice(0, 5);

  const badgeStyle = {
    Phishing: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
    Suspicious: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
    Other: { bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc' },
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
        Threat Dashboard
      </h1>

      <p style={{ color: '#94a3b8', marginBottom: 28, fontSize: 14 }}>
        Scan statistics from your backend history
      </p>

      {error && (
        <p role="alert" style={{ color: '#f87171' }}>{error}</p>
      )}

      {loading && <p style={{ color: '#94a3b8' }}>Loading scan data...</p>}

      <div className="stats-grid">
        {stats.map(item => (
          <div className="stat-card" key={item.label}>
            <div className="stat-label">{item.label}</div>
            <div className="stat-value">{loading ? '...' : item.value}</div>
            <div className="stat-sub">{item.sub}</div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        <div className="card">
          <div className="card-title">Weekly Scan Activity</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="scans" fill="#6366f1" name="Total Scans" />
              <Bar dataKey="phishing" fill="#ef4444" name="Phishing" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Scan Result Breakdown</div>
          {threatTypes.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={threatTypes}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                >
                  {threatTypes.map(item => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#94a3b8' }}>No scan data available yet.</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">AI Security Recommendations</div>
        <div className="recommendation-box">
          <div className="recommendation-item">
            Use HTTPS links and avoid unsafe login prompts.
          </div>
          <div className="recommendation-item">
            Review sender domains carefully and avoid urgent requests from unknown sources.
          </div>
          <div className="recommendation-item">
            Cross-check suspicious URLs using configured security services.
          </div>
          <div className="recommendation-item">
            Keep your browser and security tools updated.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Recent Threats Detected</div>

        {recentThreats.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>
            No phishing or suspicious results in the recorded history.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['URL', 'Risk Level', 'Time'].map(heading => (
                    <th key={heading} style={{
                      textAlign: 'left',
                      padding: '8px',
                      color: '#94a3b8',
                      fontSize: 12
                    }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentThreats.map((item, index) => {
                  const category = getCategory(item.result);
                  const badge = badgeStyle[category] || badgeStyle.Other;

                  return (
                    <tr key={item.id || index}>
                      <td style={{
                        padding: 8,
                        color: '#cbd5e1',
                        overflowWrap: 'anywhere'
                      }}>
                        {item.url || 'Unknown URL'}
                      </td>
                      <td style={{ padding: 8 }}>
                        <span style={{
                          background: badge.bg,
                          color: badge.color,
                          padding: '4px 8px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700
                        }}>
                          {category.toUpperCase()}
                        </span>
                      </td>
                      <td style={{
                        padding: 8,
                        color: '#94a3b8',
                        fontSize: 12,
                        whiteSpace: 'nowrap'
                      }}>
                        {formatTime(item.checked_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
          }
              
