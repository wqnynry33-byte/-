import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getCategoryBySlug } from '../constants/categories';
import { formatPrice, productsApi } from '../services/api';

export default function ProductPage() {
  const { id } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError('');
      setQuantity(1);
      setAdded(false);

      try {
        const data = await productsApi.getById(id);
        if (!cancelled) {
          setProduct(data.product);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'המוצר לא נמצא');
          setProduct(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addItem(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  if (isLoading) {
    return <p className="px-4 py-20 text-center text-stone-500">טוען מוצר...</p>;
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl text-[#1a1f1c]">המוצר לא נמצא</h1>
        <p className="mt-3 text-stone-500">{error}</p>
        <Link to="/" className="mt-6 inline-block text-[#2f4f4f] underline-offset-4 hover:underline">
          חזרה לדף הבית
        </Link>
      </div>
    );
  }

  const category = getCategoryBySlug(product.category);
  const maxQty = Math.max(product.stock_quantity || 1, 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <nav className="text-sm text-stone-500">
        <Link to="/" className="transition hover:text-[#2f4f4f]">
          דף הבית
        </Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <Link to={`/shop/${category.slug}`} className="transition hover:text-[#2f4f4f]">
              {category.label}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-stone-800">{product.name}</span>
      </nav>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="overflow-hidden bg-stone-200">
          <img
            src={product.image_url}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover sm:aspect-square lg:aspect-[4/5]"
          />
        </div>

        <div className="flex flex-col">
          {category && (
            <Link
              to={`/shop/${category.slug}`}
              className="text-xs font-medium tracking-[0.18em] text-[#4f6f6f] transition hover:text-[#2f4f4f]"
            >
              {category.label}
            </Link>
          )}

          <h1 className="mt-3 font-display text-3xl text-[#1a1f1c] sm:text-4xl">
            {product.name}
          </h1>

          <p className="mt-4 text-2xl font-medium text-[#1a1f1c]">
            {formatPrice(product.price)}
          </p>

          <p className="mt-6 leading-relaxed text-stone-600">{product.description}</p>

          <dl className="mt-8 space-y-3 border-y border-stone-200 py-6 text-sm">
            {product.dimensions && (
              <div className="flex gap-4">
                <dt className="w-20 shrink-0 text-stone-500">מידות</dt>
                <dd className="font-medium text-[#1a1f1c]">{product.dimensions}</dd>
              </div>
            )}
            {product.material && (
              <div className="flex gap-4">
                <dt className="w-20 shrink-0 text-stone-500">חומר</dt>
                <dd className="font-medium text-[#1a1f1c]">{product.material}</dd>
              </div>
            )}
            {product.color && (
              <div className="flex gap-4">
                <dt className="w-20 shrink-0 text-stone-500">צבע</dt>
                <dd className="font-medium text-[#1a1f1c]">{product.color}</dd>
              </div>
            )}
            <div className="flex gap-4">
              <dt className="w-20 shrink-0 text-stone-500">מלאי</dt>
              <dd className="font-medium text-[#1a1f1c]">
                {product.stock_quantity > 0
                  ? `${product.stock_quantity} יחידות`
                  : 'אזל מהמלאי'}
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-3">
              <span className="text-sm text-stone-500">כמות</span>
              <input
                type="number"
                min={1}
                max={maxQty}
                value={quantity}
                onChange={(event) => {
                  const value = Number(event.target.value) || 1;
                  setQuantity(Math.min(Math.max(value, 1), maxQty));
                }}
                className="w-20 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-center text-sm outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/15"
                disabled={product.stock_quantity < 1}
              />
            </label>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock_quantity < 1}
              className="flex-1 rounded-full bg-[#2f4f4f] px-6 py-3 text-sm font-medium text-[#f3f1ec] transition hover:bg-[#264040] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:min-w-[200px]"
            >
              {product.stock_quantity < 1
                ? 'אזל מהמלאי'
                : added
                  ? 'נוסף לעגלה ✓'
                  : 'הוסף לעגלה'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
