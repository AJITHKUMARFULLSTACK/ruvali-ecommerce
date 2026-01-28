import React, { useState, useEffect } from 'react';
import logo from '../../Assets/Images/Logo.png';
import './Hero.css';

const Hero = ({ image, images, title, subtitle, isHome = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Handle slideshow if multiple images are provided
  useEffect(() => {
    if (images && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000); // Change image every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [images]);

  // Determine which image(s) to use
  const displayImages = images && images.length > 0 ? images : (image ? [image] : []);

  return (
    <section className="hero">
      <div className="hero-image-container">
        {displayImages.length > 0 && (
          <div className="hero-background-wrapper">
            {displayImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Background ${index + 1}`}
                className={`hero-background-image ${index === currentImageIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        )}
        <div className="hero-overlay"></div>
        {(title || isHome) && (
          <div className={`hero-content ${isHome ? 'hero-content--home' : ''}`}>
            {isHome ? (
              <>
                <div className="hero-title-block">
                  <h1 className="hero-title-line hero-title-line--top">ELEGANCE</h1>
                  <h1 className="hero-title-line hero-title-line--bottom">MEETS ARTISTRY</h1>
                </div>

                <div className="hero-meta-row">
                  <div className="hero-accent-block" />
                  <div className="hero-meta-text">
                    <p className="hero-body-text">
                      Step into a world of refined craftsmanship and timeless silhouettes.
                    </p>
                    <p className="hero-body-text hero-body-text--secondary">
                      Each piece is thoughtfully designed to embody grace, confidence, and quiet luxury.
                    </p>
                  </div>
                  <div className="hero-cta-row">
                    <button className="hero-cta hero-cta--ghost">Rave design 2026</button>
                    <button className="hero-cta hero-cta--primary">Discover the Collection</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {subtitle && <p className="hero-subtitle">{subtitle}</p>}
                {title && <h1 className="hero-title">{title}</h1>}
              </>
            )}
          </div>
        )}
        <div className="hero-logo">
          <img src={logo} alt="RUVALI" className="hero-logo-image" />
        </div>
        {displayImages.length > 1 && (
          <div className="hero-slideshow-indicators">
            {displayImages.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;

