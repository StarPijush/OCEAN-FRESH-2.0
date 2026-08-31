import './styles/reference.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app';
import { bootstrapApp } from './bootstrap';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/new/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

try {
  bootstrapApp();
} catch (error) {
  console.error('[ADMIN] Bootstrap failed:', error);
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: #071526;
        color: #e6edf5;
        font-family: system-ui, sans-serif;
        padding: 2rem;
        text-align: center;
      ">
        <h1 style="margin-bottom: 1rem; color: #e07a65;">Admin Panel Failed to Initialize</h1>
        <pre style="
          background: #0d2035;
          padding: 1rem;
          border-radius: 8px;
          overflow: auto;
          max-width: 600px;
          text-align: left;
          white-space: pre-wrap;
          word-break: break-word;
          border: 1px solid rgba(74,184,193,0.12);
        ">${error instanceof Error ? error.message : String(error)}</pre>
        <p style="margin-top: 1rem; color: #8291a5; font-size: 0.875rem;">
          Check browser console for details. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured.
        </p>
      </div>
    `;
  }
  throw error;
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
