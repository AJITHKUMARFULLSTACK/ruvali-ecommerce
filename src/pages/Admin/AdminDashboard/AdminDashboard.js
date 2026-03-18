import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiBaseUrl } from '../../../lib/apiClient';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingCount: 0,
    deliveredCount: 0
  });
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${apiBaseUrl}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const orders = await response.json();

      const totalOrders = Array.isArray(orders) ? orders.length : 0;
      const totalRevenue = Array.isArray(orders)
        ? orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
        : 0;
      const pendingCount = Array.isArray(orders)
        ? orders.filter(o => o.status === 'PLACED').length
        : 0;
      const deliveredCount = Array.isArray(orders)
        ? orders.filter(o => o.status === 'DELIVERED').length
        : 0;

      setStats({
        totalOrders,
        totalRevenue,
        pendingCount,
        deliveredCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
