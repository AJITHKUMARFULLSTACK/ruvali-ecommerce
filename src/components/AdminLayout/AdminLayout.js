import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resolveImageUrl } from '../../lib/imageUtils';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [store] = useState(() => {
    try {
      const s = localStorage.getItem('adminStore');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminStore');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  const logoUrl = store?.logo ? resolveImageUrl(store.logo) : null;

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/settings', label: 'Store Settings' },
    { to: '/admin/categories', label: 'Categories' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/orders', label: 'Orders' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-layout-sidebar">
        <div className="admin-layout-brand">
          {logoUrl ? (
            <img src={logoUrl} alt="Store" className="admin-layout-logo" />
          ) : (
            <h2 className="admin-layout-title">RUVALI</h2>
          )}
          <p className="admin-layout-subtitle">Admin Panel</p>
        </div>

        <nav className="admin-layout-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-layout-nav-item ${isActive ? 'active' : ''}`
              }
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
          {store?.primaryColor && (
            <div
              className="admin-layout-theme-preview"
              style={{ backgroundColor: store.primaryColor }}
              title="Primary color"
            />
          )}
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
