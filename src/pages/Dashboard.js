import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';

const weeklyData = [
  { day: 'Mon', scans: 42, phishing: 8 },
  { day: 'Tue', scans: 57, phishing: 14 },
  { day: 'Wed', scans: 38, phishing: 6 },
  { day: 'Thu', scans: 71, phishing: 22 },
  { day: 'Fri', scans: 65, phishing: 18 },
  { day: 'Sat', scans: 29, phishing: 4 },
  { day: 'Sun', scans: 33, phishing: 7 },
];

const threatTypes = [
  { name: 'URL Phishing', value: 45, color: '#ef4444' },
  { name: 'Email Scam', value: 30, color: '#f59e0b' },
  { name: 'Brand Spoof', value: 15, color: '#6366f1' },
  { name: 'Credential Harvest', value: 10, color: '#ec4899' },
];

const recentThreats = [
  { url: 'paypal-secure-verify.xyz/login', risk: 'CRITICAL', time: '2 min ago' },
  { url: 'apple-id-locked.tk/verify', risk: 'CRITICAL', time: '8 min ago' },
  { url: 'amazon-prize-winner.ml', risk: 'HIGH', time: '15 min ago' },
  { url: 'support.google.net-update.com', risk: 'HIGH', time: '23 min ago' },
  { url: 'bankofamerica.account.xyz', risk: 'CRITICAL', time: '41 min ago' },
];

const BADGE = {
  CRITICAL: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  HIGH: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  MEDIUM: { bg: 'rgba(234,179,8,0.15)', color: '#facc15' },
  LOW: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
};

export default function Dashboard() {
  const [, setScanHistory] = useState([]);
  const [scanStats, setScanStats] = useState({
    total_scans: 0,
    safe_scans: 0,
    phishing_scans: 0,
    threat_rate: 0,
  });

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => setScanHistory(data))
      .catch(err => console.error('Error:', err));

    fetch('/api/stats')
      .then(res => res.json())
      .then(stats => {
        if (!stats.error) setScanStats(stats);
      })
      .catch(err => console.error('Stats fetch error:', err));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Threat Dashboard</h1>
      <p style={{ color: '#94a3b8', marginBottom: 28, fontSize: 14 }}>
        Real-time phishing detection overview
      </p>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total Scans', value: scanStats.total_scans, sub: 'Total scans executed' },
          { label: 'Safe Scans', value: scanStats.safe_scans, sub: 'Verified safe results' },
          { label: 'Phishing Scans', value: scanStats.phishing_scans, sub: 'Potential threats flagged' },
          { label: 'Threat Rate', value: `${scanStats.threat_rate}%`, sub: 'Phishing detection rate' },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Bar Chart */}
        <div className="card">
          <div className="card-title">Weekly Scan Activity</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barGap={4}>
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e2130', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="scans" fill="#6366f1" radius={[4,4,0,0]} name="Total Scans" />
              <Bar dataKey="phishing" fill="#ef4444" radius={[4,4,0,0]} name="Phishing" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        

        {/* Pie Chart */}
        <div className="card">
          <div className="card-title">Threat Types</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={threatTypes}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {threatTypes.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e2130', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(val) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-title">AI Recommendation Box</div>
        <div className="recommendation-box">
          <div className="recommendation-item">Use HTTPS-only links and avoid unsafe login prompts.</div>
          <div className="recommendation-item">Review sender domains carefully and do not trust urgent requests.</div>
          <div className="recommendation-item">Cross-check suspicious URLs against Safe Browsing and VirusTotal.</div>
          <div className="recommendation-item">Keep browser and security tools updated for the latest protections.</div>
        </div>
      </div>

      {/* Recent Threats */}
      <div className="card">
        <div className="card-title">Recent Threats Detected</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['URL / Sender', 'Risk Level', 'Time'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, color: '#64748b', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentThreats.map((t, i) => (
              <tr key={i}>
                <td style={{ padding: '12px 0', fontSize: 13, color: '#cbd5e1', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  🔗 {t.url}
                </td>
                <td style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{
                    background: BADGE[t.risk]?.bg,
                    color: BADGE[t.risk]?.color,
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {t.risk}
                  </span>
                </td>
                <td style={{ padding: '12px 0', fontSize: 12, color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {t.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  }
