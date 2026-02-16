import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { resolveImageUrl } from '../../lib/imageUtils';
import logo from '../../Assets/Images/Logo.png';
import './LuxuryHero.css';

/**
 * Brand layer only - hero content.
 * Big RUVALI/category name, slogan, logo top-left.
 * NO navigation links. Pure visual branding.
 */
const LuxuryHero = ({
  image,
  title = 'RUVALI',
  subtitle,
  isHome = false,
  categoryName,
}) => {
  const { store } = useStore();
  const logoUrl = store?.logo ? resolveImageUrl(store.logo) : logo;

  const bgImage = image
    ? `url(${image})`
    : 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)';

  return (
    <section className="luxury-hero" style={{ height: '100vh' }}>
      <div
        className="luxury-hero-bg"
        style={{ backgroundImage: bgImage }}
        aria-hidden
      />
      <div className="luxury-hero-overlay" aria-hidden />
      <div className="luxury-hero-vignette" aria-hidden />
      <div className="luxury-hero-blur-bottom" aria-hidden />

      <Link to="/" className="luxury-hero-logo" aria-label="RUVALI Home">
        <img
          src={logoUrl}
          alt="RUVALI"
          className="luxury-hero-logo-image"
        />
      </Link>

      {categoryName && (
        <div className="luxury-hero-category-label">{categoryName}</div>
      )}

      <div className="luxury-hero-text">
        {categoryName ? (
          <Link to="/" className="luxury-hero-center-logo" aria-label="RUVALI Home">
            <img
              src={logoUrl}
              alt="RUVALI"
              className="luxury-hero-center-logo-image"
            />
          </Link>
        ) : (
          <>
            <h1 className="luxury-hero-title">{title}</h1>
            {subtitle && (
              <p className="luxury-hero-subtitle">{subtitle}</p>
            )}
            {isHome && (
              <Link to="/c" className="luxury-hero-cta">
                Discover the Collection
              </Link>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default LuxuryHero;
