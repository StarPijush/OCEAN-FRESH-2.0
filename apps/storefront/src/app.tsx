import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/home.js';
import { ProductsPage } from './pages/products.js';
import { OrderPage } from './pages/order.js';
import { ContactPage } from './pages/contact.js';
import { NotFoundPage } from './pages/not-found.js';
import { DefaultLayout } from './components/layout/DefaultLayout.js';

export default function App() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
