/**
 * ============================================================================
 * CartContext — עגלת קניות בצד הלקוח (Client-side state)
 * ============================================================================
 * חשוב למבחן:
 * - העגלה נשמרת ב-localStorage בלבד — לא בשרת!
 * - רק ב-Checkout נשלחת הזמנה ל-POST /api/orders
 * - זה Stateless cart: רענון הדף לא מוחק כי יש persistence
 *
 * דפוס Persistence עם useEffect כפול:
 *  1. Mount: טוען מ-localStorage → setItems (isReady=true ב-finally)
 *  2. בכל שינוי items (אחרי isReady): שומר חזרה ל-localStorage
 *  למה isReady? → מונע שמירת [] ריק לפני שהטעינה הסתיימה (bug קלאסי!)
 *
 * setItems(prev => ...) — Functional update: משתמש ב-state הקודם המעודכן
 * (חשוב כשיש כמה עדכונים רצופים)
 *
 * Derived state: itemCount / totalPrice מחושבים מה-items (לא state נפרד)
 */
import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const CART_KEY = 'cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isReady, setIsReady] = useState(false);

  // טעינה מ-localStorage פעם אחת
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      localStorage.removeItem(CART_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  // שמירה אוטומטית בכל שינוי — רק אחרי שהטעינה הסתיימה
  useEffect(() => {
    if (!isReady) return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, isReady]);

  // Derived values — מחושבים מחדש בכל render
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  function addItem(product, quantity = 1) {
    const id = product.id || product._id; // תומך גם ב-_id של MongoDB

    setItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        // מוצר כבר בסל → מגדילים כמות
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }

      // מוצר חדש → מוסיפים
      return [
        ...prev,
        {
          id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity,
        },
      ];
    });
  }

  function updateQuantity(id, quantity) {
    const nextQty = Number(quantity);
    if (!Number.isFinite(nextQty) || nextQty < 1) {
      removeItem(id);
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: nextQty } : item))
    );
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCart() {
    setItems([]);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalPrice,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
