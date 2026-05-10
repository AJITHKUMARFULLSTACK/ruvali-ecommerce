import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Radio, Spin, Alert } from 'antd';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { resolveImageUrl, getProductPrimaryImageSource, PLACEHOLDER_PATH } from '../../lib/imageUtils';
import { apiPost } from '../../lib/apiClient';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderDetails, saveOrderDetails, clearCart } = useCart();
  const { storeSlug } = useStore();
  const [orderData, setOrderData] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const data = location.state?.orderData || orderDetails;
    if (!data) {
      navigate('/');
      return;
    }
    setOrderData(data);
  }, [location.state, orderDetails, navigate]);

  const handlePayment = async () => {
    setOrderError(null);
    setIsSubmitting(true);

    const subtotal =
      typeof orderData.totalAmount === 'number'
        ? orderData.totalAmount
        : Number(orderData.totalAmount) || 0;
    const totalWithShipping = subtotal + 100;
    const orderItems = orderData.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));
    const customer = {
      name: orderData.shippingAddress?.fullName || 'Customer',
      phone: orderData.shippingAddress?.phone || '',
    };

    if (paymentMethod === 'cod') {
      try {
        const data = await apiPost(
          `/api/orders?storeSlug=${encodeURIComponent(storeSlug)}`,
          {
            customer,
            items: orderItems,
            shippingInfo: orderData.shippingAddress,
            shippingAmount: 100,
          }
        );
        clearCart();
        const paymentData = {
          ...orderData,
          paymentMethod: 'cod',
          paymentStatus: 'PENDING',
          backendOrder: data,
        };
        saveOrderDetails(paymentData);
        navigate('/order-confirmation', { state: { orderData: paymentData } });
      } catch (err) {
        console.error('[Payment] COD failed', err);
        setOrderError(err.message || 'We could not place your order. Please try again.');
        setIsSubmitting(false);
      }
      return;
    }

    // Razorpay flow
    try {
      let createData;
      try {
        createData = await apiPost(
          `/api/orders/razorpay/create?storeSlug=${encodeURIComponent(storeSlug)}`,
          { amount: totalWithShipping }
        );
      } catch (e) {
        setOrderError(e.data?.error?.message || e.message || 'We could not start payment. Please try again.');
        setIsSubmitting(false);
        return;
      }

      if (!createData?.orderId) {
        setOrderError('Could not initiate payment. Please try again.');
        setIsSubmitting(false);
        return;
      }
      if (!window.Razorpay) {
        setOrderError('Payment system failed to load. Please refresh the page and try again.');
        setIsSubmitting(false);
        return;
      }

      const options = {
        key: createData.keyId,
        amount: createData.amount,
        currency: 'INR',
        name: 'Ruvali',
        description: 'Order Payment',
        order_id: createData.orderId,
        prefill: {
          name: orderData.shippingAddress?.fullName,
          contact: orderData.shippingAddress?.phone,
          email: orderData.shippingAddress?.email,
        },
        theme: { color: '#CC0000' },
        handler: async function (paymentResponse) {
          try {
            const verifyData = await apiPost(
              `/api/orders/razorpay/verify?storeSlug=${encodeURIComponent(storeSlug)}`,
              {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                customer,
                items: orderItems,
                shippingInfo: orderData.shippingAddress,
                shippingAmount: 100,
              }
            );
            clearCart();
            const paymentData = {
              ...orderData,
              paymentMethod: 'razorpay',
              paymentStatus: 'PAID',
              backendOrder: verifyData,
            };
            saveOrderDetails(paymentData);
            navigate('/order-confirmation', { state: { orderData: paymentData } });
          } catch (err) {
            console.error('[Payment] verify failed', err);
            setOrderError(
              err.data?.error?.message || err.message || 'Payment verification failed. Please contact support.'
            );
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setOrderError('Payment was cancelled. You can try again.');
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('[Payment] Razorpay failed', err);
      setOrderError('We could not start payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!orderData) {
    return (
      <div
        className="payment-page"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const subtotal =
    typeof orderData.totalAmount === 'number'
      ? orderData.totalAmount
      : Number(orderData.totalAmount) || 0;

  return (
    <motion.div
      className="payment-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="payment-container">
        <h1 className="payment-title">Payment</h1>

        {orderError && (
          <Alert type="error" message={orderError} showIcon style={{ marginBottom: 24 }} />
        )}

        <div className="payment-content">
          <div className="order-summary-section">
            <h2>Order Summary</h2>
            {orderData.items.map((item) => {
              const raw = getProductPrimaryImageSource(item.product);
              const img = raw ? resolveImageUrl(raw) : PLACEHOLDER_PATH;
              return (
                <div key={item.productId} className="order-item">
                  <img src={img} alt={item.product?.name} />
                  <div>
                    <h3>{item.product?.name}</h3>
                    <p>Quantity: {item.quantity}</p>
                    <p>
                      Price: ₹
                      {(Number(item.product?.price) || Number(item.price) || 0).toLocaleString('en-IN')} each
                    </p>
                  </div>
                </div>
              );
            })}
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>₹100</span>
              </div>
              <div className="total-row total-final">
                <span>Total</span>
                <span>₹{(subtotal + 100).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="payment-section">
            <h2>Payment Method</h2>
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="payment-methods-antd"
            >
              <Radio.Button value="razorpay">Pay Online</Radio.Button>
              <Radio.Button value="cod">Cash on Delivery</Radio.Button>
            </Radio.Group>

            {paymentMethod === 'razorpay' && (
              <div className="razorpay-info">
                <p style={{ color: '#666', marginBottom: 16, fontSize: 14 }}>
                  Pay securely via Razorpay — accepts cards, UPI, netbanking, and wallets.
                </p>
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handlePayment}
                  loading={isSubmitting}
                  className="pay-now-btn"
                >
                  Pay ₹{(subtotal + 100).toLocaleString('en-IN')}
                </Button>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="cod-info">
                <p>Pay ₹{(subtotal + 100).toLocaleString('en-IN')} when your order arrives.</p>
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handlePayment}
                  loading={isSubmitting}
                  className="pay-now-btn"
                >
                  Confirm Order
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Payment;
