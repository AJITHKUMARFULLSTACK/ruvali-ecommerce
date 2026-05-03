import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../context/StoreContext';
import { useCustomer } from '../../context/CustomerContext';
import logoImg from '../../Assets/Images/Logo.png';
import landingBg from '../../Assets/Images/LandingBg.png';
import { publicApiHeaders } from '../../lib/apiClient';
import './CustomerLogin.css';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const { backendUrl, storeSlug } = useStore();
  const { login } = useCustomer();
  const [loginError, setLoginError] = useState(null);
  const [registerError, setRegisterError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('login');
  const [loginValues, setLoginValues] = useState({ email: '', password: '' });
  const [registerValues, setRegisterValues] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const storeName = 'RUVALI';
  const heroStyle = useMemo(
    () => ({
      backgroundImage: `url(${landingBg})`,
    }),
    []
  );

  const handleLogin = async (values) => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await fetch(
        `${backendUrl}/api/customer/login?storeSlug=${encodeURIComponent(storeSlug)}`,
        {
          method: 'POST',
          headers: publicApiHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ email: values.email, password: values.password })
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data?.error?.message || data?.error || 'Login failed');
        return;
      }
      login(data.token, data.customer);
      navigate('/');
    } catch (err) {
      setLoginError('Something went wrong. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (values) => {
    if (values.password !== values.confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }
    if (values.password.length < 8) {
      setRegisterError('Password must be at least 8 characters');
      return;
    }
    setRegisterError(null);
    setRegisterLoading(true);
    try {
      const res = await fetch(
        `${backendUrl}/api/customer/register?storeSlug=${encodeURIComponent(storeSlug)}`,
        {
          method: 'POST',
          headers: publicApiHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            phone: values.phone,
            password: values.password
          })
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data?.error?.message || data?.error || 'Registration failed');
        return;
      }
      login(data.token, data.customer);
      navigate('/');
    } catch (err) {
      setRegisterError('Something went wrong. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="customer-login-page">
      <motion.aside
        className="customer-login-left"
        style={heroStyle}
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="customer-login-left-overlay" />
        <div className="customer-login-left-content">
          <img src={logoImg} alt={storeName} className="customer-login-logo" />
          <div className="customer-login-brand">{storeName}</div>
          <div className="customer-login-tagline shimmer">Where Elegance Meets Artistry</div>
        </div>
      </motion.aside>

      <motion.main
        className="customer-login-right"
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="customer-login-form">
          <div className="customer-login-mini-brand">{storeName}</div>
          <h1 className="customer-login-title">{activeTab === 'login' ? 'Welcome back' : 'Create account'}</h1>

          <div className="login-tabs" role="tablist" aria-label="Account tabs">
            <button
              type="button"
              className={`login-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setRegisterError(null);
                setLoginError(null);
                setActiveTab('login');
              }}
              role="tab"
              aria-selected={activeTab === 'login'}
            >
              Login
            </button>
            <button
              type="button"
              className={`login-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setRegisterError(null);
                setLoginError(null);
                setActiveTab('register');
              }}
              role="tab"
              aria-selected={activeTab === 'register'}
            >
              Register
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.div
                key="login"
                className="login-panel"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {loginError && <div className="login-error">{loginError}</div>}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin(loginValues);
                  }}
                >
                  <motion.div
                    className="login-field"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <label className="login-label">Email</label>
                    <input
                      className="login-input"
                      type="email"
                      value={loginValues.email}
                      onChange={(e) => setLoginValues((v) => ({ ...v, email: e.target.value }))}
                      placeholder="your@email.com"
                      autoComplete="email"
                      required
                    />
                  </motion.div>

                  <motion.div
                    className="login-field"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <label className="login-label">Password</label>
                    <input
                      className="login-input"
                      type="password"
                      value={loginValues.password}
                      onChange={(e) => setLoginValues((v) => ({ ...v, password: e.target.value }))}
                      placeholder="Password"
                      autoComplete="current-password"
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    <button className="login-submit-btn" type="submit" disabled={loginLoading}>
                      {loginLoading ? 'Signing in...' : 'Login'}
                    </button>
                  </motion.div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                className="login-panel"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {registerError && <div className="login-error">{registerError}</div>}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRegister(registerValues);
                  }}
                >
                  <motion.div
                    className="login-field"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <label className="login-label">Full Name</label>
                    <input
                      className="login-input"
                      type="text"
                      value={registerValues.name}
                      onChange={(e) => setRegisterValues((v) => ({ ...v, name: e.target.value }))}
                      placeholder="Your name"
                      autoComplete="name"
                      required
                    />
                  </motion.div>

                  <motion.div
                    className="login-field"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <label className="login-label">Email</label>
                    <input
                      className="login-input"
                      type="email"
                      value={registerValues.email}
                      onChange={(e) => setRegisterValues((v) => ({ ...v, email: e.target.value }))}
                      placeholder="your@email.com"
                      autoComplete="email"
                      required
                    />
                  </motion.div>

                  <motion.div
                    className="login-field"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    <label className="login-label">Phone</label>
                    <input
                      className="login-input"
                      type="tel"
                      value={registerValues.phone}
                      onChange={(e) => setRegisterValues((v) => ({ ...v, phone: e.target.value }))}
                      placeholder="10-digit phone number"
                      autoComplete="tel"
                      required
                    />
                  </motion.div>

                  <motion.div
                    className="login-field"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <label className="login-label">Password</label>
                    <input
                      className="login-input"
                      type="password"
                      value={registerValues.password}
                      onChange={(e) => setRegisterValues((v) => ({ ...v, password: e.target.value }))}
                      placeholder="Min 8 characters"
                      autoComplete="new-password"
                      required
                    />
                  </motion.div>

                  <motion.div
                    className="login-field"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                  >
                    <label className="login-label">Confirm Password</label>
                    <input
                      className="login-input"
                      type="password"
                      value={registerValues.confirmPassword}
                      onChange={(e) => setRegisterValues((v) => ({ ...v, confirmPassword: e.target.value }))}
                      placeholder="Confirm password"
                      autoComplete="new-password"
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                  >
                    <button className="login-submit-btn" type="submit" disabled={registerLoading}>
                      {registerLoading ? 'Creating...' : 'Register'}
                    </button>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
};

export default CustomerLogin;
