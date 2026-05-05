import './i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Provider } from 'react-redux';
import { appStore } from './app/store.js';
import { ThemeProvider } from './components/ThemeProvider.jsx';
import { Toaster } from './components/ui/sonner.jsx';
import AppBootstrap from './components/AppBootstrap.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={appStore}>
      <ThemeProvider>
        <AppBootstrap>
          <App />
          <Toaster />
        </AppBootstrap>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);
