import React from 'react';
import InfoPage from '../../components/InfoPage/InfoPage';

const FAQ = () => (
  <InfoPage title="FAQ">
    <h2>How do I place an order?</h2>
    <p>
      Browse our collections, select your items, add them to the cart, and proceed
      to checkout. Enter your shipping details and complete the payment.
    </p>

    <h2>What payment methods do you accept?</h2>
    <p>
      We accept Credit/Debit cards, UPI, and Cash on Delivery (COD) for eligible
      orders.
    </p>

    <h2>How can I track my order?</h2>
    <p>
      Use our Track Your Order page and enter your order ID and email. You will
      also receive tracking updates via email and SMS.
    </p>

    <h2>Can I modify or cancel my order?</h2>
    <p>
      Orders can be modified or cancelled within 2 hours of placement, provided
      they have not been shipped. Contact us at support@ruvali.com.
    </p>

    <h2>How do I find my size?</h2>
    <p>
      Refer to our Size Guide page for detailed measurements. If you are between
      sizes, we recommend sizing up.
    </p>
  </InfoPage>
);

export default FAQ;
