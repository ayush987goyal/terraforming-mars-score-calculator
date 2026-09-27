import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for offline PWA support
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New content available.');
  },
  onOfflineReady() {
    console.log('[PWA] App is ready for offline usage at the table.');
  }
});

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
