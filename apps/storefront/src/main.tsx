import './index.css';

import { registerCartRepository } from '@oceanfresh/cart/repository';
import { registerCategoryRepository } from '@oceanfresh/category/repository';
import { registerOrderRepository } from '@oceanfresh/order/repository';
import { registerProductRepository } from '@oceanfresh/product/repository';
import { registerSettingsRepository } from '@oceanfresh/settings/repository';
import { logger } from '@oceanfresh/shared';
import { initSupabase } from '@oceanfresh/supabase';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

async function bootstrap() {
  try {
    registerProductRepository();
    registerCartRepository();
    registerOrderRepository();
    registerSettingsRepository();
    registerCategoryRepository();
    initSupabase();
    logger.info('DI and Supabase initialized');
  } catch (err) {
    logger.critical('Failed to initialize', err);
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML =
        '<div style="padding:2rem;font-family:monospace;color:#c00">' +
        '<h2>Initialization failed</h2>' +
        '<pre>' +
        String(err) +
        '</pre>' +
        '<p>Check your configuration.</p>' +
        '</div>';
    }
    return;
  }

  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

bootstrap();
