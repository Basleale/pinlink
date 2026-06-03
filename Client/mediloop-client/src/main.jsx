import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
    <BrowserRouter> {/** url access for all */}
      <AuthProvider> {/** auth status access for all*/}
        <App />
      </AuthProvider>
    </BrowserRouter>
);

