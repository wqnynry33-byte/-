/**
 * ============================================================================
 * App.jsx — React Router + Layout
 * ============================================================================
 * שאלות מבחן על Routing:
 * - BrowserRouter → מאפשר URLs רגילים (/shop/plates) בלי #
 * - Routes/Route → מגדירים איזה Component לכל path
 * - :category / :id → Dynamic params (useParams() בדף)
 * - Navigate → הפניה (redirect)
 * - path="*" → Catch-all לכל URL לא קיים → חזרה ל-Home
 * - Protected Route: AdminRoute עוטף את AdminPage
 *   (בדיקת auth+role בצד לקוח; השרת עדיין מגן על ה-API!)
 *
 * Layout Pattern: Header + main (Routes) + Footer מחוץ ל-Routes
 * → מופיעים בכל הדפים בלי לשכפל קוד
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import AdminPage from './pages/AdminPage';
import CartPage from './pages/CartPage';
import SearchPage from './pages/SearchPage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-[#f3f1ec]">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop/:category" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/contact" element={<ContactPage />} />
            {/* Protected Route — רק admin */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            {/* 404 → Redirect לדף הבית */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
