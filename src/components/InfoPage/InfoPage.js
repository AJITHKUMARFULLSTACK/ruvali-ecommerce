import React from 'react';
import { TOP_NAV_HEIGHT } from '../TopNav/TopNav';
import './InfoPage.css';

const InfoPage = ({ title, children }) => (
  <div className="info-page" style={{ paddingTop: TOP_NAV_HEIGHT }}>
    <div className="info-container">
      <h1 className="info-title">{title}</h1>
      <div className="info-content">{children}</div>
    </div>
  </div>
);

export default InfoPage;
