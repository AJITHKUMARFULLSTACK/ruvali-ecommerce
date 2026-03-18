import React from 'react';
import { motion } from 'framer-motion';
import { Form, Input, Button } from 'antd';
import { TOP_NAV_HEIGHT } from '../../components/TopNav/TopNav';
import landingBg from '../../Assets/Images/landingpageBg.png';
import { toast } from '../../lib/toast';
import './Contact.css';

const Contact = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    toast.success('Thank you! We\'ll get back to you soon.');
    form.resetFields();
  };

  return (
    <motion.div
      className="contact-page"
      style={{ paddingTop: TOP_NAV_HEIGHT }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="contact-wrapper">
        <motion.div
          className="contact-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="contact-left-bg"
            style={{ backgroundImage: `url(${landingBg})` }}
          >
            <div className="contact-left-overlay" />

            <div className="contact-left-content">
              <h2 className="contact-left-title">We’d love to hear from you.</h2>
              <p className="contact-left-text">
                Please fill out the form below and we’ll get in touch soon.
              </p>

              <div className="contact-left-info">
                <div className="contact-info-row">
                  <div className="contact-icon-circle">📞</div>
                  <span className="contact-info-text">+91 9999999999</span>
                </div>
                <div className="contact-info-row">
                  <div className="contact-icon-circle">✉️</div>
                  <span className="contact-info-text">ruvalisupport@ruvali.com</span>
                </div>
                <div className="contact-info-row">
                  <div className="contact-icon-circle">📍</div>
                  <span className="contact-info-text">Chennai</span>
                </div>
                <div className="contact-info-row">
                  <div className="contact-icon-circle">in</div>
                  <span className="contact-info-text">RuvaliFashion</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="contact-right"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Form form={form} onFinish={handleSubmit} layout="vertical" className="contact-form">
            <Form.Item name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
              <Input placeholder="Name" size="large" />
            </Form.Item>
            <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
              <Input placeholder="Enter your Email" size="large" />
            </Form.Item>
            <Form.Item name="phone">
              <Input placeholder="Enter your Phone Number (optional)" size="large" />
            </Form.Item>
            <Form.Item name="message" rules={[{ required: true, message: 'Please enter your message' }]}>
              <Input.TextArea rows={4} placeholder="Enter your Message..." />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" className="submit-button">
                Discover More
              </Button>
            </Form.Item>
          </Form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Contact;

