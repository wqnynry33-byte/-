import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getCategoryBySlug, CATEGORIES } from '../constants/categories';
import { productsApi } from '../services/api';

export default function ShopPage() {
  const { category: categorySlug } = useParams();
  const category = getCategoryBySlug(categorySlug);

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('price_asc');
  const [material, setMaterial] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!category) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const data = await productsApi.getAll({
          category: category.slug,
          sort,
          material: material || undefined,
        });
        if (!cancelled) {
          setProducts(data.products || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'לא ניתן לטעון מוצרים');
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
  }, [category, sort, material]);

  const materials = useMemo(() => {
    const values = products.map((product) => product.material).filter(Boolean);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'he'));
  }, [products]);

  // When filtering by material server-side, materials list shrinks.
  // Keep available materials from an unfiltered fetch for better UX.
  const [allMaterials, setAllMaterials] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadMaterials() {
      if (!category) return;
      try {
        const data = await productsApi.getAll({ category: category.slug });
        if (!cancelled) {
          const values = (data.products || [])
            .map((product) => product.material)
            .filter(Boolean);
          setAllMaterials([...new Set(values)].sort((a, b) => a.localeCompare(b, 'he')));
        }
      } catch {
        // Keep empty materials list on failure
      }
    }

    loadMaterials();
    return () => {
      cancelled = true;
    };
  }, [category]);

  if (!category) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl text-[#1a1f1c]">קטגוריה לא נמצאה</h1>
        <Link to="/" className="mt-6 inline-block text-[#2f4f4f] underline-offset-4 hover:underline">
          חזרה לדף הבית
        </Link>
      </div>
    );
  }

  const materialOptions = allMaterials.length ? allMaterials : materials;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <nav className="text-sm text-stone-500">
        <Link to="/" className="transition hover:text-[#2f4f4f]">
          דף הבית
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">{category.label}</span>
      </nav>

      <div className="mt-6 flex flex-col gap-6 border-b border-stone-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl text-[#1a1f1c] sm:text-4xl">{category.title}</h1>
          <p className="mt-3 text-stone-600">{category.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <Link
              key={item.slug}
              to={`/shop/${item.slug}`}
              className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                item.slug === category.slug
                  ? 'bg-[#2f4f4f] text-[#f3f1ec]'
                  : 'border border-stone-300 text-stone-600 hover:border-[#2f4f4f] hover:text-[#2f4f4f]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="block min-w-[160px]">
          <span className="mb-1.5 block text-xs font-medium tracking-wide text-stone-500">
            מיון לפי מחיר
          </span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/15"
          >
            <option value="price_asc">מחיר: נמוך לגבוה</option>
            <option value="price_desc">מחיר: גבוה לנמוך</option>
          </select>
        </label>

        <label className="block min-w-[160px]">
          <span className="mb-1.5 block text-xs font-medium tracking-wide text-stone-500">
            חומר
          </span>
          <select
            value={material}
            onChange={(event) => setMaterial(event.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-[#3d5c5c] focus:ring-2 focus:ring-[#3d5c5c]/15"
          >
            <option value="">הכל</option>
            {materialOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading && (
        <p className="mt-16 text-center text-stone-500">טוען מוצרים...</p>
      )}

      {!isLoading && error && (
        <p className="mt-16 text-center text-red-700" role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && products.length === 0 && (
        <p className="mt-16 text-center text-stone-500">
          לא נמצאו מוצרים בקטגוריה זו
          {material ? ` עם החומר "${material}"` : ''}.
        </p>
      )}

      {!isLoading && !error && products.length > 0 && (
        <ul className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product._id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
