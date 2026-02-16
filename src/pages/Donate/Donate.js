import React from 'react';
import { TOP_NAV_HEIGHT } from '../../components/TopNav/TopNav';
import './Donate.css';

const Donate = () => {
  return (
    <div className="donate-page" style={{ paddingTop: TOP_NAV_HEIGHT }}>
      <div className="donate-container">
        <div className="donate-content">
          <h2 className="donate-title">MAKE A DIFFERENCE</h2>
          <p className="donate-description">
            Your contribution helps us continue our mission of bringing elegance and artistry to everyone. 
            Every donation makes a meaningful impact on our community and the causes we support.
          </p>
          
          <div className="donation-options">
            <div className="donation-card">
              <h3 className="donation-amount">₹500</h3>
              <p className="donation-description">Support our community initiatives</p>
              <button className="donate-button">DONATE NOW</button>
            </div>
            
            <div className="donation-card">
              <h3 className="donation-amount">₹1,000</h3>
              <p className="donation-description">Help us expand our reach</p>
              <button className="donate-button">DONATE NOW</button>
            </div>
            
            <div className="donation-card">
              <h3 className="donation-amount">₹2,500</h3>
              <p className="donation-description">Make a significant impact</p>
              <button className="donate-button">DONATE NOW</button>
            </div>
            
            <div className="donation-card">
              <h3 className="donation-amount">CUSTOM</h3>
              <p className="donation-description">Choose your own amount</p>
              <button className="donate-button">DONATE NOW</button>
            </div>
          </div>
          
          <div className="donate-info">
            <h3 className="info-title">WHERE YOUR DONATION GOES</h3>
            <ul className="info-list">
              <li>Community support programs</li>
              <li>Artistic initiatives and collaborations</li>
              <li>Sustainable fashion practices</li>
              <li>Educational workshops and events</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;

