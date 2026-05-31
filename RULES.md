# Loyiha qoidalari (rttmkpi.ttysi.uz)

Har qanday AI yordamchi (Claude, Codex va h.k.) bu loyihada ish boshlashdan oldin shu faylni o'qib chiqsin va quyidagi qoidalarga **so'zsiz** amal qilsin. Foydalanuvchi har bir suhbatda qoidalarni qaytadan tushuntirib o'tirmaydi — shu fayl yagona manba.

---

## 1. Loyiha haqida

- **Stack:** Nuxt 4 + Vue 3 + Pinia (static site, `nuxt generate`)
- **Production:** `rttmkpi.ttysi.uz`
- **API manba:** `surovnoma.ttysi.uz` — ma'lumotlar shu saytdan API orqali keladi
- **Deploy:** `nuxt generate` → `.output/public` papkasi deploy qilinadi

Ish boshlashdan oldin o'qib chiqilsin:
- [nuxt.config.ts](nuxt.config.ts)
- [package.json](package.json)
- [.env.example](.env.example)
- [app/utils/api.ts](app/utils/api.ts)
- [app/stores/](app/stores/) — barcha Pinia store'lar
- [app/pages/](app/pages/) — mavjud sahifalar

---

## 2. UI o'zgartirishlari — avval variant so'ra

UI (Vue komponenti, sahifa layout'i, rang, joylashuv, forma maydonlari, tugma matni) o'zgartirilishidan oldin:

- **Avval 2–3 variant taklif qil** (ASCII mockup yoki qisqa tavsif bilan).
- Foydalanuvchi tasdiqlamaguncha **kod yozma**.
- Agar o'zgarish juda kichik bo'lsa ham (masalan, tugma nomi), avval so'ra.
- Mavjud dizayn tilini buzma — yangi rang/shrift kiritishdan oldin ogohlantir.

---

## 3. Kelajakda muammo tug'dirishi mumkin bo'lgan ishlar — avval ogohlantir

Quyidagi turdagi o'zgartirishlardan **oldin** foydalanuvchini ogohlantir, sababini tushuntir, va **aniq tasdiq olgandan keyingina** davom et:

- `npm` paketini olib tashlash yoki katta versiyali yangilash (major upgrade).
- Production ga ta'sir qiluvchi `.env` o'zgartirishlari.
- Saytda sekinlashishga olib kelishi mumkin bo'lgan har qanday narsa (sinxron tashqi so'rov, og'ir hisob-kitob, va h.k.).
- API endpoint yoki so'rov strukturasini o'zgartirish — mavjud komponentlar uzilib qolishi mumkin.
- `nuxt generate` outputiga ta'sir qiluvchi config o'zgarishlari.

Ogohlantirish formati: **"Bu ish X muammoga olib kelishi mumkin, sababi Y. Davom etaymi?"**

---

## 4. `.env` va config — muhitga bog'liq qiymatlar

- **Mutlaqo hardcode qilmang** muhitga bog'liq qiymatlarni (API URL, domen, port). Hammasi `.env` orqali kelsin va `nuxt.config.ts` da `runtimeConfig` orqali o'qilsin.
- Komponent ichida `process.env.*` chaqirmang — faqat `useRuntimeConfig()` orqali.
- `APP_URL` ga tayangan URL'lar `runtimeConfig` orqali qurilsin.
- Yangi env o'zgaruvchisi kerak bo'lsa — **`.env.example` ga ham qo'shib qo'y**.

---

## 5. Ko'p qismli vazifalar — avval savol, keyin amalga oshir

Foydalanuvchi bir nechta savollar bersa yoki murakkab o'zgarish so'rasa:

1. **Avval har bir savolga javob ber** — taxmin qilma, aniq yoz.
2. **Noaniq punktlarni aniqlashtir** — har bir qaror uchun foydalanuvchidan tasdiqlash ol.
3. **Faqat barcha punktlar kelishilgandan keyin** kodga o'tish boshlang.
4. Kelishilgan punktlarni bir jarayonda amalga oshir — bo'lib-bo'lib emas.

Maqsad: foydalanuvchi har bir qarorni anglab tasdiqlaydi, AI esa faqat bir marta, to'liq implement qiladi.

---

## Qo'shimcha umumiy qoidalar

- Kod yozishdan oldin tegishli faylni **o'qib chiq**, taxmin qilma.
- Ortiqcha abstraksiya, ishlatilmaydigan helper, "kelajak uchun" parametrlar qo'shma.
- Ortiqcha izoh (comment) yozma — kod o'zi tushunarli bo'lsin. Faqat **nega** shunday qilingani noaniq bo'lsa, qisqa izoh qoldir.
- Test yozish so'ralmagan bo'lsa, test yozma.
- Git commit / push **faqat foydalanuvchi aniq so'raganda** qilinsin.
- Javoblar qisqa va aniq bo'lsin, ortiqcha "summary" yozma.
