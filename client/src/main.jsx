import './i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Provider } from 'react-redux';
import { appStore } from './app/store.js';
import { ThemeProvider } from './components/ThemeProvider.jsx';
import { Toaster } from './components/ui/sonner.jsx';
import { useLoadUserQuery } from "./features/api/authApi";
import LoadingSpinner from "./components/LoadingSpinner";

const Custom = ({ children }) => {
  const { isLoading } = useLoadUserQuery();
  return <>{isLoading ? <LoadingSpinner/> : <>{children}</>}</>;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={appStore}>
      <ThemeProvider>
        <Custom>
          <App />
          <Toaster />
        </Custom>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);
