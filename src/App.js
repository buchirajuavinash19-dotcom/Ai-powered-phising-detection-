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
