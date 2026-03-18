import React from 'react';
import { motion } from 'framer-motion';
import { TOP_NAV_HEIGHT } from '../../components/TopNav/TopNav';
import aboutImage from '../../Assets/Images/AboutUs.png';
import './About.css';

const About = () => {
  return (
    <motion.div
      className="about-page"
      style={{ paddingTop: TOP_NAV_HEIGHT }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="about-wrapper">
        <motion.div
          className="about-text-section"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
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
        </motion.div>

        <motion.div
          className="about-image-section"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="about-image-oval">
            <img src={aboutImage} alt="RUVALI customer in the city" className="about-image" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default About;

