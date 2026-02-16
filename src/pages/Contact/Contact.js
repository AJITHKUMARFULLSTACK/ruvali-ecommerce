import React from 'react';
import { TOP_NAV_HEIGHT } from '../../components/TopNav/TopNav';
import landingBg from '../../Assets/Images/landingpageBg.png';
import './Contact.css';

const Contact = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="contact-page" style={{ paddingTop: TOP_NAV_HEIGHT }}>
      <div className="contact-wrapper">
        <div className="contact-left">
          <div
            className="contact-left-bg"
            style={{ backgroundImage: `url(${landingBg})` }}
          >
            <div className="contact-left-overlay" />

            <div className="contact-left-content">
              <h2 className="contact-left-title">We’d love to hear from you.</h2>
              <p className="contact-left-text">
                Please fill out the form below and we’ll get in touch soon.
              </p>

              <div className="contact-left-info">
                <div className="contact-info-row">
                  <div className="contact-icon-circle">📞</div>
                  <span className="contact-info-text">+91 9999999999</span>
                </div>
                <div className="contact-info-row">
                  <div className="contact-icon-circle">✉️</div>
                  <span className="contact-info-text">ruvalisupport@ruvali.com</span>
                </div>
                <div className="contact-info-row">
                  <div className="contact-icon-circle">📍</div>
                  <span className="contact-info-text">Chennai</span>
                </div>
                <div className="contact-info-row">
                  <div className="contact-icon-circle">in</div>
                  <span className="contact-info-text">RuvaliFashion</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-right">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <input id="name" type="text" placeholder="Name" />
            </div>
            <div className="form-field">
              <input id="email" type="email" placeholder="Enter your Email" />
            </div>
            <div className="form-field">
              <input
                id="phone"
                type="tel"
                placeholder="Enter your Phone Number (optional)"
              />
            </div>
            <div className="form-field">
              <textarea id="message" rows="4" placeholder="Enter your Message..." />
            </div>

            <button type="submit" className="submit-button">
              Discover More
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;

