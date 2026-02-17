import React from 'react';
import InfoPage from '../../components/InfoPage/InfoPage';

const Shipping = () => (
  <InfoPage title="Shipping Information">
    <h2>Delivery Time</h2>
    <p>
      We aim to dispatch all orders within 2–3 business days. Standard delivery
      typically takes 5–7 business days from dispatch.
    </p>

    <h2>Shipping Charges</h2>
    <p>
      A flat shipping fee of ₹100 applies to all orders. Free shipping on
      orders above ₹2,500.
    </p>

    <h2>Tracking</h2>
    <p>
      Once your order is shipped, you will receive a tracking link via email and
      SMS. You can also track your order on our Track Your Order page.
    </p>

    <h2>International Shipping</h2>
    <p>
      We currently ship within India. International shipping may be available in
      the future.
    </p>
  </InfoPage>
);

export default Shipping;
