import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Form, Input, Button, Row, Col } from 'antd';
import { useCart } from '../../context/CartContext';
import { resolveImageUrl } from '../../lib/imageUtils';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, product, quantity, selectedColor }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { saveOrderDetails, clearCart } = useCart();

  const handleSubmit = (values) => {
    const orderData = {
      orderId: `RUVALI-${Date.now()}`,
      product: product,
      quantity: quantity,
      selectedColor: selectedColor,
      shippingAddress: { ...values, country: values.country || 'India' },
      totalAmount: (typeof product.price === 'number'
        ? product.price
        : Number(product.price || 0)) * quantity,
      orderDate: new Date().toISOString(),
    };
    saveOrderDetails(orderData);
    clearCart();
    form.resetFields();
    onClose();
    navigate('/payment', { state: { orderData } });
  };

  const priceNumber =
    typeof product?.price === 'number' ? product.price : Number(product?.price || 0);

  const rawImage =
    product?.image ||
    (Array.isArray(product?.images) && product.images.length > 0 ? product.images[0] : null);
  const imageUrl = rawImage ? resolveImageUrl(rawImage) : null;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable
      width={520}
      className="checkout-modal-antd"
      destroyOnClose
    >
      <div className="checkout-modal-content">
        <h2 className="checkout-title">Shipping Details</h2>
        <div className="checkout-product-summary">
          {imageUrl && (
            <img src={imageUrl} alt={product?.name} className="checkout-product-image" />
          )}
          <div>
            <h3>{product?.name}</h3>
            <p>Quantity: {quantity}</p>
            <p>Total: ₹{(priceNumber * quantity).toLocaleString('en-IN')}</p>
          </div>
        </div>

        <Form form={form} onFinish={handleSubmit} layout="vertical">
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
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block className="checkout-submit-btn">
              Proceed to Payment
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CheckoutModal;
