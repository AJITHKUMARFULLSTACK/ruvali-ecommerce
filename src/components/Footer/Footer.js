import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../Assets/Images/Logo.png';
import { useStore } from '../../context/StoreContext';
import { useCategories } from '../../hooks/useCategories';
import { resolveImageUrl } from '../../lib/imageUtils';
import { getCategorySlug } from '../../lib/slugUtils';
import './Footer.css';

const Footer = () => {
  const { store } = useStore();
  const { tree: categoriesTree } = useCategories();
  const logoUrl = store?.logo ? resolveImageUrl(store.logo) : logo;

  const categoryLinks = React.useMemo(() => {
    const links = [];
    categoriesTree.forEach((cat) => {
      links.push({ id: cat.id, name: cat.name, slug: getCategorySlug(cat), parentSlug: null });
      (cat.children || []).forEach((child) => {
        links.push({
          id: child.id,
          name: child.name,
          slug: getCategorySlug(child),
          parentSlug: getCategorySlug(cat),
        });
      });
    });
    return links;
  }, [categoriesTree]);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">PRODUCTS</h3>
          <ul className="footer-links">
            {categoryLinks.length > 0 ? (
              categoryLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.parentSlug ? `/c/${encodeURIComponent(item.parentSlug)}/${encodeURIComponent(item.slug)}` : `/c/${encodeURIComponent(item.slug)}`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li><Link to="/c">Shop All</Link></li>
              </>
            )}
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">CUSTOMER CARE</h3>
          <ul className="footer-links">
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/shipping">Shipping Information</Link></li>
            <li><Link to="/returns">Returns & Exchanges</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/size-guide">Size Guide</Link></li>
            <li><Link to="/track-order">Track Your Order</Link></li>
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
          <img src={logoUrl} alt="RUVALI" className="footer-logo" />
          <p>&copy; 2024 RUVALI. All rights reserved.</p>
        </div>
        <p className="footer-tagline">Where Elegance Meets Artistry</p>
      </div>
    </footer>
  );
};

export default Footer;

