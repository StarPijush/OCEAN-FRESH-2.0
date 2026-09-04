import { Route, Routes } from 'react-router-dom';

import { DefaultLayout } from './components/layout/DefaultLayout.js';
import { CookieConsentProvider } from './context/CookieConsentContext.js';
import { SettingsProvider } from './context/settings-context.js';
import { ContactPage } from './pages/contact.js';
import { HomePage } from './pages/home.js';
import { NotFoundPage } from './pages/not-found.js';
import { OrderPage } from './pages/order.js';
import { CookiePolicyPage } from './pages/privacy/CookiePolicy.js';
import { PrivacyPolicyPage } from './pages/privacy/PrivacyPolicy.js';
import { TermsPage } from './pages/privacy/TermsPage.js';
import { ProductsPage } from './pages/products.js';

export default function App() {
  return (
    <CookieConsentProvider>
      <SettingsProvider>
        <Routes>
          <Route element={<DefaultLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </SettingsProvider>
    </CookieConsentProvider>
  );
}
