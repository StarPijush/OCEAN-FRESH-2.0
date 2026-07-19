import { Route, Routes } from 'react-router-dom';

import { DefaultLayout } from './components/layout/DefaultLayout.js';
import { ContactPage } from './pages/contact.js';
import { HomePage } from './pages/home.js';
import { NotFoundPage } from './pages/not-found.js';
import { OrderPage } from './pages/order.js';
import { ProductsPage } from './pages/products.js';

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
