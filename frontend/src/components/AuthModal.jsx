import { useEffect, useId, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    dialogRef.current?.querySelector('input')?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setMode('login');
      setName('');
      setEmail('');
      setPassword('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'הפעולה נכשלה');
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError('');
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/45 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md animate-[modalIn_220ms_ease-out] rounded-2xl bg-[#faf8f4] p-6 shadow-[0_24px_60px_rgba(28,25,23,0.28)] sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-[#4f6f6f]">
              HOME-WARE
            </p>
            <h2 id={titleId} className="mt-2 font-display text-2xl text-stone-900">
              {mode === 'login' ? 'התחברות' : 'הרשמה'}
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              {mode === 'login'
                ? 'ברוכים השבים לחנות כלי הבית'
                : 'צרו חשבון ותתחילו לעצב את השולחן'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 transition hover:bg-stone-200/70 hover:text-stone-700"
            aria-label="סגירה"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-stone-200/60 p-1">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              mode === 'login'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            התחברות
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              mode === 'register'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            הרשמה
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <label className="block">
              <span className="mb-1.5 block text-sm text-stone-600">שם מלא</span>
              <input
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-stone-300/80 bg-white px-3.5 py-2.5 text-stone-900 outline-none transition focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/20"
                placeholder="ישראל ישראלי"
                autoComplete="name"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm text-stone-600">אימייל</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-stone-300/80 bg-white px-3.5 py-2.5 text-stone-900 outline-none transition focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/20"
              placeholder="name@email.com"
              autoComplete="email"
              dir="ltr"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm text-stone-600">סיסמה</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-stone-300/80 bg-white px-3.5 py-2.5 text-stone-900 outline-none transition focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/20"
              placeholder="לפחות 6 תווים"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              dir="ltr"
            />
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#2f4f4f] px-4 py-3 text-sm font-medium text-[#f7f4ef] transition hover:bg-[#264040] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? 'רגע...'
              : mode === 'login'
                ? 'התחברות'
                : 'יצירת חשבון'}
          </button>
        </form>
      </div>
    </div>
  );
}
