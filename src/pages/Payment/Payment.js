import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { resolveImageUrl } from '../../lib/imageUtils';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderDetails, saveOrderDetails } = useCart();
  const { backendUrl, storeSlug } = useStore();
  const [orderData, setOrderData] = useState(null);
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
    e.preventDefault();

    const paymentData = {
      ...orderData,
      paymentMethod,
      paymentStatus: 'completed',
      paymentId: `PAY-${Date.now()}`,
      cardDetails: paymentMethod === 'card' ? cardDetails : null,
    };

    const orderItems = paymentData.items
      ? paymentData.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      : [{ productId: paymentData.product?.id, quantity: paymentData.quantity || 1 }];

    // Create order in backend so it appears in Admin
    try {
      const response = await fetch(
        `${backendUrl}/api/orders?storeSlug=${encodeURIComponent(storeSlug)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer: {
              name: paymentData.shippingAddress?.fullName || 'Customer',
              phone: paymentData.shippingAddress?.phone || '',
            },
            items: orderItems,
            shippingInfo: paymentData.shippingAddress,
          }),
        }
      );

      const createdOrder = await response.json();
      console.log('[Payment] backend order created', createdOrder);
      paymentData.backendOrder = createdOrder;
    } catch (err) {
      console.error('[Payment] failed to create backend order', err);
    }

    saveOrderDetails(paymentData);
    navigate('/order-confirmation', { state: { orderData: paymentData } });
  };

  if (!orderData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1 className="payment-title">Payment</h1>

        <div className="payment-content">
          <div className="order-summary-section">
            <h2>Order Summary</h2>
            {orderData.items ? (
              orderData.items.map((item) => {
                const img = item.product?.image || (item.product?.images?.[0]);
                const price = typeof item.product?.price === 'number' ? item.product.price : Number(item.product?.price || 0);
                return (
                  <div key={item.productId} className="order-item">
                    <img src={img ? resolveImageUrl(img) : ''} alt={item.product?.name} />
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
            <div className="payment-methods">
              <button
                className={`payment-method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                Credit/Debit Card
              </button>
              <button
                className={`payment-method-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('upi')}
              >
                UPI
              </button>
              <button
                className={`payment-method-btn ${paymentMethod === 'cod' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                Cash on Delivery
              </button>
            </div>

            {paymentMethod === 'card' && (
              <form onSubmit={handlePayment} className="card-form">
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleCardInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    name="cardName"
                    value={cardDetails.cardName}
                    onChange={handleCardInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={cardDetails.expiryDate}
                      onChange={handleCardInputChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleCardInputChange}
                      placeholder="123"
                      maxLength="3"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="pay-now-btn">
                  Pay ₹{(orderData.totalAmount + 100).toLocaleString('en-IN')}
                </button>
              </form>
            )}

            {paymentMethod === 'upi' && (
              <form onSubmit={handlePayment} className="upi-form">
                <div className="form-group">
                  <label>UPI ID</label>
                  <input
                    type="text"
                    placeholder="yourname@upi"
                    required
                  />
                </div>
                <button type="submit" className="pay-now-btn">
                  Pay ₹{(orderData.totalAmount + 100).toLocaleString('en-IN')}
                </button>
              </form>
            )}

            {paymentMethod === 'cod' && (
              <div className="cod-info">
                <p>Pay ₹{(orderData.totalAmount + 100).toLocaleString('en-IN')} when your order arrives.</p>
                <button onClick={handlePayment} className="pay-now-btn">
                  Confirm Order
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
