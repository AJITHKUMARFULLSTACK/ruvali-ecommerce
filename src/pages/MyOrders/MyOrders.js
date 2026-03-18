import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useCustomer } from '../../context/CustomerContext';
import { TOP_NAV_HEIGHT } from '../../components/TopNav/TopNav';
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';
import './MyOrders.css';

const STATUS_LABELS = {
  PLACED: 'Order placed',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered'
};

const STATUS_COLORS = {
  PLACED: '#f59e0b',
  CONFIRMED: '#3b82f6',
  PACKED: '#8b5cf6',
  SHIPPED: '#06b6d4',
  DELIVERED: '#22c55e'
};

const MyOrders = () => {
  const { backendUrl, storeSlug } = useStore();
  const { customer, token, isLoggedIn } = useCustomer();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `${backendUrl}/api/customer/orders?storeSlug=${encodeURIComponent(storeSlug)}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error?.message || 'Failed to load orders');
          return;
        }
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [backendUrl, storeSlug, token, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="my-orders-page" style={{ paddingTop: TOP_NAV_HEIGHT }}>
        <div className="my-orders-container">
          <ScrollReveal>
            <h1>My Orders</h1>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="my-orders-login-prompt">
              Please <Link to="/account/login">login</Link> to view your orders.
            </p>
          </ScrollReveal>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-orders-page" style={{ paddingTop: TOP_NAV_HEIGHT }}>
        <div className="my-orders-container">
          <ScrollReveal>
            <h1>My Orders</h1>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p>Loading orders...</p>
          </ScrollReveal>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-orders-page" style={{ paddingTop: TOP_NAV_HEIGHT }}>
        <div className="my-orders-container">
          <ScrollReveal>
            <h1>My Orders</h1>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="my-orders-error">{error}</p>
          </ScrollReveal>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page" style={{ paddingTop: TOP_NAV_HEIGHT }}>
      <div className="my-orders-container">
        <ScrollReveal>
          <h1>My Orders</h1>
        </ScrollReveal>
        {orders.length === 0 ? (
          <ScrollReveal delay={0.1}>
            <p className="my-orders-empty">You have not placed any orders yet.</p>
          </ScrollReveal>
        ) : (
          <div className="my-orders-list">
            {orders.map((order, index) => (
              <ScrollReveal key={order.id} delay={index * 0.06}>
                <div className="my-order-card">
                  <div className="my-order-header">
                    <div>
                      <h3>Order #{order.id?.slice(-8) || order.id}</h3>
                      <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span
                      className="my-order-status-badge"
                      style={{ backgroundColor: STATUS_COLORS[order.status] || '#666' }}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <div className="my-order-items">
                    {order.items?.map((item, i) => (
                      <div key={i} className="my-order-item">
                        <span>{item.productName}</span>
                        <span>{item.quantity} × ₹{Number(item.price || 0).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="my-order-total">
                    Total: ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
