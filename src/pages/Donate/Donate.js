import React from 'react';
import { motion } from 'framer-motion';
import { TOP_NAV_HEIGHT } from '../../components/TopNav/TopNav';
import { toast } from '../../lib/toast';
import './Donate.css';

const Donate = () => {
  const handleDonate = (amount) => {
    toast.success(`Thank you for your ₹${amount} donation!`);
  };

  return (
    <motion.div
      className="donate-page"
      style={{ paddingTop: TOP_NAV_HEIGHT }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="donate-container">
        <motion.div
          className="donate-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h2 className="donate-title">MAKE A DIFFERENCE</h2>
          <p className="donate-description">
            Your contribution helps us continue our mission of bringing elegance and artistry to everyone. 
            Every donation makes a meaningful impact on our community and the causes we support.
          </p>
          
          <div className="donation-options">
            {[
              { amount: '500', desc: 'Support our community initiatives' },
              { amount: '1,000', desc: 'Help us expand our reach' },
              { amount: '2,500', desc: 'Make a significant impact' },
              { amount: 'CUSTOM', desc: 'Choose your own amount' },
            ].map((card, i) => (
              <motion.div
                key={card.amount}
                className="donation-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <h3 className="donation-amount">₹{card.amount}</h3>
                <p className="donation-description">{card.desc}</p>
                <button className="donate-button" onClick={() => handleDonate(card.amount)}>
                  DONATE NOW
                </button>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            className="donate-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="info-title">WHERE YOUR DONATION GOES</h3>
            <ul className="info-list">
              <li>Community support programs</li>
              <li>Artistic initiatives and collaborations</li>
              <li>Sustainable fashion practices</li>
              <li>Educational workshops and events</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Donate;

