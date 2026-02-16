import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminOrders } from '../../../hooks/useAdminOrders';
import './AdminOrders.css';

const STATUS_COLORS = {
  PLACED: '#f59e0b',
  CONFIRMED: '#3b82f6',
  PACKED: '#8b5cf6',
  SHIPPED: '#06b6d4',
  DELIVERED: '#22c55e',
};

const AdminOrders = () => {
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { data: orders = [], isLoading, updateStatus, updateLoading } = useAdminOrders();

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateStatus({ orderId, status: newStatus });
      setSelectedOrder(null);
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="admin-orders">
      <h1>Orders</h1>

      <div className="admin-orders-filters">
        {['all', 'PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'].map((s) => (
          <button
            key={s}
            className={`admin-orders-filter-btn ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="admin-orders-loading">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-orders-empty">No orders yet.</div>
      ) : (
        <div className="admin-orders-list">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              className="admin-order-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="admin-order-header">
                <div>
                  <h3>Order #{order.id.slice(-8)}</h3>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span
                  className="admin-order-status-badge"
                  style={{ backgroundColor: STATUS_COLORS[order.status] || '#666' }}
                >
                  {order.status}
                </span>
              </div>
              <div className="admin-order-summary">
                <p>₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
                <p>{order.items?.length || 0} item(s)</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="admin-order-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              className="admin-order-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-order-modal-header">
                <h2>Order #{selectedOrder.id.slice(-8)}</h2>
                <button onClick={() => setSelectedOrder(null)}>×</button>
              </div>
              <div className="admin-order-modal-body">
                <div className="admin-order-status-section">
                  <label>Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleStatusChange(selectedOrder.id, e.target.value)
                    }
                    disabled={updateLoading}
                  >
                    <option value="PLACED">Placed</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PACKED">Packed</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </div>

                <div className="admin-order-items">
                  <h4>Items</h4>
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="admin-order-item">
                      <img
                        src={
                          item.product?.images?.[0] ||
                          'https://via.placeholder.com/80x80?text=No+Image'
                        }
                        alt={item.product?.name}
                      />
                      <div>
                        <h5>{item.product?.name}</h5>
                        <p>
                          {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="admin-order-shipping">
                  <h4>Shipping</h4>
                  <p>{selectedOrder.shippingInfo?.fullName}</p>
                  <p>{selectedOrder.shippingInfo?.address}</p>
                  <p>
                    {selectedOrder.shippingInfo?.city},{' '}
                    {selectedOrder.shippingInfo?.state} -{' '}
                    {selectedOrder.shippingInfo?.pincode}
                  </p>
                  <p>{selectedOrder.shippingInfo?.phone}</p>
                </div>

                <div className="admin-order-total">
                  <strong>Total: ₹{Number(selectedOrder.totalAmount).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
