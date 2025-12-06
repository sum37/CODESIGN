// Process polyfill for browser environment
if (typeof window !== 'undefined') {
  if (!(window as any).process) {
    (window as any).process = {
      env: {},
      platform: 'browser',
      version: 'v16.0.0',
    };
  }
  if (typeof globalThis !== 'undefined' && !(globalThis as any).process) {
    (globalThis as any).process = (window as any).process;
  }
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

