import { Link } from 'react-router-dom';
import { CATEGORIES } from '../constants/categories';
import { STORE, getGoogleMapsDirectionsUrl } from '../constants/store';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-[#1a1f1c] text-[#f3f1ec]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="font-display text-2xl">
            Home<span className="text-[#9fb5b5]">-Ware</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-300">
            כלי הגשה ואירוח בעיצוב נקי — להלביש את השולחן בסטייל שלך.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-medium tracking-wide text-stone-400">קטגוריות</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link to={`/shop/${category.slug}`} className="text-stone-200 transition hover:text-white">
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-medium tracking-wide text-stone-400">יצירת קשר</h2>
          <ul className="mt-4 space-y-2 text-sm text-stone-200">
            <li>
              <Link to="/contact" className="transition hover:text-white">
                {STORE.address}
              </Link>
            </li>
            <li>
              <a href={`tel:${STORE.phone}`} className="transition hover:text-white" dir="ltr">
                {STORE.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${STORE.email}`} className="transition hover:text-white" dir="ltr">
                {STORE.email}
              </a>
            </li>
            <li>
              <a
                href={getGoogleMapsDirectionsUrl()}
                target="_blank"
                rel="noreferrer"
                className="text-[#9fb5b5] transition hover:text-white"
              >
                ניווט ב-Google Maps ←
              </a>
            </li>
          </ul>
          <p className="mt-4 text-sm text-stone-400">
            <Link to="/contact" className="underline-offset-4 hover:underline">
              מדיניות משלוחים והחזרות
            </Link>
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Home-Ware Store
      </div>
    </footer>
  );
}
