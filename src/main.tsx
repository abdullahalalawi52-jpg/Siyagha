import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
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
