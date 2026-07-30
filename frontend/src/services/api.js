/**
 * ============================================================================
 * API Service Layer — כל התקשורת עם ה-Backend במקום אחד
 * ============================================================================
 * שאלות מבחן:
 * - למה שכבת service נפרדת? → DRY, קל לתחזק, Components לא מכירים URLs
 * - fetch vs axios? → כאן fetch מובנה בדפדפן (בלי ספרייה חיצונית)
 * - Authorization: Bearer <token> → שולחים JWT בכל בקשה מוגנת
 * - credentials: 'include' → שולחים גם Cookies (CORS credentials)
 * - API_BASE = '/api' → Vite proxy מעביר ל-backend:5000 (vite.config.js)
 *
 * זרימת בקשה:
 *  1. קוראים token מ-localStorage
 *  2. מוסיפים Headers (Content-Type + Authorization)
 *  3. fetch עם credentials
 *  4. אם !ok → זורקים Error עם הודעה מהשרת
 *  5. אם 401 → מנקים session (token פג)
 *
 * HTTP Methods בשימוש:
 *  GET / POST / PUT / PATCH / DELETE — לפי REST
 */
const API_BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // אם יש token — מוסיפים Bearer (Authentication Header)
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include', // חובה ל-Cookies + CORS
      ...options,
      headers,
    });
  } catch {
    // Network error — השרת לא רץ / אין אינטרנט
    throw new Error('לא ניתן להתחבר לשרת. ודאי שה-backend רץ על פורט 5000');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // 401 = לא מאומת → מנקים session מקומי (חוץ מlogin/register שנכשלו)
    if (response.status === 401 && !path.startsWith('/auth/login') && !path.startsWith('/auth/register')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastActivity');
    }

    const message =
      data.error ||
      data.message ||
      (response.status === 401
        ? 'ההתחברות פגה — התחברי מחדש'
        : response.status >= 500
          ? 'שגיאת שרת. ודאי שה-backend רץ ונסה שוב'
          : `Something went wrong (${response.status})`);
    throw new Error(message);
  }

  return data;
}

// --- Auth API ---
export const authApi = {
  register: (body) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body), // אובייקט → מחרוזת JSON
    }),
  login: (body) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),
};

// --- Products API (ציבורי) ---
export const productsApi = {
  getAll: ({ category, material, color, sort, q } = {}) => {
    // URLSearchParams בונה query string בצורה בטוחה
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (material) params.set('material', material);
    if (color) params.set('color', color);
    if (sort) params.set('sort', sort);
    if (q) params.set('q', q);
    const query = params.toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/products/${id}`),
};

// --- Admin API (דורש role: admin) ---
export const adminApi = {
  getProducts: () => request('/admin/products'),
  createProduct: (body) =>
    request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateProduct: (id, body) =>
    request(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteProduct: (id) =>
    request(`/admin/products/${id}`, {
      method: 'DELETE',
    }),
  getUsers: () => request('/admin/users'),
  updateUserRole: (id, role) =>
    request(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  deleteUser: (id) =>
    request(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
  getOrders: () => request('/admin/orders'),
  updateOrderStatus: (id, status) =>
    request(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// --- Orders API (דורש Authentication) ---
export const ordersApi = {
  create: (items, options = {}) => {
    const { fakePayment = false, fulfillmentMethod = 'delivery', shippingAddress = '' } =
      typeof options === 'boolean' ? { fakePayment: options } : options;

    return request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items,
        fakePayment,
        fulfillmentMethod,
        shippingAddress,
      }),
    });
  },
};

// עיצוב מחיר בשקלים (Intl API מובנה)
export function formatPrice(price) {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(price);
}
