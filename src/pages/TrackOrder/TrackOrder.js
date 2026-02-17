import React, { useState } from 'react';
import InfoPage from '../../components/InfoPage/InfoPage';
import './TrackOrder.css';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderId.trim() && email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <InfoPage title="Track Your Order">
      <p>
        Enter your order ID and email address to check the status of your order.
      </p>

      <form className="track-order-form" onSubmit={handleSubmit}>
        <div className="track-form-group">
          <label htmlFor="orderId">Order ID</label>
          <input
            id="orderId"
            type="text"
            placeholder="e.g. RUVALI-1234567890"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />
        </div>
        <div className="track-form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="track-submit-btn">
          Track Order
        </button>
      </form>

      {submitted && (
        <div className="track-result">
          <h2>Order Status</h2>
          <p className="track-status-message">
            Your order <strong>{orderId}</strong> has been received. You will
            receive tracking updates at <strong>{email}</strong> once the order
            is shipped.
          </p>
          <p className="track-status-note">
            If you placed your order recently, it may take 24–48 hours for the
            status to update. For assistance, contact us at support@ruvali.com.
          </p>
        </div>
      )}
    </InfoPage>
  );
};

export default TrackOrder;
