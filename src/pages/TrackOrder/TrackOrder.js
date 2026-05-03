import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Form, Input, Button } from 'antd';
import InfoPage from '../../components/InfoPage/InfoPage';
import { useStore } from '../../context/StoreContext';
import { publicApiHeaders } from '../../lib/apiClient';
import './TrackOrder.css';

const STATUS_LABELS = {
  PLACED: 'Order placed',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered'
};

const TrackOrder = () => {
  const [form] = Form.useForm();
  const { backendUrl, storeSlug } = useStore();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    setLoading(true);
    setOrder(null);
    setError(null);

    try {
      const params = new URLSearchParams({
        storeSlug,
        orderId: values.orderId.trim().replace(/^#/, '').toLowerCase(),
        phone: values.phone.trim()
      });
      const res = await fetch(`${backendUrl}/api/orders/track?${params.toString()}`, {
        headers: publicApiHeaders(),
      });

      if (!res.ok) {
        if (res.status === 404) {
          setError('No order found with that ID and phone number. Please check your details.');
        } else {
          setError('Something went wrong. Please try again.');
        }
        return;
      }

      const data = await res.json();
      setOrder(data);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <InfoPage title="Track Your Order">
      <p>
        Enter your order ID and phone number to check the status of your order.
      </p>

      <Form form={form} onFinish={handleSubmit} className="track-order-form" layout="vertical">
        <Form.Item name="orderId" rules={[{ required: true, message: 'Enter order ID' }]}>
          <Input placeholder="e.g. #CLX123ABC or your order ID" size="large" />
        </Form.Item>
        <Form.Item name="phone" rules={[{ required: true, message: 'Enter phone number' }]}>
          <Input placeholder="e.g. 9876543210" size="large" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" className="track-submit-btn" loading={loading} disabled={loading}>
            Track Order
          </Button>
        </Form.Item>
      </Form>

      {error && (
        <motion.div
          className="track-result track-result--error"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="track-error-message">{error}</p>
        </motion.div>
      )}

      {order && (
        <motion.div
          className="track-result"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2>Order Status</h2>
          <div className="track-order-details">
            <div className="track-detail-row">
              <span className="track-detail-label">Order ID:</span>
              <span className="track-detail-value">#{order.id?.toUpperCase?.() || order.id}</span>
            </div>
            <div className="track-detail-row">
              <span className="track-detail-label">Status:</span>
              <span className="track-detail-value">{STATUS_LABELS[order.status] || order.status}</span>
            </div>
            <div className="track-order-items">
              <h3>Items</h3>
              {order.items?.map((item, i) => (
                <div key={i} className="track-order-item">
                  <span>{item.productName}</span>
                  <span>{item.quantity} × ₹{Number(item.price || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="track-detail-row track-total">
              <span className="track-detail-label">Total:</span>
              <span className="track-detail-value">₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            {order.statusLog?.length > 0 && (
              <div className="track-status-timeline">
                <h3>Status Timeline</h3>
                <ul>
                  {order.statusLog.map((log, i) => (
                    <li key={i}>
                      {new Date(log.timestamp).toLocaleString()} — {STATUS_LABELS[log.newStatus] || log.newStatus}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </InfoPage>
  );
};

export default TrackOrder;
