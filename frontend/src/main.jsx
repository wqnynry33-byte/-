/**
 * ============================================================================
 * main.jsx — נקודת הכניסה של React (Entry Point)
 * ============================================================================
 * סדר ה-Providers חשוב! (Nested Providers)
 *   AuthProvider → CartProvider → App
 * Auth "בחוץ" כי Cart/App עשויים להזדקק ל-useAuth.
 *
 * StrictMode: מצב פיתוח שמזהה בעיות (מרנדר פעמיים ב-dev בכוונה)
 * createRoot: React 18 API (במקום ReactDOM.render הישן)
 *
 * Provider Tree = הילדים של Provider יכולים לקרוא ל-Context עם Hooks
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
