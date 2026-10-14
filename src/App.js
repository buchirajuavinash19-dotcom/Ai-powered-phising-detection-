import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import BulkScan from './pages/BulkScan';
import History from './pages/History';
import EmailScan from './EmailScan';
import WhoisLookup from './WhoisLookup';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const pages = {
    dashboard: <Dashboard />,
    scanner: <Scanner />,
    bulk: <BulkScan />,
    history: <History />,
    email: <EmailScan />,
    whois: <WhoisLookup />,
  };

  const navigation = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'scanner', icon: '🔍', label: 'Scanner' },
    { id: 'email', icon: '📧', label: 'Email Scan' },
    { id: 'bulk', icon: '📦', label: 'Bulk Scan' },
    { id: 'history', icon: '📋', label: 'History' },
    { id: 'whois', icon: '🌐', label: 'WHOIS Lookup' },
  ];

  const recommendations = [
    {
      icon: '🔗',
      title: 'Check a Suspicious URL',
      description: 'Scan a website and review its security risk.',
      page: 'scanner',
      button: 'Scan URL',
    },
    {
      icon: '📧',
      title: 'Identify Phishing Emails',
      description: 'Review an email for common phishing signs.',
      page: 'email',
      button: 'Check Email',
    },
    {
      icon: '📦',
      title: 'Scan Multiple URLs',
      description: 'Check several website addresses together.',
      page: 'bulk',
      button: 'Bulk Scan',
    },
    {
      icon: '📋',
      title: 'Review Scan History',
      description: 'Review previously saved scan results.',
      page: 'history',
      button: 'View History',
    },
    {
      icon: '🌐',
      title: 'Investigate a Domain',
      description: 'Check domain registration information.',
      page: 'whois',
      button: 'WHOIS Lookup',
    },
  ];

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">🛡️</span>
          <span className="logo-text">PhishGuard AI</span>
        </div>

        <ul className="nav-links">
          {navigation.map(({ id, icon, label }) => (
            <li
              key={id}
              className={`nav-item ${
                activePage === id ? 'active' : ''
              }`}
              onClick={() => setActivePage(id)}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </nav>

      <main className="main-content">
        {pages[activePage]}

        {activePage === 'dashboard' && (
          <section
            style={{
              margin: '24px 0',
              padding: '22px',
              borderRadius: '16px',
              border: '1px solid #334155',
              background: '#111827',
              color: '#f8fafc',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '30px' }}>🤖</span>
              <div>
                <h2 style={{ margin: 0, fontSize: '22px' }}>
                  AI Security Recommendations
                </h2>
                <p style={{ margin: '6px 0', color: '#94a3b8' }}>
                  Choose an action to improve your online safety.
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                gap: '14px',
                marginTop: '20px',
              }}
            >
              {recommendations.map((item) => (
                <div
                  key={item.page}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: '#1f2937',
                    border: '1px solid #374151',
                  }}
                >
                  <div style={{ fontSize: '25px' }}>
                    {item.icon}
                  </div>

                  <h3 style={{ fontSize: '16px', margin: '10px 0' }}>
                    {item.title}
                  </h3>

                  <p
                    style={{
                      color: '#cbd5e1',
                      fontSize: '13px',
                      lineHeight: 1.6,
                      minHeight: '42px',
                    }}
                  >
                    {item.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => setActivePage(item.page)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '8px',
                      border: 'none',
                      borderRadius: '8px',
                      background: '#2563eb',
                      color: '#ffffff',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {item.button} →
                  </button>
                </div>
              ))}
            </div>

            <p
              style={{
                marginTop: '18px',
                marginBottom: 0,
                fontSize: '12px',
                color: '#94a3b8',
              }}
            >
              Security guidance and quick actions. Scan results depend
              on the checks available at the time of scanning.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
                      
