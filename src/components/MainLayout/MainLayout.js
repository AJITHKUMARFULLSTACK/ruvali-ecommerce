import React from 'react';
import Header, { HEADER_HEIGHT_PX } from '../Header/Header';
import Footer from '../Footer/Footer';
import './MainLayout.css';

/**
 * Public store layout: fixed header + content + footer.
 * Uses padding-top to prevent content from jumping under the fixed header.
 */
function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main
        className="main-content"
        style={{ paddingTop: HEADER_HEIGHT_PX }}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}

export default MainLayout;
