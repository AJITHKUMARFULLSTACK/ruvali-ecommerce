import React from 'react';
import TopNav from '../TopNav/TopNav';
import Footer from '../Footer/Footer';
import './MainLayout.css';

/**
 * Public store layout:
 * - TopNav: fixed at top (24px), floating, separate layer
 * - Children: hero (Home/Category) or content (About/Donate/Contact)
 */
function MainLayout({ children }) {
  return (
    <>
      <TopNav />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </>
  );
}

export default MainLayout;
