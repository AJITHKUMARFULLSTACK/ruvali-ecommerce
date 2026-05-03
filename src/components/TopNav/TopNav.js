import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { useCategories } from '../../hooks/useCategories';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';
import { useStore } from '../../context/StoreContext';
import logoImg from '../../Assets/Images/Logo.png';
import './TopNav.css';

export const TOP_NAV_HEIGHT = 80;

const TopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { storeSlug } = useStore();
  const categoriesHook = useCategories({ storeSlug });
  const categories = categoriesHook?.data || categoriesHook?.categories || categoriesHook?.tree || [];
  const isCategoriesLoading = !!categoriesHook?.isLoading;
  const { getCartCount } = useCart();
  const { customer, logout, isLoggedIn } = useCustomer();
  const cartCount = getCartCount();
  const scrollY = useScrollPosition(16);

  const scrolled = scrollY > 50;

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onDocClick = (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (t.closest('.top-nav-account')) return;
      setAccountOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const customerLabel = useMemo(() => {
    const raw = String(customer?.name || 'Customer');
    return raw.length > 12 ? `${raw.slice(0, 12)}…` : raw;
  }, [customer?.name]);

  const topCategories = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    return list.filter((c) => !c?.parentId);
  }, [categories]);

  const handleAccountClick = () => {
    if (!isLoggedIn) {
      navigate('/account/login');
      return;
    }
    setAccountOpen((v) => !v);
  };

  return (
    <>
      <div className="top-nav-wrapper" aria-label="Main navigation">
        <div className="top-nav-logo">
          <img
            src={logoImg}
            alt="Ruvali"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
        </div>

        <div className="top-nav-pill-anchor">
          <motion.div
            className={`top-nav-pill ${scrolled ? 'top-nav-pill--scrolled' : ''}`}
            initial={{ y: -56, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {isCategoriesLoading
              ? null
              : topCategories.map((cat) => (
                  <NavLink
                    key={cat.id}
                    to={`/c/${cat.slug || cat.id}`}
                    className={({ isActive }) => `top-nav-link ${isActive ? 'active' : ''}`}
                  >
                    {cat.name}
                  </NavLink>
                ))}
            <NavLink to="/donate" className={({ isActive }) => `top-nav-link ${isActive ? 'active' : ''}`}>
              Donate
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `top-nav-link ${isActive ? 'active' : ''}`}>
              About
            </NavLink>
          </motion.div>
        </div>

        <div className="top-nav-right">
          <div className="top-nav-account">
            <button
              className="top-nav-account-btn"
              type="button"
              onClick={handleAccountClick}
              aria-expanded={accountOpen}
              aria-label="Account menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {isLoggedIn && accountOpen && (
              <div className="top-nav-account-dropdown" role="menu">
                <div className="top-nav-account-name">{customerLabel}</div>
                <NavLink to="/account/orders" className="top-nav-account-link" role="menuitem">
                  My Orders
                </NavLink>
                <button
                  type="button"
                  className="top-nav-account-logout"
                  role="menuitem"
                  onClick={() => {
                    logout();
                    setAccountOpen(false);
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <button className="top-nav-cart-btn" type="button" onClick={() => navigate('/cart')} aria-label={`Cart (${cartCount} items)`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && <span className="top-nav-cart-badge">{cartCount}</span>}
          </button>

          <button
            className="top-nav-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        className={`top-nav-mobile ${mobileOpen ? 'top-nav-mobile--open' : ''}`}
        hidden={!mobileOpen}
      >
        <div className="top-nav-mobile-backdrop" onClick={() => setMobileOpen(false)} />
        <div className="top-nav-mobile-panel" role="dialog" aria-label="Mobile navigation">
          <button className="top-nav-mobile-close" type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
            <span />
            <span />
          </button>
          <div className="top-nav-mobile-links">
            {isCategoriesLoading
              ? null
              : topCategories.map((cat) => (
                  <NavLink
                    key={cat.id}
                    to={`/c/${cat.slug || cat.id}`}
                    className={({ isActive }) => `top-nav-mobile-link ${isActive ? 'active' : ''}`}
                  >
                    {cat.name}
                  </NavLink>
                ))}
            <NavLink to="/donate" className={({ isActive }) => `top-nav-mobile-link ${isActive ? 'active' : ''}`}>
              Donate
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `top-nav-mobile-link ${isActive ? 'active' : ''}`}>
              About
            </NavLink>
            {!isLoggedIn ? (
              <NavLink to="/account/login" className={({ isActive }) => `top-nav-mobile-link ${isActive ? 'active' : ''}`}>
                Login
              </NavLink>
            ) : (
              <>
                <NavLink to="/account/orders" className={({ isActive }) => `top-nav-mobile-link ${isActive ? 'active' : ''}`}>
                  My Orders
                </NavLink>
                <button
                  type="button"
                  className="top-nav-mobile-link top-nav-mobile-logout"
                  onClick={() => logout()}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TopNav;
