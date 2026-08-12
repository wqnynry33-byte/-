import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategoryBySlug } from '../constants/categories';
import { holidaysApi } from '../services/api';
import ProductCard from './ProductCard';

function formatHebrewDate(isoDate) {
  return new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${isoDate}T00:00:00`));
}

function formatCountdown(daysUntil) {
  if (daysUntil <= 0) return 'היום';
  if (daysUntil === 1) return 'מחר';
  return `בעוד ${daysUntil} ימים`;
}

export default function HolidayBanner() {
  const [featured, setFeatured] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await holidaysApi.getFeatured();
        if (!cancelled) setFeatured(data.holiday ? data : null);
      } catch {
        if (!cancelled) setFeatured(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading || !featured?.holiday) return null;

  const { holiday, products = [] } = featured;
  const category = getCategoryBySlug(holiday.category);

  return (
    <section
      className="bg-[#f3f1ec] px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
      aria-labelledby="holiday-heading"
    >
      <div className="mx-auto max-w-6xl rounded-3xl border border-stone-200 bg-white/70 p-6 sm:p-8 lg:p-10">
        <p className="text-xs font-medium tracking-[0.18em] text-[#4f6f6f]">UPCOMING HOSTING</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="holiday-heading" className="font-display text-3xl text-[#1a1f1c] sm:text-4xl">
              {holiday.name}
            </h2>
            <p className="mt-2 text-stone-600">
              {formatCountdown(holiday.daysUntil)} ·{' '}
              {holiday.hebrewDate || formatHebrewDate(holiday.date)}
            </p>
            <p className="mt-1 text-sm text-stone-500">{holiday.tagline}</p>
          </div>
          {category && (
            <Link
              to={`/shop/${holiday.category}`}
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#2f4f4f] px-5 py-2.5 text-sm font-medium text-[#f3f1ec] transition hover:bg-[#264040]"
            >
              ל{category.label}
            </Link>
          )}
        </div>

        {products.length > 0 && (
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
            {products.map((product) => (
              <li key={product._id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
