import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { name: 'Dashboard', path: '/' },
  { name: 'Inventory', path: '/inventory' },
  { name: 'Invoices', path: '/invoices' },
  { name: 'Customers', path: '/customers' },
  { name: 'Sales History', path: '/sales-history' },
  { name: 'Reports', path: '/reports' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <div className="text-2xl font-bold tracking-tight">Vyapar Pro</div>
        </div>
        
        <button className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="hidden md:flex space-x-1">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.path}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname === link.path 
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
      
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-gradient-to-b from-purple-700 to-blue-800 px-4 pb-4">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.path}
              className={`block py-3 px-4 rounded-lg transition-colors ${
                location.pathname === link.path 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Navbar; 