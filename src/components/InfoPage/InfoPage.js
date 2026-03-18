import React from 'react';
import { motion } from 'framer-motion';
import { TOP_NAV_HEIGHT } from '../TopNav/TopNav';
import './InfoPage.css';

const InfoPage = ({ title, children }) => (
  <motion.div
    className="info-page"
    style={{ paddingTop: TOP_NAV_HEIGHT }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.35 }}
  >
    <div className="info-container">
      <motion.h1
        className="info-title"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {title}
      </motion.h1>
      <motion.div
        className="info-content"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        {children}
      </motion.div>
    </div>
  </motion.div>
);

export default InfoPage;
