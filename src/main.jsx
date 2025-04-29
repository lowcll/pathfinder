// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import './index.css';
import { TripProvider } from './context/TripContext'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TripProvider> 
          <App />
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
