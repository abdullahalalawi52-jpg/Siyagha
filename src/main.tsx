import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';
import ErrorBoundary from './components/ErrorBoundary';

// Global fetch override to handle 429 Rate Limit Automatically
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let retries = 2;
  while (true) {
    const response = await originalFetch(...args);
    if (response.status === 429 && retries > 0) {
      console.warn("Rate limit hit (429). Waiting 9 seconds before retrying...");
      retries--;
      await new Promise(resolve => setTimeout(resolve, 9000));
      continue;
    }
    return response;
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Register Service Worker for offline capabilities and caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (reg) => {
        reg.update();
        console.log('ServiceWorker registered & updated:', reg.scope);
      },
      (err) => console.warn('ServiceWorker registration failed:', err)
    );
  });
}

