import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Form, Input, Button, Row, Col } from 'antd';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';
import { resolveImageUrl, getProductPrimaryImageSource } from '../../lib/imageUtils';
import { TOP_NAV_HEIGHT } from '../../components/TopNav/TopNav';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { cartItems, getCartTotal, saveOrderDetails, clearCart } = useCart();
  const { customer } = useCustomer();

  useEffect(() => {
    if (cartItems.length === 0) navigate('/cart');
  }, [cartItems.length, navigate]);

  useEffect(() => {
    if (!customer) return;
    const current = form.getFieldsValue();
    const updates = {};
    if (!current?.fullName && customer.name) updates.fullName = customer.name;
    if (!current?.email && customer.email) updates.email = customer.email;
    if (!current?.phone && customer.phone) updates.phone = customer.phone;
    if (Object.keys(updates).length > 0) {
      form.setFieldsValue(updates);
    }
  }, [customer, form]);

  const handleSubmit = (values) => {
    const orderData = {
      orderId: `RUVALI-${Date.now()}`,
      items: cartItems.map((item) => ({
        product: item,
        productId: item.id,
        quantity: item.quantity,
      })),
      shippingAddress: { ...values, country: values.country || 'India' },
      totalAmount: getCartTotal(),
      orderDate: new Date().toISOString(),
    };
    saveOrderDetails(orderData);
    clearCart();
    navigate('/payment', { state: { orderData } });
  };

  const rawImage = (item) => {
    const flat = getProductPrimaryImageSource(item);
    if (flat) return flat;
    return item.image || null;
  };
  const priceNum = (item) =>
    typeof item.price === 'number' ? item.price : Number(item.price || 0);

  if (cartItems.length === 0) return null;

  return (
    <motion.div
      className="checkout-page"
      style={{ paddingTop: TOP_NAV_HEIGHT }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>

        <Form form={form} onFinish={handleSubmit} layout="vertical" className="checkout-form">
          <div className="checkout-sections">
            <div className="checkout-shipping">
              <h2>Shipping Details</h2>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="fullName" rules={[{ required: true }]} label="Full Name">
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="email" rules={[{ required: true, type: 'email' }]} label="Email">
                    <Input size="large" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="phone" rules={[{ required: true }]} label="Phone">
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="city" rules={[{ required: true }]} label="City">
                    <Input size="large" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="address" rules={[{ required: true }]} label="Address">
                <Input.TextArea rows={3} size="large" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="state" rules={[{ required: true }]} label="State">
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="pincode" rules={[{ required: true }]} label="Pincode">
                    <Input size="large" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="country" initialValue="India" label="Country">
                <Input size="large" />
              </Form.Item>
            </div>

            <div className="checkout-summary">
              <h2>Order Summary</h2>
              <div className="checkout-items">
                {cartItems.map((item) => {
                  const imgUrl = rawImage(item)
                    ? resolveImageUrl(rawImage(item))
                    : `https://api.lorem.space/image/fashion?w=80&h=80&hash=${item.id}`;
                  return (
                    <div key={item.id} className="checkout-item">
                      <img src={imgUrl} alt={item.name} />
                      <div>
                        <p className="checkout-item-name">{item.name}</p>
                        <p className="checkout-item-qty">
                          {item.quantity} × ₹{priceNum(item).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <span className="checkout-item-total">
                        ₹{(priceNum(item) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="checkout-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>₹100</span>
                </div>
                <div className="total-row total-final">
                  <span>Total</span>
                  <span>₹{(getCartTotal() + 100).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block className="checkout-submit-btn">
                  Proceed to Payment
                </Button>
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </motion.div>
  );
};

export default Checkout;
