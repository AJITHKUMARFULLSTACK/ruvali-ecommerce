import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Form, Input, Button, Radio, Spin, Alert } from 'antd';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { resolveImageUrl, getProductPrimaryImageSource } from '../../lib/imageUtils';
import { publicApiHeaders } from '../../lib/apiClient';
import { isTesting } from '../../config';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderDetails, saveOrderDetails } = useCart();
  const { backendUrl, storeSlug } = useStore();
  const [orderData, setOrderData] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    const data = location.state?.orderData || orderDetails;
    if (!data) {
      navigate('/');
      return;
    }
    setOrderData(data);
  }, [location.state, orderDetails, navigate]);

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      setCardDetails({ ...cardDetails, [name]: formatted });
    } else {
      setCardDetails({ ...cardDetails, [name]: value });
    }
  };

  const handlePayment = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setOrderError(null);

    const subtotal =
      (typeof orderData.totalAmount === 'number' ? orderData.totalAmount : Number(orderData.totalAmount)) ||
      (orderData.items || []).reduce(
        (sum, i) => sum + (Number(i.price || i.product?.price || 0) * Number(i.quantity || 1)),
        0
      );
    const totalWithShipping = subtotal + 100;
    const orderItems = orderData.items
      ? orderData.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      : [{ productId: orderData.product?.id, quantity: orderData.quantity || 1 }];

    const customer = {
      name: orderData.shippingAddress?.fullName || 'Customer',
      phone: orderData.shippingAddress?.phone || '',
    };

    // COD: use existing flow (no Razorpay)
    if (paymentMethod === 'cod') {
      try {
        const response = await fetch(
          `${backendUrl}/api/orders?storeSlug=${encodeURIComponent(storeSlug)}`,
          {
            method: 'POST',
            headers: publicApiHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
              customer,
              items: orderItems,
              shippingInfo: orderData.shippingAddress,
              shippingAmount: 100,
            }),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          setOrderError('We could not place your order. Please try again.');
          return;
        }
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
        setOrderError('We could not place your order. Please try again.');
      }
      return;
    }

    // Card / UPI: Razorpay flow
    try {
      console.log('[Razorpay] calling create with amount:', totalWithShipping);
      const createRes = await fetch(
        `${backendUrl}/api/orders/razorpay/create?storeSlug=${encodeURIComponent(storeSlug)}`,
        {
          method: 'POST',
          headers: publicApiHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ amount: totalWithShipping }),
        }
      );
      const createData = await createRes.json();
      console.log('[Razorpay] create response:', createData);
      if (!createRes.ok) {
        setOrderError(createData?.error?.message || createData?.error || 'We could not start payment. Please try again.');
        return;
      }
      if (!createData?.orderId) {
        setOrderError('Could not initiate payment. Please try again.');
        return;
      }
      if (!window.Razorpay) {
        setOrderError('Payment system failed to load. Please refresh the page and try again.');
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
        theme: { color: '#000000' },
        handler: async function (paymentResponse) {
          try {
            console.log('[Razorpay] payment success, calling verify');
            const verifyRes = await fetch(
              `${backendUrl}/api/orders/razorpay/verify?storeSlug=${encodeURIComponent(storeSlug)}`,
              {
                method: 'POST',
                headers: publicApiHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  customer,
                  items: orderItems,
                  shippingInfo: orderData.shippingAddress,
                  shippingAmount: 100,
                }),
              }
            );
            const verifyData = await verifyRes.json();
            console.log('[Razorpay] verify response:', verifyData);
            if (!verifyRes.ok) {
              setOrderError(verifyData?.error?.message || verifyData?.error || 'Payment verification failed. Please contact support.');
              return;
            }
            const paymentData = {
              ...orderData,
              paymentMethod,
              paymentStatus: 'PAID',
              backendOrder: verifyData,
            };
            saveOrderDetails(paymentData);
            navigate('/order-confirmation', { state: { orderData: paymentData } });
          } catch (err) {
            console.error('[Payment] verify failed', err);
            setOrderError('Payment verification failed. Please try again.');
          }
        },
        modal: {
          ondismiss: function () {
            console.log('[Razorpay] popup dismissed by user');
            setOrderError('Payment was cancelled. Please try again.');
          },
        },
      };
      console.log('[Razorpay] opening popup with orderId:', createData.orderId);
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.log('[Razorpay] error:', err);
      console.error('[Payment] Razorpay create failed', err);
      setOrderError('We could not start payment. Please try again.');
    }
  };

  if (!orderData) {
    return (
      <div className="payment-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <motion.div
      className="payment-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="payment-container">
        <h1 className="payment-title">Payment</h1>

        {isTesting && (
          <Alert
            type="info"
            message="Test mode — use card 4111 1111 1111 1111, any future expiry, any CVV"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {orderError && (
          <Alert type="error" message={orderError} showIcon style={{ marginBottom: 24 }} />
        )}

        <div className="payment-content">
          <div className="order-summary-section">
            <h2>Order Summary</h2>
            {orderData.items ? (
              orderData.items.map((item) => {
                const raw = getProductPrimaryImageSource(item.product);
                const img = raw ? resolveImageUrl(raw) : '';
                return (
                  <div key={item.productId} className="order-item">
                    <img src={img} alt={item.product?.name} />
                    <div>
                      <h3>{item.product?.name}</h3>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ₹{price.toLocaleString('en-IN')} each</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="order-item">
                <img src={orderData.product?.image ? resolveImageUrl(orderData.product.image) : ''} alt={orderData.product?.name} />
                <div>
                  <h3>{orderData.product?.name}</h3>
                  <p>Quantity: {orderData.quantity}</p>
                  <p>Price: ₹{orderData.product?.price?.toLocaleString('en-IN')}</p>
                </div>
              </div>
            )}
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{orderData.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>₹100</span>
              </div>
              <div className="total-row total-final">
                <span>Total</span>
                <span>₹{(orderData.totalAmount + 100).toLocaleString('en-IN')}</span>
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
              <Radio.Button value="card">Credit/Debit Card</Radio.Button>
              <Radio.Button value="upi">UPI</Radio.Button>
              <Radio.Button value="cod">Cash on Delivery</Radio.Button>
            </Radio.Group>

            {paymentMethod === 'card' && (
              <Form onFinish={handlePayment} layout="vertical" className="card-form">
                <Form.Item name="cardNumber" rules={[{ required: true }]} label="Card Number">
                  <Input
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                      setCardDetails((d) => ({ ...d, cardNumber: v }));
                    }}
                    value={cardDetails.cardNumber}
                    size="large"
                  />
                </Form.Item>
                <Form.Item name="cardName" rules={[{ required: true }]} label="Cardholder Name">
                  <Input
                    placeholder="John Doe"
                    onChange={(e) => setCardDetails((d) => ({ ...d, cardName: e.target.value }))}
                    value={cardDetails.cardName}
                    size="large"
                  />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                  <div className="form-row">
                    <Form.Item name="expiryDate" rules={[{ required: true }]} label="Expiry" style={{ flex: 1, marginRight: 12 }}>
                      <Input
                        placeholder="MM/YY"
                        maxLength={5}
                        onChange={(e) => setCardDetails((d) => ({ ...d, expiryDate: e.target.value }))}
                        value={cardDetails.expiryDate}
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item name="cvv" rules={[{ required: true }]} label="CVV" style={{ flex: 1 }}>
                      <Input
                        placeholder="123"
                        maxLength={4}
                        onChange={(e) => setCardDetails((d) => ({ ...d, cvv: e.target.value }))}
                        value={cardDetails.cvv}
                        size="large"
                      />
                    </Form.Item>
                  </div>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large" block className="pay-now-btn">
                    Pay ₹{(orderData.totalAmount + 100).toLocaleString('en-IN')}
                  </Button>
                </Form.Item>
              </Form>
            )}

            {paymentMethod === 'upi' && (
              <Form onFinish={handlePayment} layout="vertical" className="upi-form">
                <Form.Item name="upiId" rules={[{ required: true }]} label="UPI ID">
                  <Input placeholder="yourname@upi" size="large" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large" block className="pay-now-btn">
                    Pay ₹{(orderData.totalAmount + 100).toLocaleString('en-IN')}
                  </Button>
                </Form.Item>
              </Form>
            )}

            {paymentMethod === 'cod' && (
              <div className="cod-info">
                <p>Pay ₹{(orderData.totalAmount + 100).toLocaleString('en-IN')} when your order arrives.</p>
                <Button type="primary" size="large" block onClick={handlePayment} className="pay-now-btn">
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
