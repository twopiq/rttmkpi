# RTTM KPI

Toshkent To'qimachilik va yengil sanoat instituti KPI monitoring tizimi. Hestia panelda Node.js ishlatilmagani uchun loyiha statik frontend sifatida `.output/public/` papkaga build qilinadi.

## Talablar

- Build qilish uchun Node.js 24 yoki undan yuqori
- Lokal ishlatish uchun yonidagi `surovnoma_sayt/database/database.sqlite` bazasi
- Production deploy uchun ishlayotgan tashqi backend API

## Muhit Sozlamalari

Lokal ishlatishda `.env.example` faylidan `.env` yarating:

```bash
copy .env.example .env
```

Lokal uchun `NUXT_PUBLIC_API_BASE_URL` bo'sh qolishi kerak. Shunda frontend shu Nuxt dev server ichidagi `/api/...` endpointlarga murojaat qiladi:

```bash
NUXT_PUBLIC_API_BASE_URL=
NUXT_PUBLIC_APP_NAME=KPI tizimi
SURVEY_SQLITE_PATH=../surovnoma_sayt/database/database.sqlite
KPI_SESSION_SECRET=local-kpi-session-secret
```

Production build qilishda `NUXT_PUBLIC_API_BASE_URL` login va KPI endpointlari joylashgan backend domeni bo'lishi kerak. Masalan, frontend `https://kpi.example.uz` bo'lsa, API `https://api.example.uz` yoki shu domen ichidagi `/api` bo'lishi mumkin.

Backend quyidagi endpointlarni berishi kerak:

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/kpi/dashboard`

Agar API boshqa domenda bo'lsa, CORS `credentials` bilan ishlaydigan qilib sozlanadi.

## Build

```bash
npm install
npm run build
```

Builddan keyin statik fayllar `.output/public/` papkada bo'ladi.

## Hestia Deploy

`.output/public/` ichidagi fayllarni domenning `public_html` papkasiga joylang.

API manzilini serverda `public_html/config.js` orqali berish mumkin:

```js
window.__KPI_API_BASE_URL__ = 'https://api.example.com';
```

Bo'sh qoldirilsa frontend shu domenning o'zidagi `/api/...` endpointlarga murojaat qiladi.

Muhim: bu statik frontend. Hestia Node.js serverni ishga tushirmaydi, shuning uchun Nuxt `server/api` endpointlari deployda ishlamaydi. API Laravel/PHP yoki boshqa alohida backendda ishlashi kerak.

SPA route uchun Hestia/nginx Apache fallback kerak bo'lishi mumkin: barcha route so'rovlari `index.html`ga qaytishi kerak.

## Local Preview

Lokal development rejimi:

```bash
npm install
npm run dev
```

Keyin brauzerda oching:

```bash
http://localhost:3000
```

`npm run preview` faqat builddan keyingi statik fayllarni ko'rish uchun. Statik previewda Nuxt `server/api` endpointlari ishlamaydi, shuning uchun u rejimda API uchun `NUXT_PUBLIC_API_BASE_URL` yoki `public/config.js` orqali tashqi backend ko'rsatilishi kerak.

```bash
npm run preview
```
