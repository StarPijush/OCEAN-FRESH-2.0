import './index.css';

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
    initSupabase();
    logger.info('Supabase initialized');
  } catch (err) {
    logger.critical('Failed to initialize Supabase', err);
    // Do NOT continue — surface the error and stop startup.
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML =
        '<div style="padding:2rem;font-family:monospace;color:#c00">' +
        '<h2>Supabase initialization failed</h2>' +
        '<pre>' +
        String(err) +
        '</pre>' +
        '<p>Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.</p>' +
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
