import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from 'antd';
import { useCart } from '../../context/CartContext';
import { resolveImageUrl } from '../../lib/imageUtils';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
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
    <motion.div
      className="order-confirmation-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="order-confirmation-container">
        <ScrollReveal>
          <div className="success-icon">✓</div>
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <h1 className="confirmation-title">Order Confirmed!</h1>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="confirmation-subtitle">Thank you for your purchase</p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="order-details-card">
            <h2>Order Details</h2>
          
            <div className="detail-row">
              <span className="detail-label">Order ID:</span>
              <span className="detail-value">
                {orderData.backendOrder?.id
                  ? `#${orderData.backendOrder.id.toUpperCase()}`
                  : orderData.orderId || '—'}
              </span>
            </div>

            <ScrollReveal delay={0.1}>
              <div>
                {(orderData.items || []).map((item) => {
                  const img = item.product?.image || item.product?.images?.[0];
                  const price = typeof item.product?.price === 'number' ? item.product.price : Number(item.product?.price || 0);
                  return (
                    <div key={item.productId} className="order-product">
                      <img src={img ? resolveImageUrl(img) : ''} alt={item.product?.name} />
                      <div>
                        <h3>{item.product?.name}</h3>
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: ₹{price.toLocaleString('en-IN')} each</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="detail-section">
                <h3>Shipping Address</h3>
                <p>{orderData.shippingAddress?.fullName}</p>
                <p>{orderData.shippingAddress?.address}</p>
                <p>{orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} - {orderData.shippingAddress?.pincode}</p>
                <p>{orderData.shippingAddress?.country}</p>
                <p>Phone: {orderData.shippingAddress?.phone}</p>
                <p>Email: {orderData.shippingAddress?.email}</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
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
                  <span className="detail-value">
                    ₹{(
                      orderData.backendOrder?.totalAmount != null
                        ? Number(orderData.backendOrder.totalAmount)
                        : (orderData.totalAmount || 0) + 100
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <div className="detail-section">
                <h3>Order Status</h3>
                {orderData.paymentStatus === 'PAID' ? (
                  <>
                    <p className="status-success">✓ Payment Completed</p>
                    <p className="status-info">Your order will be shipped within 2-3 business days.</p>
                  </>
                ) : (
                  <>
                    <p className="status-success">✓ Order Placed</p>
                    <p className="status-info">Pay on delivery. Your order will be shipped within 2-3 business days.</p>
                  </>
                )}
              </div>
            </ScrollReveal>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="confirmation-actions">
            <Button type="primary" size="large" onClick={() => navigate('/')} className="btn-continue-shopping">
              Continue Shopping
            </Button>
            <Button size="large" onClick={() => window.print()} className="btn-print">
              Print Receipt
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </motion.div>
  );
};

export default OrderConfirmation;
