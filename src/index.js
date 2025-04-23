
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/global.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { HotelDataProvider } from './contexts/HotelDataContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <HotelDataProvider>
        <App />
        </HotelDataProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);