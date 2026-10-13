import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import BulkScan from './pages/BulkScan';
import History from './pages/History';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const pages = {
    dashboard: <Dashboard />,
    scanner: <Scanner />,
    bulk: <BulkScan />,
    history: <History />,
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">🛡️</span>
          <span className="logo-text">PhishGuard AI</span>
        </div>
        <ul className="nav-links">
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'scanner', icon: '🔍', label: 'Scanner' },
            { id: 'bulk', icon: '📦', label: 'Bulk Scan' },
            { id: 'history', icon: '📋', label: 'History' },
          ].map(({ id, icon, label }) => (
            <li
              key={id}
              className={`nav-item ${activePage === id ? 'active' : ''}`}
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
      </main>
    </div>
  );
}

export default App;
