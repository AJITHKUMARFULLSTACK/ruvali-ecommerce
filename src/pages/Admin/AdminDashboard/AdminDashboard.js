import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      const response = await fetch('http://localhost:5005/api/orders', {
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
    <div className="admin-dashboard">
      <div className="admin-dashboard-inner">
        <div className="admin-header">
          <h1>Dashboard</h1>
        </div>

        <div className="admin-stats-grid">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-value">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Orders</h3>
            <p className="stat-value">{stats.pendingCount}</p>
          </div>
          <div className="stat-card">
            <h3>Completed Orders</h3>
            <p className="stat-value">{stats.deliveredCount}</p>
          </div>
        </div>

        <div className="admin-quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button onClick={() => navigate('/admin/products/new')} className="action-btn">
              Add New Product
            </button>
            <button onClick={() => navigate('/admin/orders')} className="action-btn">
              View Orders
            </button>
            <button onClick={() => navigate('/admin/settings')} className="action-btn">
              Update Theme Colors
            </button>
            <button onClick={() => navigate('/admin/categories')} className="action-btn">
              Manage Categories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
