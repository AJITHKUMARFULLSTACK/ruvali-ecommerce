import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ADMIN_TOKEN_KEY } from '../../lib/apiClient';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [store] = useState(() => {
    try {
      const s = localStorage.getItem('adminStore');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  // Close sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Body scroll lock when sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem('adminStore');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/settings', label: 'Store Settings' },
    { to: '/admin/categories', label: 'Categories' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/orders', label: 'Orders' },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile top bar — hidden on desktop via CSS */}
      <header className="admin-mobile-topbar">
        <button
          className="admin-hamburger"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <span /><span /><span />
        </button>
        <span className="admin-mobile-title">RUVALI ADMIN</span>
      </header>

      {/* Dark backdrop — only rendered when sidebar is open on mobile */}
      {mobileOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-layout-sidebar${mobileOpen ? ' admin-layout-sidebar--open' : ''}`}>
        <div className="admin-layout-brand">
          <div className="admin-layout-brand-row">
            <div>
              <h2 className="admin-layout-title">RUVALI</h2>
              <p className="admin-layout-subtitle">{store?.name || 'Admin Panel'}</p>
            </div>
            <button
              className="admin-sidebar-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              &#x2715;
            </button>
          </div>
        </div>

        <nav className="admin-layout-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-layout-nav-item${isActive ? ' active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} className="admin-layout-logout">
          Logout
        </button>
      </aside>

      <div className="admin-layout-main">
        <header className="admin-layout-topbar">
          <h1 className="admin-layout-store-name">
            {store?.name || 'Store'}
          </h1>
        </header>

        <motion.main
          className="admin-layout-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout;
