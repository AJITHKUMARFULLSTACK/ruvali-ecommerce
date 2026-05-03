import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { apiPost, ADMIN_LOGIN_PATH } from '../../../lib/apiClient';
import { toast } from '../../../lib/toast';
import './AdminLogin.css';

const AdminLogin = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const data = await apiPost(ADMIN_LOGIN_PATH, {
        email: (values.email || '').trim(),
        password: values.password,
      });

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      if (data.store) localStorage.setItem('adminStore', JSON.stringify(data.store));
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="admin-login"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-login-container">
        <motion.div
          className="admin-login-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1 className="admin-login-title">RUVALI Admin</h1>
          <p className="admin-login-subtitle">Sign in to manage your store</p>

          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            className="admin-login-form"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" autoFocus autoComplete="email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                autoComplete="current-password"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block className="admin-login-btn">
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminLogin;
