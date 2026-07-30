/**
 * ============================================================================
 * AdminRoute — Protected Route Component (צד לקוח)
 * ============================================================================
 * שאלת מבחן חשובה:
 * "האם מספיק להגן רק ב-Frontend?"
 * תשובה: לא! הגנה ב-UI רק מסתירה דפים.
 * החובה האמיתית היא ב-Backend (authenticate + requireAdmin).
 * כאן זה UX — מונע ממשתמש רגיל לראות את ממשק הניהול.
 *
 * זרימה:
 *  isLoading → מציגים "טוען" (מחכים ל-localStorage)
 *  !isAuthenticated → Navigate ל-Home
 *  !isAdmin → הודעת "אין הרשאה"
 *  אחרת → מציגים children (AdminPage)
 *
 * replace ב-Navigate → לא מוסיף ל-history (Back לא יחזיר לדף החסום)
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();

  if (isLoading) {
    return <p className="px-4 py-20 text-center text-stone-500">טוען...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-2xl text-[#1a1f1c]">אין הרשאת מנהל</h1>
        <p className="mt-3 text-stone-600">
          החשבון שלך אינו מוגדר כ־admin. פנה למנהל המערכת או הרץ את סקריפט make-admin.
        </p>
      </div>
    );
  }

  return children;
}
