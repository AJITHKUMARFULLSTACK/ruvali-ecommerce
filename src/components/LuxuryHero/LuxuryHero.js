import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LuxuryHero.css';

/**
 * Brand layer only - hero content.
 * Big RUVALI/category name, slogan, logo top-left.
 * NO navigation links. Pure visual branding.
 */
const LuxuryHero = ({
  image,
  isHome = false,
  title,
}) => {
  const navigate = useNavigate();

  const heroImage = image;

  return (
    <section className={`hero-section${!isHome ? ' hero-section--category' : ''}`}>
      <div className="hero-bg" aria-hidden>
        {heroImage ? (
          <img src={heroImage} alt="" className="hero-bg-img" />
        ) : (
          <div className="hero-bg-img" />
        )}
        <div className="hero-bg-overlay" />
      </div>

      {!isHome && title && (
        <div className="hero-category-label">
          <h1 className="hero-category-name">{title}</h1>
        </div>
      )}

      {isHome ? (
        <>
          <div className="hero-content">
            <div className="hero-line-1">
              <motion.span
                className="hero-word-elegance"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                ELEGANCE
              </motion.span>
            </div>

            <div className="hero-line-2">
              <motion.span
                className="hero-word-meets"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                MEETS
              </motion.span>
              <motion.span
                className="hero-word-artistry"
                initial={{ x: 150, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                ARTISTRY
              </motion.span>
            </div>
          </div>

          <motion.div
            className="hero-bottom"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="hero-bottom-left">
              <div className="hero-red-square" />
              <div className="hero-subtitle">
                <p>Step into a world of refined craftsmanship and timeless silhouettes.</p>
                <p>Each piece is thoughtfully designed to embody grace, confidence, and quiet luxury.</p>
              </div>
            </div>

            <div className="hero-bottom-right">
              <button className="hero-btn-outline" type="button" onClick={() => navigate('/c')}>
                Latest Arrivals
              </button>
              <button className="hero-btn-filled" type="button" onClick={() => navigate('/c')}>
                Discover the Collection
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </section>
  );
};

export default LuxuryHero;
