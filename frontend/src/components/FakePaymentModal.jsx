import { useEffect, useId, useRef, useState } from 'react';
import { formatPrice } from '../services/api';
import { STORE } from '../constants/store';

function formatCardNumber(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function FakePaymentModal({
  isOpen,
  onClose,
  onConfirm,
  totalPrice,
  isSubmitting,
  error,
}) {
  const [fulfillmentMethod, setFulfillmentMethod] = useState('delivery');
  const [shippingAddress, setShippingAddress] = useState('');
  const [cardName, setCardName] = useState('Israel Israeli');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [localError, setLocalError] = useState('');
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event) {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose, isSubmitting]);

  useEffect(() => {
    if (isOpen) {
      setFulfillmentMethod('delivery');
      setShippingAddress('');
      setCardName('Israel Israeli');
      setCardNumber('4242 4242 4242 4242');
      setExpiry('12/28');
      setCvv('123');
      setLocalError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError('');

    if (fulfillmentMethod === 'delivery' && shippingAddress.trim().length < 5) {
      setLocalError('נא להזין כתובת משלוח מלאה (רחוב, מספר, עיר)');
      return;
    }

    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 16) {
      setLocalError('מספר כרטיס חייב להכיל 16 ספרות (פיקטיבי)');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setLocalError('תוקף בפורמט MM/YY');
      return;
    }
    if (cvv.length < 3) {
      setLocalError('CVV חייב להכיל 3 ספרות');
      return;
    }
    if (!cardName.trim()) {
      setLocalError('נא למלא שם בעל הכרטיס');
      return;
    }

    try {
      await onConfirm({
        fulfillmentMethod,
        shippingAddress: fulfillmentMethod === 'delivery' ? shippingAddress.trim() : '',
        cardName: cardName.trim(),
        cardLast4: digits.slice(-4),
      });
    } catch {
      // Parent sets error state
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/45 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-[#faf8f4] p-6 shadow-[0_24px_60px_rgba(28,25,23,0.28)] sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-[#4f6f6f]">DEMO PAYMENT</p>
            <h2 id={titleId} className="mt-2 font-display text-2xl text-stone-900">
              תשלום פיקטיבי
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              בחרו משלוח או איסוף עצמי, ואז אשרו תשלום מדומה.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-2 text-stone-400 transition hover:bg-stone-200/70 hover:text-stone-700 disabled:opacity-40"
            aria-label="סגירה"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-[#2f4f4f] px-4 py-3 text-[#f3f1ec]">
          <p className="text-xs opacity-80">סכום לתשלום</p>
          <p className="mt-1 text-2xl font-medium">{formatPrice(totalPrice)}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <fieldset>
            <legend className="mb-2 text-sm text-stone-600">אופן קבלת ההזמנה</legend>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFulfillmentMethod('delivery')}
                className={`rounded-xl border px-3 py-3 text-sm transition ${
                  fulfillmentMethod === 'delivery'
                    ? 'border-[#2f4f4f] bg-[#2f4f4f] text-[#f3f1ec]'
                    : 'border-stone-300 bg-white text-stone-700 hover:border-[#2f4f4f]'
                }`}
              >
                משלוח
              </button>
              <button
                type="button"
                onClick={() => setFulfillmentMethod('pickup')}
                className={`rounded-xl border px-3 py-3 text-sm transition ${
                  fulfillmentMethod === 'pickup'
                    ? 'border-[#2f4f4f] bg-[#2f4f4f] text-[#f3f1ec]'
                    : 'border-stone-300 bg-white text-stone-700 hover:border-[#2f4f4f]'
                }`}
              >
                איסוף עצמי
              </button>
            </div>
          </fieldset>

          {fulfillmentMethod === 'delivery' ? (
            <label className="block">
              <span className="mb-1.5 block text-sm text-stone-600">כתובת למשלוח</span>
              <textarea
                required
                rows={2}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="רחוב, מספר בית, עיר"
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/20"
              />
            </label>
          ) : (
            <div className="rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-600">
              <p className="font-medium text-[#1a1f1c]">איסוף מהחנות</p>
              <p className="mt-1">{STORE.address}</p>
              <p className="mt-1 text-xs text-stone-500">א׳–ה׳ 10:00–19:00 · ו׳ 09:00–14:00</p>
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm text-stone-600">שם על הכרטיס</span>
            <input
              required
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/20"
              autoComplete="cc-name"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm text-stone-600">מספר כרטיס</span>
            <input
              required
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              dir="ltr"
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/20"
              autoComplete="cc-number"
              inputMode="numeric"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm text-stone-600">תוקף</span>
              <input
                required
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                dir="ltr"
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/20"
                autoComplete="cc-exp"
                inputMode="numeric"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-stone-600">CVV</span>
              <input
                required
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                dir="ltr"
                className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/20"
                autoComplete="cc-csc"
                inputMode="numeric"
              />
            </label>
          </div>

          {(localError || error) && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {localError || error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#2f4f4f] px-4 py-3 text-sm font-medium text-[#f7f4ef] transition hover:bg-[#264040] disabled:opacity-60"
          >
            {isSubmitting ? 'מעבד תשלום מדומה...' : `שלם ${formatPrice(totalPrice)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
