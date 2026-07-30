מסמך איפיון אתר מעודכן: חנות כלי בית (Home-Ware Store)

1. סקירה כללית (Overview)

מטרת האתר: חנות איקומרס מודרנית ונקייה למכירת כלי הגשה ואירוח, המבוססת על ארבע קטגוריות ליבה.

דגש חווית משתמש (UX/UI): עיצוב נקי ומינימליסטי, ללא עומס ויזואלי וללא אלמנטים זזים כמו קרוסלות.

קהל יעד: חובבי עיצוב הבית, אירוח והלבשת שולחן.

2. דרישות מפתח לדף הבית (Homepage Requirements)

אינטגרציית התחברות והרשמה (Auth):

כפתור בולט ב-Header להתחברות/הרשמה (Login / Register).

לחיצה תפתח מודל (Modal) מהיר או תעביר לעמוד ייעודי המאפשר כניסה מהירה (אימייל וסיסמה, או התחברות חברתית).

לאחר ההתחברות, הכפתור ישתנה לשם המשתמש או לאייקון פרופיל אישי.

ללא קרוסלות (No Carousels):

דף הבית יהיה סטטי, יציב ומהיר.

במקום קרוסלה נעשה שימוש בבאנר תמונה ראשי (Hero Section) עם כפתור קריאה לפעולה (CTA) ברור, ולאחריו גריד קטגוריות קבוע.

3. מבנה הקטגוריות באתר (Categories)

האתר מתמקד ב-4 קטגוריות ראשיות שיופיעו כגריד מעוצב ואיכותי בדף הבית:

צלחות (Plates): צלחות מנה עיקרית, ראשונה, קעריות מרק וסטים של צלחות הגשה.

כוסות (Glasses): כוסות מים, כוסות יין, מאגים לקפה וכלי זכוכית מעוצבים.

סכו"ם (Cutlery): סטים של סכו"ם, כלי שרת, סכיני שף וכפות הגשה.

מפות (Tablecloths): מפות שולחן חגיגיות, מפיות בד, פלייסמנטים ורנרים.

4. ארכיטקטורת דפים ואלמנטים (Site Structure)

א. דף הבית (Homepage Layout):

Header (ניווט עליון):

לוגו החנות (שמאל/מרכז).

תפריט ניווט מהיר לקטגוריות (צלחות, כוסות, סכו"ם, מפות).

שורת חיפוש.

עגלת קניות (עם חיווי כמות מוצרים).

לחצן התחברות / הרשמה (Login / Register).

Hero Section (באנר ראשי):

תמונת אווירה איכותית של שולחן ערוך.

כותרת: "להלביש את השולחן בסטייל שלך".

כפתור: "לכל הקולקציות".

Category Grid (גריד קטגוריות ראשיות):

4 קוביות מעוצבות וסטטיות (בגודל זהה) – אחת לכל קטגוריה:

צלחות (קישור לקטלוג צלחות)

כוסות (קישור לקטלוג כוסות)

סכו"ם (קישור לקטלוג סכו"ם)

מפות (קישור לקטלוג מפות)

Footer (ניווט תחתון):

קישורים לשירות לקוחות, מדיניות משלוחים והחזרות, ויצירת קשר.

ב. עמוד קטלוג (Category / Shop Page):

כותרת הקטגוריה שנבחרה (לדוגמה: "צלחות הגשה ואירוח").

מסננים בסיסיים: מחיר (גבוה לנמוך / נמוך לגבוה), צבע, חומר.

גריד מוצרים פשוט ונקי (כרטיסיית מוצר כוללת: תמונה, שם, מחיר וכפתור "הוספה מהירה לעגלה").

ג. עמוד מוצר (Product Page):

תמונת מוצר גדולה ואיכותית.

פרטי מוצר: שם, מחיר, תיאור קצר, מידות (קוטר צלחת, אורך מפה וכו').

כפתור "הוסף לעגלה" עם אפשרות לבחירת כמות.

5. דרישות טכניות ומסד נתונים (Tech Details for Cursor)

Frontend: React / Next.js (App Router) או React SPA.

הקוד ייכתב ב-JavaScript (JS) מלא (ללא שימוש ב-TypeScript / TS).

שימוש ב-Tailwind CSS לצורך עיצוב מהיר, רספונסיבי ונקי.

Backend (Node.js & MongoDB):

שרת API מהיר, מודולרי ומאובטח מבוסס Node.js (שימוש ב-Express.js).

חיבור וניהול מסד הנתונים הלא-רלציוני (NoSQL) MongoDB באמצעות ספריית Mongoose הפופולרית.

Authentication & Authorization (JWT):

אימות משתמשים מאובטח באמצעות JWT (JSON Web Tokens) באמצעות ספריית jsonwebtoken.

לאחר התחברות מוצלחת, השרת ינפיק Token ייחודי שיכיל את מזהה המשתמש ותפקידו (User ID, Role).

ה-Token יישמר בצד הלקוח בצורה מאובטחת (מומלץ ב-HttpOnly Cookie כדי למנוע התקפות XSS) ויישלח בכל בקשת API המצריכה הרשאה.

הצפנת סיסמאות משתמשים לפני שמירתן בבסיס הנתונים באמצעות ספריית bcryptjs.

Database Schemas (MongoDB Collections):

Users Collection (users):

_id (ObjectId)

name (String, Required)

email (String, Required, Unique, lowercase)

passwordHash (String, Required)

createdAt (Date, default: Date.now)

Products Collection (products):

_id (ObjectId)

name (String, Required)

description (String)

price (Number, Required)

category (String, Required - values: 'plates', 'glasses', 'cutlery', 'tablecloths')

imageUrl (String)

stockQuantity (Number, default: 0)

Orders Collection (orders):

_id (ObjectId)

userId (ObjectId, ref: 'User')

items (Array of objects: { productId, quantity, price })

totalAmount (Number)

status (String, default: 'pending')

createdAt (Date, default: Date.now)