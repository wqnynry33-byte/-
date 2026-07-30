import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productsApi } from '../services/api';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get('q') || '').trim();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!q) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const data = await productsApi.getAll({ q });
        if (!cancelled) {
          setProducts(data.products || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'החיפוש נכשל');
          setProducts([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <nav className="text-sm text-stone-500">
        <Link to="/" className="transition hover:text-[#2f4f4f]">
          דף הבית
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">חיפוש</span>
      </nav>

      <div className="mt-6 max-w-2xl">
        <h1 className="font-display text-3xl text-[#1a1f1c] sm:text-4xl">
          {q ? `תוצאות עבור "${q}"` : 'חיפוש מוצרים'}
        </h1>
        <p className="mt-3 text-stone-600">
          {q
            ? 'חיפוש לפי שם, תיאור, חומר או צבע.'
            : 'הקלידי מילה בשורת החיפוש למעלה ולחצי Enter.'}
        </p>
      </div>

      {isLoading && <p className="mt-16 text-center text-stone-500">מחפש...</p>}

      {!isLoading && error && (
        <p className="mt-16 text-center text-red-700" role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && q && products.length === 0 && (
        <p className="mt-16 text-center text-stone-500">לא נמצאו מוצרים התואמים לחיפוש.</p>
      )}

      {!isLoading && !error && products.length > 0 && (
        <>
          <p className="mt-8 text-sm text-stone-500">{products.length} תוצאות</p>
          <ul className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <li key={product._id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
