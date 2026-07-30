import { Link } from 'react-router-dom';
import { CATEGORIES } from '../constants/categories';

export default function CategoryGrid() {
  return (
    <section
      id="collections"
      className="scroll-mt-20 bg-[#f3f1ec] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
      aria-labelledby="collections-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <h2
            id="collections-heading"
            className="font-display text-3xl text-[#1a1f1c] sm:text-4xl"
          >
            הקולקציות שלנו
          </h2>
          <p className="mt-3 text-base text-stone-600 sm:text-lg">
            ארבע קטגוריות ליבה לבניית שולחן מלא ומעוצב.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {CATEGORIES.map((category, index) => (
            <li
              key={category.slug}
              className="animate-[fadeUp_700ms_ease-out_both]"
              style={{ animationDelay: `${150 + index * 90}ms` }}
            >
              <Link
                to={`/shop/${category.slug}`}
                className="group relative block aspect-square overflow-hidden bg-stone-300 outline-none focus-visible:ring-2 focus-visible:ring-[#2f4f4f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3f1ec]"
              >
                <img
                  src={category.image}
                  alt=""
                  className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#1a1f1c]/80 via-[#1a1f1c]/20 to-transparent transition duration-500 group-hover:from-[#1a1f1c]/90"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <h3 className="font-display text-2xl text-white">{category.label}</h3>
                  <p className="mt-1 text-sm text-stone-200/85">{category.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white/90 transition group-hover:gap-2">
                    לקטלוג
                    <span aria-hidden="true">←</span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
