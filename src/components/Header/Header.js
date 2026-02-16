import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../Assets/Images/Logo.png';
import { useCategories } from '../../hooks/useCategories';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import './Header.css';

/** Header offset for layout - used for main content padding */
export const HEADER_HEIGHT_PX = 100;

const SCROLL_AT_MEDIUM = 40;
const SCROLL_AT_BLUR = 80;
const SCROLL_AT_COMPACT = 120;

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { tree: categoriesTree } = useCategories();
  const scrollY = useScrollPosition(16);

  const scrollState = useMemo(() => {
    if (scrollY < SCROLL_AT_MEDIUM) return 'at-top';
    if (scrollY < SCROLL_AT_BLUR) return 'medium';
    if (scrollY < SCROLL_AT_COMPACT) return 'blur';
    return 'compact';
  }, [scrollY]);

  const isActive = (path) => location.pathname === path;
  const isCategoryActive = (cat) => {
    if (location.pathname === `/c/${encodeURIComponent(cat.id)}`) return true;
    return (cat.children || []).some(
      (child) => location.pathname === `/c/${encodeURIComponent(child.id)}`
    );
  };

  return (
    <header
      className={`header header--fixed header--${scrollState}`}
      role="banner"
    >
      <div className="header-container">
        <Link to="/" className="logo" aria-label="RUVALI Home">
          <img src={logo} alt="RUVALI" className="logo-image" />
        </Link>

        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
          <Link
            to="/c"
            className={`nav-link ${location.pathname === '/c' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Shop
          </Link>
          {categoriesTree.map((cat) => (
            <div key={cat.id} className="nav-item-with-sub">
              <Link
                to={`/c/${encodeURIComponent(cat.id)}`}
                className={`nav-link ${isCategoryActive(cat) ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {cat.name}
              </Link>
              {cat.children && cat.children.length > 0 && (
                <div className="nav-submenu">
                  {cat.children.map((child) => (
                    <Link
                      key={child.id}
                      to={`/c/${encodeURIComponent(child.id)}`}
                      className={`nav-sublink ${isActive(`/c/${encodeURIComponent(child.id)}`) ? 'active' : ''}`}
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
            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            to="/donate"
            className={`nav-link ${isActive('/donate') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Donate
          </Link>
        </nav>

        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
