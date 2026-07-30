import { STORE, getGoogleMapsEmbedUrl, getGoogleMapsDirectionsUrl } from '../constants/store';

export default function ContactPage() {
  const mapUrl = getGoogleMapsEmbedUrl();
  const hasApiKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-[0.18em] text-[#4f6f6f]">CONTACT</p>
        <h1 className="mt-2 font-display text-3xl text-[#1a1f1c] sm:text-4xl">יצירת קשר</h1>
        <p className="mt-3 text-stone-600">
          בואו לבקר בחנות, או צרו קשר — נשמח לעזור לבחור את הכלים לשולחן שלכם.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white/70 p-6">
            <h2 className="font-display text-xl text-[#1a1f1c]">כתובת החנות</h2>
            <p className="mt-3 text-stone-700">{STORE.address}</p>
            <p className="mt-1 text-sm text-stone-500" dir="ltr">
              {STORE.addressEn}
            </p>
            <a
              href={getGoogleMapsDirectionsUrl()}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex rounded-full bg-[#2f4f4f] px-5 py-2.5 text-sm font-medium text-[#f3f1ec] transition hover:bg-[#264040]"
            >
              ניווט ב-Google Maps
            </a>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white/70 p-6">
            <h2 className="font-display text-xl text-[#1a1f1c]">פרטים</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex gap-4">
                <dt className="w-16 shrink-0 text-stone-500">טלפון</dt>
                <dd>
                  <a href={`tel:${STORE.phone}`} className="text-[#1a1f1c]" dir="ltr">
                    {STORE.phone}
                  </a>
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-16 shrink-0 text-stone-500">אימייל</dt>
                <dd>
                  <a href={`mailto:${STORE.email}`} className="text-[#1a1f1c]" dir="ltr">
                    {STORE.email}
                  </a>
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-16 shrink-0 text-stone-500">שעות</dt>
                <dd className="text-[#1a1f1c]">א׳–ה׳ 10:00–19:00 · ו׳ 09:00–14:00</dd>
              </div>
            </dl>
          </div>

          {!hasApiKey && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              כדי להפעיל את Google Maps Embed API, הוסיפי ל־frontend קובץ{' '}
              <code className="rounded bg-amber-100 px-1">.env</code> עם{' '}
              <code className="rounded bg-amber-100 px-1">VITE_GOOGLE_MAPS_API_KEY</code>.
              כרגע מוצגת מפה בסיסית.
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-200">
          <iframe
            title={`מפת Google — ${STORE.name}`}
            src={mapUrl}
            className="h-[420px] w-full border-0 lg:h-full lg:min-h-[480px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
