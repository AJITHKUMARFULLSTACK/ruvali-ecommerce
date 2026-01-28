import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Home from './pages/Home/Home';
import MensCollection from './pages/MensCollection/MensCollection';
import WomensCollection from './pages/WomensCollection/WomensCollection';
import LGBTQCollection from './pages/LGBTQCollection/LGBTQCollection';
import KidsCollection from './pages/KidsCollection/KidsCollection';
import Donate from './pages/Donate/Donate';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/men" element={<MensCollection />} />
          <Route path="/women" element={<WomensCollection />} />
          <Route path="/lgbtq" element={<LGBTQCollection />} />
          <Route path="/kids" element={<KidsCollection />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

