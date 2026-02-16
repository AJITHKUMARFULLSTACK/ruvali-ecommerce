import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { useCategories } from '../../hooks/useCategories';
import { getCategorySlug } from '../../lib/slugUtils';
import './TopNav.css';

export const TOP_NAV_HEIGHT = 80;

const SCROLL_BLUR = 40;

/**
 * Site navigation layer - always at top, floating.
 * position: fixed, top: 24px, horizontally centered.
 * Never mixed with hero branding.
 */
const TopNav = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { tree: categoriesTree } = useCategories();
  const scrollY = useScrollPosition(16);

  const isScrolled = scrollY > SCROLL_BLUR;
  const noHeroRoutes = ['/about', '/donate', '/contact', '/payment', '/order-confirmation'];
  const isOverLightContent =
    isScrolled || noHeroRoutes.some((r) => location.pathname.startsWith(r));

  const isActive = (path) => location.pathname === path;
  const isCategoryActive = (cat) => {
    const catSlug = getCategorySlug(cat);
    if (location.pathname === `/c/${encodeURIComponent(catSlug)}`) return true;
    return (cat.children || []).some(
      (child) =>
        location.pathname ===
        `/c/${encodeURIComponent(catSlug)}/${encodeURIComponent(getCategorySlug(child))}`
    );
  };

  return (
    <nav
      className={`top-nav ${isOverLightContent ? 'top-nav--scrolled' : ''} ${isMenuOpen ? 'top-nav--open' : ''}`}
      aria-label="Main navigation"
    >
      <div className="top-nav-pill">
        <Link
          to="/"
          className={`top-nav-link ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
        >
          Home
        </Link>
        <Link
          to="/c"
          className={`top-nav-link ${location.pathname === '/c' ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
        >
          Shop
        </Link>
        {categoriesTree.map((cat) => (
          <div key={cat.id} className="top-nav-item">
            <Link
              to={`/c/${encodeURIComponent(getCategorySlug(cat))}`}
              className={`top-nav-link ${isCategoryActive(cat) ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {cat.name}
            </Link>
            {cat.children && cat.children.length > 0 && (
              <div className="top-nav-sub">
                {cat.children.map((child) => (
                  <Link
                    key={child.id}
                    to={`/c/${encodeURIComponent(getCategorySlug(cat))}/${encodeURIComponent(getCategorySlug(child))}`}
                    className={`top-nav-sublink ${isActive(`/c/${encodeURIComponent(getCategorySlug(cat))}/${encodeURIComponent(getCategorySlug(child))}`) ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        <Link
          to="/about"
          className={`top-nav-link ${isActive('/about') ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
        >
          About
        </Link>
        <Link
          to="/donate"
          className={`top-nav-link ${isActive('/donate') ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
        >
          Donate
        </Link>
      </div>
      <button
        className="top-nav-toggle"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
        aria-expanded={isMenuOpen}
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  );
};

export default TopNav;
