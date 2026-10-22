import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ConsultationProvider } from './context/ConsultationContext';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <BrowserRouter>
    <AuthProvider>
      <ConsultationProvider>
        <App />
      </ConsultationProvider>
    </AuthProvider>
  </BrowserRouter>
);
