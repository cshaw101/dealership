import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot
import App from './App';
import { CartProvider } from './context/CartContext';
import './styles.css';  

// Get the root element
const container = document.getElementById('root');
const root = createRoot(container); // Create a root

// Render the app
root.render(
  <CartProvider>
    <App />
  </CartProvider>
);