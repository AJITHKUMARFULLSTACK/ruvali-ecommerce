import React from 'react';
import InfoPage from '../../components/InfoPage/InfoPage';

const Returns = () => (
  <InfoPage title="Returns & Exchanges">
    <h2>Return Policy</h2>
    <p>
      We accept returns within 14 days of delivery. Items must be unworn, unwashed,
      and in original packaging with tags attached.
    </p>

    <h2>How to Return</h2>
    <ul>
      <li>Contact us at support@ruvali.com with your order ID</li>
      <li>We will provide a return label or pickup instructions</li>
      <li>Pack the item securely and ship it back</li>
      <li>Refund will be processed within 5–7 business days after we receive the item</li>
    </ul>

    <h2>Exchanges</h2>
    <p>
      Exchanges for a different size or color are subject to availability.
      Please reach out to our customer care team to initiate an exchange.
    </p>

    <h2>Non-Returnable Items</h2>
    <p>
      Sale items, intimate wear, and customized products are non-returnable unless
      defective.
    </p>
  </InfoPage>
);

export default Returns;
