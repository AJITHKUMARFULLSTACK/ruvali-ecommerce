import React from 'react';
import logo from '../../Assets/Images/Logo.png';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">PRODUCTS</h3>
          <ul className="footer-links">
            <li><a href="/men">Men's Collection</a></li>
            <li><a href="/women">Women's Collection</a></li>
            <li><a href="/lgbtq">LGBTQ Collection</a></li>
            <li><a href="/kids">Kids Collection</a></li>
            <li><a href="/accessories">Accessories</a></li>
            <li><a href="/shoes">Shoes & Sneakers</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">CUSTOMER CARE</h3>
          <ul className="footer-links">
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/shipping">Shipping Information</a></li>
            <li><a href="/returns">Returns & Exchanges</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/size-guide">Size Guide</a></li>
            <li><a href="/track-order">Track Your Order</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">OUR PAYMENT METHODS</h3>
          <div className="payment-methods">
            <div className="payment-icon">Visa</div>
            <div className="payment-icon">Mastercard</div>
            <div className="payment-icon">UPI</div>
            <div className="payment-icon">PayPal</div>
            <div className="payment-icon">Razorpay</div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-logo-container">
          <img src={logo} alt="RUVALI" className="footer-logo" />
          <p>&copy; 2024 RUVALI. All rights reserved.</p>
        </div>
        <p className="footer-tagline">Where Elegance Meets Artistry</p>
      </div>
    </footer>
  );
};

export default Footer;

