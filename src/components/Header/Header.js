import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../Assets/Images/Logo.png';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src={logo} alt="RUVALI" className="logo-image" />
        </Link>
        
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <Link 
            to="/men" 
            className={`nav-link ${isActive('/men') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Men
          </Link>
          <Link 
            to="/women" 
            className={`nav-link ${isActive('/women') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Women
          </Link>
          <Link 
            to="/lgbtq" 
            className={`nav-link ${isActive('/lgbtq') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            LGBTQ
          </Link>
          <Link 
            to="/kids" 
            className={`nav-link ${isActive('/kids') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Kids
          </Link>
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

