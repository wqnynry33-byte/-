import { useEffect, useState } from 'react';
import { CATEGORIES } from '../constants/categories';
import { useAuth } from '../context/AuthContext';
import { adminApi, formatPrice } from '../services/api';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'plates',
  image_url: '',
  stock_quantity: '0',
  material: '',
  color: '',
  dimensions: '',
};

const TABS = [
  { id: 'products', label: 'מוצרים' },
  { id: 'users', label: 'משתמשים' },
  { id: 'orders', label: 'הזמנות' },
];

const ORDER_STATUSES = [
  { value: 'pending', label: 'ממתינה' },
  { value: 'paid', label: 'שולמה' },
  { value: 'shipped', label: 'נשלחה' },
  { value: 'cancelled', label: 'בוטלה' },
];

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('he-IL');
}

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState('products');

  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadTabData(nextTab = tab) {
    setIsLoading(true);
    setError('');
    try {
      if (nextTab === 'products') {
        const data = await adminApi.getProducts();
        setProducts(data.products || []);
      } else if (nextTab === 'users') {
        const data = await adminApi.getUsers();
        setUsers(data.users || []);
      } else if (nextTab === 'orders') {
        const data = await adminApi.getOrders();
        setOrders(data.orders || []);
      }
    } catch (err) {
      setError(err.message || 'שגיאה בטעינת נתונים');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTabData(tab);
  }, [tab]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit(product) {
    setEditingId(product._id);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      category: product.category || 'plates',
      image_url: product.image_url || '',
      stock_quantity: String(product.stock_quantity ?? 0),
      material: product.material || '',
      color: product.color || '',
      dimensions: product.dimensions || '',
    });
    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setMessage('');

    const payload = {
      ...form,
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
    };

    try {
      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
        setMessage('המוצר עודכן בהצלחה');
      } else {
        await adminApi.createProduct(payload);
        setMessage('המוצר נוסף בהצלחה');
      }
      resetForm();
      await loadTabData('products');
    } catch (err) {
      setError(err.message || 'שמירה נכשלה');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('למחוק את המוצר?')) return;

    setError('');
    setMessage('');
    try {
      await adminApi.deleteProduct(id);
      if (editingId === id) resetForm();
      setMessage('המוצר נמחק');
      await loadTabData('products');
    } catch (err) {
      setError(err.message || 'מחיקה נכשלה');
    }
  }

  async function handleOrderStatus(orderId, status) {
    setError('');
    setMessage('');
    try {
      await adminApi.updateOrderStatus(orderId, status);
      setMessage('סטטוס ההזמנה עודכן');
      await loadTabData('orders');
    } catch (err) {
      setError(err.message || 'עדכון סטטוס נכשל');
    }
  }

  async function handleDeleteUser(id, name) {
    if (!window.confirm(`למחוק את המשתמש "${name}"?`)) return;

    setError('');
    setMessage('');
    try {
      await adminApi.deleteUser(id);
      setMessage('המשתמש נמחק');
      await loadTabData('users');
    } catch (err) {
      setError(err.message || 'מחיקת משתמש נכשלה');
    }
  }

  async function handleUpdateUserRole(id, name, role) {
    const actionLabel = role === 'admin' ? 'להפוך למנהל' : 'להסיר הרשאת מנהל מ';
    if (!window.confirm(`${actionLabel} את "${name}"?`)) return;

    setError('');
    setMessage('');
    try {
      await adminApi.updateUserRole(id, role);
      setMessage(role === 'admin' ? 'המשתמש עודכן למנהל' : 'הרשאת המנהל הוסרה');
      await loadTabData('users');
    } catch (err) {
      setError(err.message || 'עדכון תפקיד נכשל');
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-[0.18em] text-[#4f6f6f]">ADMIN</p>
        <h1 className="mt-2 font-display text-3xl text-[#1a1f1c] sm:text-4xl">לוח ניהול</h1>
        <p className="mt-3 text-stone-600">ניהול מוצרים, משתמשים והזמנות.</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setError('');
              setMessage('');
              setTab(item.id);
            }}
            className={`rounded-full px-4 py-2 text-sm transition ${
              tab === item.id
                ? 'bg-[#2f4f4f] text-[#f3f1ec]'
                : 'border border-stone-300 text-stone-600 hover:border-[#2f4f4f] hover:text-[#2f4f4f]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-6 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>
      )}

      {tab === 'products' && (
        <>
          <form
            onSubmit={handleSubmit}
            className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-stone-200 bg-white/70 p-5 sm:grid-cols-2 sm:p-6"
          >
            <h2 className="font-display text-xl text-[#1a1f1c] sm:col-span-2">
              {editingId ? 'עריכת מוצר' : 'מוצר חדש'}
            </h2>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm text-stone-600">שם</span>
              <input
                required
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/15"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm text-stone-600">תיאור</span>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/15"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm text-stone-600">מחיר (₪)</span>
              <input
                required
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/15"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm text-stone-600">מלאי</span>
              <input
                required
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={(e) => updateField('stock_quantity', e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/15"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm text-stone-600">קטגוריה</span>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/15"
              >
                {CATEGORIES.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm text-stone-600">חומר</span>
              <input
                value={form.material}
                onChange={(e) => updateField('material', e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/15"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm text-stone-600">צבע</span>
              <input
                value={form.color}
                onChange={(e) => updateField('color', e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/15"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm text-stone-600">מידות</span>
              <input
                value={form.dimensions}
                onChange={(e) => updateField('dimensions', e.target.value)}
                placeholder='לדוגמה: קוטר 27 ס״מ'
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/15"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm text-stone-600">קישור לתמונה</span>
              <input
                required
                type="text"
                value={form.image_url}
                onChange={(e) => updateField('image_url', e.target.value)}
                placeholder="/images/products/cutlery/fork-black-gold-ornate.png"
                dir="ltr"
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/15"
              />
            </label>

            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-[#2f4f4f] px-5 py-2.5 text-sm font-medium text-[#f3f1ec] transition hover:bg-[#264040] disabled:opacity-60"
              >
                {isSaving ? 'שומר...' : editingId ? 'עדכון מוצר' : 'הוספת מוצר'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-stone-300 px-5 py-2.5 text-sm text-stone-600 transition hover:border-stone-500"
                >
                  ביטול עריכה
                </button>
              )}
            </div>
          </form>

          <div className="mt-12">
            <h2 className="font-display text-2xl text-[#1a1f1c]">כל המוצרים</h2>
            {isLoading && <p className="mt-8 text-stone-500">טוען...</p>}
            {!isLoading && products.length === 0 && (
              <p className="mt-8 text-stone-500">אין מוצרים עדיין.</p>
            )}
            {!isLoading && products.length > 0 && (
              <ul className="mt-6 divide-y divide-stone-200 border-t border-b border-stone-200">
                {products.map((product) => {
                  const category = CATEGORIES.find((c) => c.slug === product.category);
                  return (
                    <li
                      key={product._id}
                      className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <img
                          src={product.image_url}
                          alt=""
                          className="h-16 w-16 shrink-0 object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[#1a1f1c]">{product.name}</p>
                          <p className="mt-1 text-sm text-stone-500">
                            {category?.label || product.category} · {formatPrice(product.price)} ·
                            מלאי {product.stock_quantity}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(product)}
                          className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:border-[#2f4f4f] hover:text-[#2f4f4f]"
                        >
                          עריכה
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product._id)}
                          className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-700 transition hover:bg-red-50"
                        >
                          מחיקה
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}

      {tab === 'users' && (
        <div className="mt-10">
          <h2 className="font-display text-2xl text-[#1a1f1c]">כל המשתמשים</h2>
          {isLoading && <p className="mt-8 text-stone-500">טוען...</p>}
          {!isLoading && users.length === 0 && (
            <p className="mt-8 text-stone-500">אין משתמשים רשומים.</p>
          )}
          {!isLoading && users.length > 0 && (
            <div className="mt-6 overflow-x-auto border-t border-b border-stone-200">
              <table className="min-w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500">
                    <th className="px-3 py-3 font-medium">שם</th>
                    <th className="px-3 py-3 font-medium">אימייל</th>
                    <th className="px-3 py-3 font-medium">תפקיד</th>
                    <th className="px-3 py-3 font-medium">הצטרפות</th>
                    <th className="px-3 py-3 font-medium">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((listedUser) => {
                    const isSelf =
                      currentUser?.id === listedUser._id ||
                      currentUser?.email === listedUser.email;

                    return (
                      <tr key={listedUser._id} className="border-b border-stone-100">
                        <td className="px-3 py-3 font-medium text-[#1a1f1c]">{listedUser.name}</td>
                        <td className="px-3 py-3 text-stone-600" dir="ltr">
                          {listedUser.email}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs ${
                              listedUser.role === 'admin'
                                ? 'bg-[#2f4f4f] text-[#f3f1ec]'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {listedUser.role === 'admin' ? 'מנהל' : 'משתמש'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-stone-500">
                          {formatDate(listedUser.created_at)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            {listedUser.role !== 'admin' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateUserRole(listedUser._id, listedUser.name, 'admin')
                                }
                                className="rounded-full border border-[#2f4f4f]/30 px-3 py-1.5 text-xs text-[#2f4f4f] transition hover:bg-[#2f4f4f] hover:text-[#f3f1ec]"
                              >
                                הפוך למנהל
                              </button>
                            ) : (
                              !isSelf && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateUserRole(listedUser._id, listedUser.name, 'user')
                                  }
                                  className="rounded-full border border-stone-300 px-3 py-1.5 text-xs text-stone-600 transition hover:border-stone-500"
                                >
                                  הסר מנהל
                                </button>
                              )
                            )}
                            {isSelf ? (
                              <span className="self-center text-xs text-stone-400">זה את/ה</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(listedUser._id, listedUser.name)}
                                className="rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-700 transition hover:bg-red-50"
                              >
                                מחיקה
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div className="mt-10">
          <h2 className="font-display text-2xl text-[#1a1f1c]">כל ההזמנות</h2>
          {isLoading && <p className="mt-8 text-stone-500">טוען...</p>}
          {!isLoading && orders.length === 0 && (
            <p className="mt-8 text-stone-500">
              אין הזמנות עדיין. הזמנות נוצרות כשמשתמש מחובר לוחץ «המשך לתשלום» בסל.
            </p>
          )}
          {!isLoading && orders.length > 0 && (
            <ul className="mt-6 space-y-4">
              {orders.map((order) => (
                <li
                  key={order._id}
                  className="rounded-2xl border border-stone-200 bg-white/70 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-[#1a1f1c]">
                        {order.userId?.name || 'משתמש'}{' '}
                        <span className="text-stone-500" dir="ltr">
                          ({order.userId?.email || '—'})
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-stone-500">
                        {formatDate(order.created_at)} · {formatPrice(order.totalAmount)}
                        {order.paymentMethod === 'fake_card' ? ' · תשלום פיקטיבי' : ''}
                        {' · '}
                        {order.fulfillmentMethod === 'pickup' ? 'איסוף עצמי' : 'משלוח'}
                      </p>
                      {order.fulfillmentMethod === 'delivery' && order.shippingAddress && (
                        <p className="mt-1 text-sm text-stone-600">
                          כתובת: {order.shippingAddress}
                        </p>
                      )}
                      {order.fulfillmentMethod === 'pickup' && (
                        <p className="mt-1 text-sm text-stone-600">איסוף מכתובת החנות</p>
                      )}
                    </div>
                    <label className="flex items-center gap-2 text-sm text-stone-600">
                      סטטוס
                      <select
                        value={order.status}
                        onChange={(e) => handleOrderStatus(order._id, e.target.value)}
                        className="rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none focus:border-[#3d5c5c]"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <ul className="mt-4 space-y-1 border-t border-stone-200 pt-4 text-sm text-stone-600">
                    {order.items?.map((item, index) => (
                      <li key={`${order._id}-${index}`} className="flex justify-between gap-4">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
