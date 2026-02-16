import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { resolveImageUrl } from '../../lib/imageUtils';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, product, quantity, selectedColor }) => {
  const navigate = useNavigate();
  const { saveOrderDetails, clearCart } = useCart();
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

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderData = {
      orderId: `RUVALI-${Date.now()}`,
      product: product,
      quantity: quantity,
      selectedColor: selectedColor,
      shippingAddress: formData,
      totalAmount: (typeof product.price === 'number'
        ? product.price
        : Number(product.price || 0)) * quantity,
      orderDate: new Date().toISOString(),
    };
    saveOrderDetails(orderData);
    clearCart();
    onClose();
    navigate('/payment', { state: { orderData } });
  };

  const priceNumber =
    typeof product?.price === 'number' ? product.price : Number(product?.price || 0);

  const rawImage =
    product?.image ||
    (Array.isArray(product?.images) && product.images.length > 0 ? product.images[0] : null);
  const imageUrl = rawImage ? resolveImageUrl(rawImage) : null;

  return (
    <div className="checkout-modal-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <button className="checkout-close" onClick={onClose}>×</button>
        
        <h2 className="checkout-title">Shipping Details</h2>
        
        <div className="checkout-product-summary">
          {imageUrl && (
            <img src={imageUrl} alt={product?.name} className="checkout-product-image" />
          )}
          <div>
            <h3>{product?.name}</h3>
            <p>Quantity: {quantity}</p>
            <p>Total: ₹{(priceNumber * quantity).toLocaleString('en-IN')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
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
              <label>Phone Number *</label>
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

          <button type="submit" className="checkout-submit-btn">
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
