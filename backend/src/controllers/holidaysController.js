/**
 * ============================================================================
 * Holidays Controller — אינטגרציה עם API חיצוני (Hebcal)
 * ============================================================================
 * Hebcal = לוח שנה עברי / חגים. בלי מפתח API.
 *
 * למה הקריאה מה-backend ולא מה-frontend?
 *   1. Cache — לא לקרוא החוצה בכל רענון דף
 *   2. מיפוי חג → קטגוריה בחנות נשאר בשרת
 *   3. Fallback — אם Hebcal נפל, האתר עדיין מחזיר תשובה תקינה
 *
 * Cache בזיכרון (in-memory): TTL של 12 שעות.
 * לא Redis — מספיק לשרת אחד בפיתוח/פרויקט.
 */
const Product = require('../models/Product');

const HEBCAL_URL = 'https://www.hebcal.com/hebcal';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

const HOLIDAY_MAP = [
  { match: /פסח|pesach|passover/i, category: 'tablecloths', tagline: 'מפות וצלחות לשולחן החג' },
  { match: /ראש השנה|rosh.?hashan/i, category: 'plates', tagline: 'צלחות הגשה לאירוח ראש השנה' },
  { match: /סוכות|sukkot|succot/i, category: 'tablecloths', tagline: 'מפות לשולחן בסוכה' },
  { match: /שמחת תורה|simchat torah/i, category: 'glasses', tagline: 'כוסות לקידוש ולחגיגה' },
  { match: /חנוכה|chanukah|hanukkah/i, category: 'glasses', tagline: 'כוסות ללביבות ולאירוח' },
  { match: /פורים|purim/i, category: 'plates', tagline: 'צלחות למשלוח מנות ולשולחן' },
  { match: /שבועות|shavuot/i, category: 'plates', tagline: 'צלחות לשולחן החלבי' },
  { match: /טו בשבט|tu bishvat|tu b.?shevat/i, category: 'plates', tagline: 'קעריות וצלחות לפירות יבשים' },
  { match: /יום כיפור|yom kippur/i, category: 'glasses', tagline: 'כוסות לקידוש במוצאי הצום' },
];

const SKIP_PATTERN = /ערב|erev|חול המועד|chol hamoed|שבת חול המועד/i;

let cache = { expiresAt: 0, payload: null };

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function daysUntil(isoDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${isoDate}T00:00:00`);
  return Math.round((target - today) / (24 * 60 * 60 * 1000));
}

/** תאריך עברי בעברית (למשל: "שבת, א׳ בתשרי תשפ״ז") */
function formatHebrewDate(isoDate) {
  return new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${isoDate}T00:00:00`));
}

function mapHoliday(item) {
  const haystack = `${item.hebrew || ''} ${item.title || ''}`;
  return HOLIDAY_MAP.find((entry) => entry.match.test(haystack));
}

function pickUpcomingHoliday(items, todayIso) {
  return items
    .filter((item) => item.category === 'holiday' && item.date >= todayIso)
    .filter((item) => !SKIP_PATTERN.test(`${item.hebrew || ''} ${item.title || ''}`))
    .map((item) => ({ item, mapping: mapHoliday(item) }))
    .filter(({ mapping }) => mapping)
    .sort((a, b) => a.item.date.localeCompare(b.item.date))[0];
}

async function fetchHebcalItems() {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 240);

  const params = new URLSearchParams({
    v: '1',
    cfg: 'json',
    maj: 'on',
    min: 'off',
    mod: 'off',
    nx: 'off',
    ss: 'off',
    mf: 'off',
    c: 'off',
    s: 'off',
    i: 'on', // לוח ישראל (לא תפוצות)
    lg: 'h', // כותרות בעברית
    start: toIsoDate(start),
    end: toIsoDate(end),
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${HEBCAL_URL}?${params}`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Home-Ware-Store/1.0 (student project)' },
    });

    if (!response.ok) {
      throw new Error(`Hebcal responded with ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data.items) ? data.items : [];
  } finally {
    clearTimeout(timer);
  }
}

async function getFeaturedHoliday(_req, res, next) {
  try {
    if (cache.payload && Date.now() < cache.expiresAt) {
      return res.json(cache.payload);
    }

    let items;
    try {
      items = await fetchHebcalItems();
    } catch (err) {
      // Fallback: אם יש cache ישן — מחזירים אותו; אחרת holiday: null (האתר לא נשבר)
      if (cache.payload) {
        return res.json(cache.payload);
      }
      console.error('Hebcal fetch failed:', err.message);
      return res.json({ holiday: null });
    }

    const todayIso = toIsoDate(new Date());
    const upcoming = pickUpcomingHoliday(items, todayIso);

    if (!upcoming) {
      const payload = { holiday: null };
      cache = { payload, expiresAt: Date.now() + CACHE_TTL_MS };
      return res.json(payload);
    }

    const { item, mapping } = upcoming;
    const products = await Product.find({ category: mapping.category })
      .sort({ created_at: -1 })
      .limit(4)
      .select('name price image_url category material stock_quantity');

    const payload = {
      holiday: {
        name: item.hebrew || item.title,
        date: item.date,
        hebrewDate: formatHebrewDate(item.date),
        daysUntil: daysUntil(item.date),
        category: mapping.category,
        tagline: mapping.tagline,
        source: 'hebcal',
      },
      products,
    };

    cache = { payload, expiresAt: Date.now() + CACHE_TTL_MS };
    return res.json(payload);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getFeaturedHoliday };
