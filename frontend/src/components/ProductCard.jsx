import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../services/api';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleQuickAdd(event) {
    event.preventDefault();
    event.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="group flex h-full flex-col">
      <Link to={`/product/${product._id}`} className="block overflow-hidden bg-stone-200">
        <img
          src={product.image_url}
          alt={product.name}
          className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <Link to={`/product/${product._id}`} className="block">
          <h3 className="font-display text-lg text-[#1a1f1c] transition group-hover:text-[#2f4f4f]">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-stone-500">{product.material}</p>
          <p className="mt-2 text-base font-medium text-[#1a1f1c]">
            {formatPrice(product.price)}
          </p>
        </Link>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={product.stock_quantity < 1}
          className="mt-4 w-full rounded-full border border-[#2f4f4f] px-4 py-2.5 text-sm font-medium text-[#2f4f4f] transition hover:bg-[#2f4f4f] hover:text-[#f3f1ec] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {product.stock_quantity < 1
            ? 'אזל מהמלאי'
            : added
              ? 'נוסף לעגלה ✓'
              : 'הוספה מהירה לעגלה'}
        </button>
      </div>
    </article>
  );
}
