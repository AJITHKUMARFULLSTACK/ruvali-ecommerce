import React from 'react';
import aboutImage from '../../Assets/Images/AboutUs.png';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-wrapper">
        <div className="about-text-section">
          <h1 className="about-title">ABOUT US</h1>

          <p className="about-paragraph">
            At <span className="about-brand">RUVALI</span>, fashion is not just what you wear –
            it is who you become.
          </p>

          <p className="about-paragraph">
            Founded with a vision to blend heritage craftsmanship with modern design, our
            collections are created for those who demand elegance with edge. Every piece
            embodies artistry, precision, and sophistication designed to stand out while
            remaining timeless.
          </p>

          <p className="about-paragraph">
            From bold statement silhouettes to minimal everyday staples, RUVALI is for
            individuals who see style as a language of confidence and self‑expression.
          </p>

          <div className="about-philosophy">
            <div className="about-philosophy-accent" />
            <p className="about-philosophy-text">
              Our philosophy is simple: “Carry simplicity, move effortlessly, and be unique in
              every space you enter”.
            </p>
          </div>
        </div>

        <div className="about-image-section">
          <div className="about-image-oval">
            <img src={aboutImage} alt="RUVALI customer in the city" className="about-image" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

