import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { resolveImageUrl } from '../../lib/imageUtils';
import { TOP_NAV_HEIGHT } from '../../components/TopNav/TopNav';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, saveOrderDetails, clearCart } = useCart();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems.length, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderData = {
      orderId: `RUVALI-${Date.now()}`,
      items: cartItems.map((item) => ({
        product: item,
        productId: item.id,
        quantity: item.quantity,
      })),
      shippingAddress: formData,
      totalAmount: getCartTotal(),
      orderDate: new Date().toISOString(),
    };
    saveOrderDetails(orderData);
    clearCart();
    navigate('/payment', { state: { orderData } });
  };

  const rawImage = (item) =>
    item.image ||
    (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null);
  const priceNum = (item) =>
    typeof item.price === 'number' ? item.price : Number(item.price || 0);

  if (cartItems.length === 0) return null;

  return (
    <div className="checkout-page" style={{ paddingTop: TOP_NAV_HEIGHT }}>
      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-sections">
            <div className="checkout-shipping">
              <h2>Shipping Details</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="checkout-summary">
              <h2>Order Summary</h2>
              <div className="checkout-items">
                {cartItems.map((item) => {
                  const imgUrl = rawImage(item)
                    ? resolveImageUrl(rawImage(item))
                    : `https://api.lorem.space/image/fashion?w=80&h=80&hash=${item.id}`;
                  return (
                    <div key={item.id} className="checkout-item">
                      <img src={imgUrl} alt={item.name} />
                      <div>
                        <p className="checkout-item-name">{item.name}</p>
                        <p className="checkout-item-qty">
                          {item.quantity} × ₹{priceNum(item).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <span className="checkout-item-total">
                        ₹{(priceNum(item) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="checkout-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>₹100</span>
                </div>
                <div className="total-row total-final">
                  <span>Total</span>
                  <span>₹{(getCartTotal() + 100).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <button type="submit" className="checkout-submit-btn">
                Proceed to Payment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
