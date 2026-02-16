import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { StoreProvider } from './context/StoreContext';
import MainLayout from './components/MainLayout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Home from './pages/Home/Home';
import MensCollection from './pages/MensCollection/MensCollection';
import WomensCollection from './pages/WomensCollection/WomensCollection';
import LGBTQCollection from './pages/LGBTQCollection/LGBTQCollection';
import KidsCollection from './pages/KidsCollection/KidsCollection';
import Donate from './pages/Donate/Donate';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Payment from './pages/Payment/Payment';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation';
import AdminLogin from './pages/Admin/AdminLogin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard/AdminDashboard';
import AdminProducts from './pages/Admin/AdminProducts/AdminProducts';
import AdminProductForm from './pages/Admin/AdminProductForm/AdminProductForm';
import AdminOrders from './pages/Admin/AdminOrders/AdminOrders';
import AdminSettings from './pages/Admin/AdminSettings/AdminSettings';
import AdminCategories from './pages/Admin/AdminCategories/AdminCategories';
import AdminLayout from './components/AdminLayout/AdminLayout';
import CategoryPage from './pages/CategoryPage/CategoryPage';
import './App.css';
import DebugPanel from './components/DebugPanel/DebugPanel';

function App() {
  return (
    <Router>
      <StoreProvider>
        <CartProvider>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/c" element={<MainLayout><CategoryPage /></MainLayout>} />
          <Route path="/c/:categoryId" element={<MainLayout><CategoryPage /></MainLayout>} />
          <Route path="/men" element={<MainLayout><MensCollection /></MainLayout>} />
          <Route path="/women" element={<MainLayout><WomensCollection /></MainLayout>} />
          <Route path="/lgbtq" element={<MainLayout><LGBTQCollection /></MainLayout>} />
          <Route path="/kids" element={<MainLayout><KidsCollection /></MainLayout>} />
          <Route path="/donate" element={<MainLayout><Donate /></MainLayout>} />
          <Route path="/about" element={<MainLayout><About /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
          <Route path="/payment" element={<MainLayout><Payment /></MainLayout>} />
          <Route path="/order-confirmation" element={<MainLayout><OrderConfirmation /></MainLayout>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminLayout><AdminDashboard /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <AdminLayout><AdminSettings /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute>
              <AdminLayout><AdminCategories /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute>
              <AdminLayout><AdminProducts /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/products/new" element={
            <ProtectedRoute>
              <AdminLayout><AdminProductForm /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/products/:id/edit" element={
            <ProtectedRoute>
              <AdminLayout><AdminProductForm /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute>
              <AdminLayout><AdminOrders /></AdminLayout>
            </ProtectedRoute>
          } />
          </Routes>
          <DebugPanel />
        </CartProvider>
      </StoreProvider>
    </Router>
  );
}

export default App;

