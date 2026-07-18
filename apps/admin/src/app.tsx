import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/login.js';
import { DashboardPage } from './pages/dashboard.js';
import { ProductsPage } from './pages/products.js';
import { OrdersPage } from './pages/orders.js';
import { SettingsPage } from './pages/settings.js';
import { NotFoundPage } from './pages/not-found.js';
import { AdminLayout } from './components/layout/AdminLayout.js';

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
