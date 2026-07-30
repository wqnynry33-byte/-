import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import FakePaymentModal from '../components/FakePaymentModal';
import { formatPrice, ordersApi } from '../services/api';

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { items, itemCount, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function openPayment() {
    setError('');
    setSuccess('');

    if (!isAuthenticated) {
      setError('יש להתחבר לפני ביצוע תשלום');
      return;
    }

    setIsPaymentOpen(true);
  }

  async function handleFakePay(paymentDetails = {}) {
    setError('');
    setIsSubmitting(true);

    const cartSnapshot = items.map((item) => ({
      productId: String(item.id),
      quantity: Number(item.quantity) || 1,
    }));

    if (cartSnapshot.length === 0) {
      setError('הסל ריק');
      setIsSubmitting(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      await ordersApi.create(cartSnapshot, {
        fakePayment: true,
        fulfillmentMethod: paymentDetails.fulfillmentMethod || 'delivery',
        shippingAddress: paymentDetails.shippingAddress || '',
      });

      clearCart();
      setIsPaymentOpen(false);
      const methodLabel =
        paymentDetails.fulfillmentMethod === 'pickup' ? 'איסוף עצמי מהחנות' : 'משלוח';
      setSuccess(`התשלום הפיקטיבי הצליח! ההזמנה נשמרה (${methodLabel}).`);
    } catch (err) {
      setError(err.message || 'התשלום נכשל');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-xs font-medium tracking-[0.18em] text-[#4f6f6f]">CART</p>
        <h1 className="mt-2 font-display text-3xl text-[#1a1f1c]">סל הקניות ריק</h1>
        <p className="mt-3 text-stone-600">עדיין לא הוספת מוצרים. אפשר להתחיל מהקולקציות.</p>
        {success && <p className="mt-4 text-emerald-700">{success}</p>}
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-[#2f4f4f] px-6 py-3 text-sm font-medium text-[#f3f1ec] transition hover:bg-[#264040]"
        >
          לכל הקולקציות
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-[#4f6f6f]">CART</p>
            <h1 className="mt-2 font-display text-3xl text-[#1a1f1c] sm:text-4xl">סל הקניות</h1>
            <p className="mt-2 text-stone-600">{itemCount} פריטים בסך הכל</p>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="self-start rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-600 transition hover:border-stone-500 hover:text-stone-800"
          >
            ריקון הסל
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <ul className="divide-y divide-stone-200 border-t border-b border-stone-200">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                <Link to={`/product/${item.id}`} className="shrink-0 overflow-hidden bg-stone-200">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-28 w-28 object-cover sm:h-24 sm:w-24"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center text-xs text-stone-400 sm:h-24 sm:w-24">
                      אין תמונה
                    </div>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    to={`/product/${item.id}`}
                    className="font-display text-lg text-[#1a1f1c] transition hover:text-[#2f4f4f]"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-stone-500">{formatPrice(item.price)} ליחידה</p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-stone-600">
                      כמות
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) => updateQuantity(item.id, event.target.value)}
                        className="w-16 rounded-xl border border-stone-300 bg-white px-2 py-1.5 text-center outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/15"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-red-700 transition hover:underline"
                    >
                      הסרה
                    </button>
                  </div>
                </div>

                <p className="shrink-0 text-base font-medium text-[#1a1f1c] sm:text-left">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-2xl border border-stone-200 bg-white/70 p-6">
            <h2 className="font-display text-xl text-[#1a1f1c]">סיכום הזמנה</h2>
            <div className="mt-4 flex items-center justify-between text-sm text-stone-600">
              <span>סה״כ מוצרים</span>
              <span>{itemCount}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-4 text-lg font-medium text-[#1a1f1c]">
              <span>לתשלום</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

            {error && !isPaymentOpen && (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={openPayment}
              className="mt-6 w-full rounded-full bg-[#2f4f4f] px-5 py-3 text-sm font-medium text-[#f3f1ec] transition hover:bg-[#264040]"
            >
              המשך לתשלום פיקטיבי
            </button>
            {!isAuthenticated && (
              <p className="mt-2 text-center text-xs text-stone-500">יש להתחבר כדי לבצע תשלום</p>
            )}
            <p className="mt-2 text-center text-xs text-stone-400">סימולציה בלבד — לא נגבה כסף אמיתי</p>
            <Link
              to="/"
              className="mt-3 block text-center text-sm text-stone-500 transition hover:text-[#2f4f4f]"
            >
              המשך בקניות
            </Link>
          </aside>
        </div>
      </div>

      <FakePaymentModal
        isOpen={isPaymentOpen}
        onClose={() => {
          if (!isSubmitting) setIsPaymentOpen(false);
        }}
        onConfirm={handleFakePay}
        totalPrice={totalPrice}
        isSubmitting={isSubmitting}
        error={error}
      />
    </>
  );
}
