import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, Form, Input, Button, Alert } from 'antd';
import { useStore } from '../../context/StoreContext';
import { useCustomer } from '../../context/CustomerContext';
import './CustomerLogin.css';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const { backendUrl, storeSlug } = useStore();
  const { login } = useCustomer();
  const [loginError, setLoginError] = useState(null);
  const [registerError, setRegisterError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLogin = async (values) => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await fetch(
        `${backendUrl}/api/customer/login?storeSlug=${encodeURIComponent(storeSlug)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
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
      <div className="customer-login-container">
        <h1>Account</h1>
        <Tabs
          defaultActiveKey="login"
          items={[
            {
              key: 'login',
              label: 'Login',
              children: (
                <Form form={loginForm} onFinish={handleLogin} layout="vertical">
                  {loginError && (
                    <Alert type="error" message={loginError} showIcon style={{ marginBottom: 16 }} />
                  )}
                  <Form.Item name="email" rules={[{ required: true, type: 'email' }]} label="Email">
                    <Input size="large" placeholder="your@email.com" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true }]} label="Password">
                    <Input.Password size="large" placeholder="Password" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" size="large" block loading={loginLoading}>
                      Login
                    </Button>
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'register',
              label: 'Register',
              children: (
                <Form form={registerForm} onFinish={handleRegister} layout="vertical">
                  {registerError && (
                    <Alert type="error" message={registerError} showIcon style={{ marginBottom: 16 }} />
                  )}
                  <Form.Item name="name" rules={[{ required: true }]} label="Full Name">
                    <Input size="large" placeholder="Your name" />
                  </Form.Item>
                  <Form.Item name="email" rules={[{ required: true, type: 'email' }]} label="Email">
                    <Input size="large" placeholder="your@email.com" />
                  </Form.Item>
                  <Form.Item name="phone" rules={[{ required: true }]} label="Phone">
                    <Input size="large" placeholder="10-digit phone number" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[{ required: true }, { min: 8, message: 'At least 8 characters' }]}
                    label="Password"
                  >
                    <Input.Password size="large" placeholder="Min 8 characters" />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    rules={[{ required: true }, ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) return Promise.resolve();
                        return Promise.reject(new Error('Passwords do not match'));
                      }
                    })]}
                    label="Confirm Password"
                  >
                    <Input.Password size="large" placeholder="Confirm password" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" size="large" block loading={registerLoading}>
                      Register
                    </Button>
                  </Form.Item>
                </Form>
              )
            }
          ]}
        />
      </div>
    </div>
  );
};

export default CustomerLogin;
