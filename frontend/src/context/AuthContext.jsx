/**
 * ============================================================================
 * AuthContext — ניהול מצב התחברות גלובלי (React Context API)
 * ============================================================================
 * שאלות מבחן על React Context:
 * - למה Context ולא props? → מונע Prop Drilling (העברת props בכל הרמות)
 * - createContext + Provider + useContext = הדפוס הבסיסי
 * - Custom Hook (useAuth) → עוטף useContext + זורק שגיאה אם אין Provider
 *
 * localStorage vs Cookie:
 * - localStorage: נגיש ל-JS, נשמר גם אחרי רענון, פגיע ל-XSS
 * - Cookie HttpOnly: לא נגיש ל-JS, נשלח אוטומטית, מוגן מ-XSS
 * בפרויקט: שניהם — token ב-localStorage (Bearer) + Cookie מהשרת
 *
 * useRef: שומר ערך בלי לגרום ל-re-render (timer, userRef לעקיפת stale closure)
 * useEffect: side effects — טעינה ראשונית, event listeners, timers
 * Cleanup function (return ב-useEffect) → מסיר listeners/timers ב-unmount
 *
 * Inactivity logout: אחרי 15 דקות בלי פעילות → logout אוטומטי
 */
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

const USER_KEY = 'user';
const TOKEN_KEY = 'token';
const LAST_ACTIVITY_KEY = 'lastActivity';
const INACTIVITY_MS = 15 * 60 * 1000; // 15 דקות במילישניות

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // מונע הבהוב לפני טעינת session
  const logoutTimerRef = useRef(null);
  const userRef = useRef(null); // תמיד מצביע על ה-user העדכני (לשימוש ב-timer)

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    setUser(null);
  }

  async function logout({ silent = false } = {}) {
    try {
      await authApi.logout(); // מוחק גם את ה-Cookie בשרת
    } catch {
      // גם אם ה-API נכשל — מנקים מקומית
    } finally {
      clearSession();
      if (!silent) {
        // no-op; callers can react via isAuthenticated
      }
    }
  }

  function persistSession({ user: nextUser, token }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser)); // אובייקט → מחרוזת
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    setUser(nextUser);
  }

  // טעינה ראשונית: שחזור session מ-localStorage (אחרי רענון הדף)
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0);

      if (savedUser && savedToken) {
        // אם עברו יותר מ-15 דקות מאז הפעילות האחרונה → מוחקים session
        if (lastActivity && Date.now() - lastActivity > INACTIVITY_MS) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(LAST_ACTIVITY_KEY);
        } else {
          setUser(JSON.parse(savedUser)); // מחרוזת → אובייקט
          localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
        }
      }
    } catch {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []); // [] = רץ פעם אחת בלבד (mount)

  // מעקב פעילות + auto-logout
  useEffect(() => {
    if (!user) {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
      return undefined;
    }

    function scheduleLogout() {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }

      logoutTimerRef.current = setTimeout(() => {
        if (userRef.current) {
          logout({ silent: true });
        }
      }, INACTIVITY_MS);
    }

    function onActivity() {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
      scheduleLogout(); // מאפס את הטיימר בכל פעילות
    }

    scheduleLogout();
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, onActivity, { passive: true });
    });

    // Cleanup — חובה! מונע memory leaks
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, onActivity);
      });
    };
  }, [user]);

  async function register(form) {
    const data = await authApi.register(form);
    persistSession(data);
    return data;
  }

  async function login(form) {
    const data = await authApi.login(form);
    persistSession(data);
    return data;
  }

  // Provider value — כל מה שהילדים יכולים לקרוא דרך useAuth()
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin', // Authorization בצד לקוח (UI בלבד!)
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook — הדרך הנכונה לצרוך את ה-Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
