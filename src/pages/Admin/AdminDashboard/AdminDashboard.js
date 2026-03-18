import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminOrders } from '../../../hooks/useAdminOrders';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useAdminOrders({ page: 1, limit: 50 });
  const orders = data?.orders ?? [];

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const pendingCount = orders.filter((o) => o.status === 'PLACED').length;
    const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
    return { totalOrders, totalRevenue, pendingCount, deliveredCount };
  }, [orders]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  return (
    <motion.div
      className="admin-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="admin-dashboard-inner">
        <motion.div
          className="admin-header"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1>Dashboard</h1>
        </motion.div>

        <div className="admin-stats-grid">
          {!isLoading && error && (
            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.35 }}
            >
              <h3>Orders</h3>
              <p className="stat-value">—</p>
              <p style={{ marginTop: 10, color: '#333', fontSize: 13 }}>
                Could not load orders. Please check your admin login and try again.
              </p>
            </motion.div>
          )}
          {[
            { label: 'Total Orders', value: stats.totalOrders },
            { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}` },
            { label: 'Pending Orders', value: stats.pendingCount },
            { label: 'Completed Orders', value: stats.deliveredCount },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="stat-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <h3>{stat.label}</h3>
              <p className="stat-value">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="admin-quick-actions"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ marginBottom: 32 }}
        >
          <h2>Recent Orders</h2>
          {isLoading ? (
            <div style={{ color: '#333' }}>Loading orders...</div>
          ) : recentOrders.length === 0 ? (
            <div style={{ color: '#333' }}>No orders yet.</div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {recentOrders.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className="action-btn"
                  onClick={() => navigate('/admin/orders')}
                  style={{ textAlign: 'left' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Order #{String(o.id).slice(-8)}</div>
                      <div style={{ fontSize: 12, opacity: 0.85 }}>
                        {new Date(o.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600 }}>₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          className="admin-quick-actions"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {[
              { label: 'Add New Product', path: '/admin/products/new' },
              { label: 'View Orders', path: '/admin/orders' },
              { label: 'Update Theme Colors', path: '/admin/settings' },
              { label: 'Manage Categories', path: '/admin/categories' },
            ].map((action, i) => (
              <motion.button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="action-btn"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {action.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
