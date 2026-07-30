import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CATEGORIES } from '../constants/categories';
import AuthModal from './AuthModal';

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  function handleSearch(event) {
    event.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsMobileNavOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f7f4ef]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0 font-display text-xl tracking-tight text-stone-900 sm:text-2xl">
            Home<span className="text-[#2f4f4f]">-Ware</span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-6 md:flex" aria-label="קטגוריות">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                to={`/shop/${category.slug}`}
                className="text-sm text-stone-600 transition hover:text-[#2f4f4f]"
              >
                {category.label}
              </Link>
            ))}
          </nav>

          <form
            onSubmit={handleSearch}
            className="hidden min-w-0 flex-1 items-center lg:flex lg:max-w-xs"
            role="search"
          >
            <label className="relative w-full">
              <span className="sr-only">חיפוש מוצרים</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="חיפוש מוצרים..."
                className="w-full rounded-full border border-stone-300/90 bg-white/80 py-2 pr-4 pl-10 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/15"
              />
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
              </svg>
            </label>
          </form>

          <div className="ms-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              className="rounded-full p-2 text-stone-600 transition hover:bg-stone-200/70 hover:text-stone-900 lg:hidden"
              aria-label="חיפוש"
              onClick={() => setIsMobileNavOpen((open) => !open)}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
              </svg>
            </button>

            <Link
              to="/cart"
              className="relative rounded-full p-2 text-stone-600 transition hover:bg-stone-200/70 hover:text-stone-900"
              aria-label={`עגלת קניות${itemCount > 0 ? `, ${itemCount} פריטים` : ''}`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5h2l1.5 11h11L20 8H7"
                />
                <circle cx="9.5" cy="19" r="1.2" fill="currentColor" stroke="none" />
                <circle cx="16.5" cy="19" r="1.2" fill="currentColor" stroke="none" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -left-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2f4f4f] px-1 text-[10px] font-semibold text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-1 sm:gap-2">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="rounded-full border border-[#2f4f4f]/30 px-3 py-1.5 text-xs font-medium text-[#2f4f4f] transition hover:bg-[#2f4f4f] hover:text-[#f7f4ef] sm:text-sm"
                  >
                    ניהול
                  </Link>
                )}
                <span className="hidden max-w-28 truncate text-sm font-medium text-stone-800 sm:inline">
                  {user.name}
                </span>
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2f4f4f] text-sm font-medium text-[#f7f4ef] sm:hidden"
                  title={user.name}
                >
                  {user.name?.charAt(0) || 'מ'}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full px-2.5 py-1.5 text-xs text-stone-500 transition hover:bg-stone-200/70 hover:text-stone-800 sm:text-sm"
                >
                  יציאה
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="rounded-full bg-[#2f4f4f] px-3.5 py-2 text-xs font-medium text-[#f7f4ef] transition hover:bg-[#264040] sm:px-4 sm:text-sm"
              >
                התחברות / הרשמה
              </button>
            )}

            <button
              type="button"
              className="rounded-full p-2 text-stone-600 transition hover:bg-stone-200/70 md:hidden"
              aria-expanded={isMobileNavOpen}
              aria-label="תפריט קטגוריות"
              onClick={() => setIsMobileNavOpen((open) => !open)}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>

        {isMobileNavOpen && (
          <div className="border-t border-stone-200/80 px-4 py-3 md:hidden">
            <form onSubmit={handleSearch} className="mb-3 lg:hidden" role="search">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="חיפוש מוצרים..."
                className="w-full rounded-full border border-stone-300/90 bg-white/80 px-4 py-2 text-sm outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/15"
              />
            </form>
            <nav className="flex flex-wrap gap-2" aria-label="קטגוריות מובייל">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.slug}
                  to={`/shop/${category.slug}`}
                  onClick={() => setIsMobileNavOpen(false)}
                  className="rounded-full border border-stone-300/80 bg-white/70 px-3 py-1.5 text-sm text-stone-700"
                >
                  {category.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
