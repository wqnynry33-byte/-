const HERO_IMAGE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80';

export default function Hero() {
  return (
    <section
      className="relative isolate min-h-[calc(100svh-4.25rem)] overflow-hidden bg-[#1a1f1c]"
      aria-label="באנר ראשי"
    >
      <img
        src={HERO_IMAGE}
        alt="שולחן ערוך בסטייל עם כלי הגשה ואירוח"
        className="absolute inset-0 h-full w-full object-cover animate-[heroZoom_18s_ease-out_forwards]"
      />
      <div
        className="absolute inset-0 bg-gradient-to-l from-[#1a1f1c]/75 via-[#1a1f1c]/45 to-[#1a1f1c]/25"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[calc(100svh-4.25rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <p className="animate-[fadeUp_700ms_ease-out_both] font-display text-sm tracking-[0.28em] text-[#d8e0dc] sm:text-base">
          HOME-WARE
        </p>
        <h1 className="mt-4 max-w-2xl animate-[fadeUp_700ms_ease-out_120ms_both] font-display text-4xl leading-[1.15] text-white sm:text-5xl md:text-6xl lg:text-[4rem]">
          להלביש את השולחן בסטייל שלך
        </h1>
        <p className="mt-5 max-w-md animate-[fadeUp_700ms_ease-out_220ms_both] text-base leading-relaxed text-stone-200/90 sm:text-lg">
          כלי הגשה ואירוח נקיים ומדויקים — לאירוח שמרגיש כמו בבית.
        </p>
        <div className="mt-8 animate-[fadeUp_700ms_ease-out_320ms_both]">
          <a
            href="#collections"
            className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-medium text-[#1a1f1c] transition duration-300 hover:bg-[#e8eeea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            לכל הקולקציות
          </a>
        </div>
      </div>
    </section>
  );
}
