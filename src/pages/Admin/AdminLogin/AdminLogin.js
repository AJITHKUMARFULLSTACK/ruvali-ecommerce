import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '../../lib/apiClient';
import './AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState(''); // used as email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token, admin, and store info for later use
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      if (data.store) {
        localStorage.setItem('adminStore', JSON.stringify(data.store));
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <h1 className="admin-login-title">RUVALI Admin</h1>
          <p className="admin-login-subtitle">Sign in to manage your store</p>
          
          {error && <div className="admin-login-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="admin-login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
