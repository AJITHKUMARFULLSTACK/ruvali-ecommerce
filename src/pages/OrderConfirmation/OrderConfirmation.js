import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderDetails } = useCart();
  const orderData = location.state?.orderData || orderDetails;

  useEffect(() => {
    if (!orderData) {
      navigate('/');
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  return (
    <div className="order-confirmation-page">
      <div className="order-confirmation-container">
        <div className="success-icon">✓</div>
        <h1 className="confirmation-title">Order Confirmed!</h1>
        <p className="confirmation-subtitle">Thank you for your purchase</p>

        <div className="order-details-card">
          <h2>Order Details</h2>
          
          <div className="detail-row">
            <span className="detail-label">Order ID:</span>
            <span className="detail-value">{orderData.orderId}</span>
          </div>

          <div className="order-product">
            <img src={orderData.product?.image} alt={orderData.product?.name} />
            <div>
              <h3>{orderData.product?.name}</h3>
              <p>Quantity: {orderData.quantity}</p>
              <p>Price: ₹{orderData.product?.price.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="detail-section">
            <h3>Shipping Address</h3>
            <p>{orderData.shippingAddress?.fullName}</p>
            <p>{orderData.shippingAddress?.address}</p>
            <p>{orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} - {orderData.shippingAddress?.pincode}</p>
            <p>{orderData.shippingAddress?.country}</p>
            <p>Phone: {orderData.shippingAddress?.phone}</p>
            <p>Email: {orderData.shippingAddress?.email}</p>
          </div>

          <div className="detail-section">
            <h3>Payment Details</h3>
            <div className="detail-row">
              <span className="detail-label">Payment Method:</span>
              <span className="detail-value">{orderData.paymentMethod?.toUpperCase()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Payment ID:</span>
              <span className="detail-value">{orderData.paymentId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Total Amount:</span>
              <span className="detail-value">₹{(orderData.totalAmount + 100).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Order Status</h3>
            <p className="status-success">✓ Payment Completed</p>
            <p className="status-info">Your order will be shipped within 2-3 business days.</p>
          </div>
        </div>

        <div className="confirmation-actions">
          <button onClick={() => navigate('/')} className="btn-continue-shopping">
            Continue Shopping
          </button>
          <button onClick={() => window.print()} className="btn-print">
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
