# PROCVETANJE · Vodič za instalaciju
## Rada Vučićević · Kundalini joga i meditacija

---

## Šta ćemo uraditi
1. Napraviti bazu podataka na Supabase (besplatno)
2. Postaviti aplikaciju na Vercel (besplatno)
3. Dobiti link koji šalješ u Telegram grupu

Ukupno vreme: oko 30–45 minuta, korak po korak.

---

## KORAK 1 · GitHub (čuvanje koda)

1. Idi na https://github.com i napravi nalog (ako nemaš)
2. Klikni zeleno dugme **"New"** (gore levo)
3. Naziv repozitorijuma: `procvetanje`
4. Ostavi sve default, klikni **"Create repository"**
5. Prebaci sve fajlove iz `procvetanje/` foldera u taj repozitorijum
   - Najlakše: klikni **"uploading an existing file"** i prevuci ceo folder

---

## KORAK 2 · Supabase (baza podataka)

1. Idi na https://supabase.com → klikni **"Start your project"**
2. Prijavi se (može Google nalog)
3. Klikni **"New project"**
   - Organization: tvoje ime
   - Name: `procvetanje`
   - Database Password: izmisli i **zapiši negde!**
   - Region: **EU (Frankfurt)**
4. Sačekaj ~2 minute dok se projekat kreira
5. Idi na **SQL Editor** (ikonica u levom meniju)
6. Otvori fajl `supabase_schema.sql` iz ovog foldera
7. Kopiraj ceo sadržaj i nalepi u SQL Editor
8. Klikni **"Run"** — trebalo bi da piše "Success"

### Uzmi API ključeve:
- Idi na **Settings → API** (u levom meniju)
- Kopiraj **Project URL** (izgleda kao `https://abcdef.supabase.co`)
- Kopiraj **anon public** ključ (dugi string)
- **ZAPIŠI OBA — trebaće ti u koraku 4**

---

## KORAK 3 · Vercel (hosting)

1. Idi na https://vercel.com → klikni **"Sign Up"**
2. Prijavi se sa **GitHub nalogom** (važno — poveži GitHub)
3. Klikni **"Add New → Project"**
4. Pronađi `procvetanje` repozitorijum i klikni **"Import"**
5. Framework Preset: izaberi **"Create React App"**
6. Klikni **"Deploy"** — sačekaj 2–3 minute

---

## KORAK 4 · Environment Variables (tajni ključevi)

Nakon deploy-a:
1. U Vercel-u idi na tvoj projekat → **Settings → Environment Variables**
2. Dodaj ova tri:

| Name | Value |
|------|-------|
| `REACT_APP_SUPABASE_URL` | URL iz Supabase (korak 2) |
| `REACT_APP_SUPABASE_ANON_KEY` | anon key iz Supabase (korak 2) |
| `REACT_APP_ADMIN_PASSWORD` | lozinka po tvom izboru (samo ti znaš) |

3. Klikni **"Save"**
4. Idi na **Deployments → Redeploy** (da primeni promene)

---

## KORAK 5 · Tvoja aplikacija je živa! 🌿

- Vercel ti daje link tipa: `https://procvetanje.vercel.app`
- Taj link šalješ u Telegram grupu
- Svaka učesnica otvori u browseru na telefonu

---

## Kako koristiš kao admin

Kada otvoriš aplikaciju:
1. Klikni tab **"Admin"** u navigaciji
2. Unesi lozinku koju si postavila u REACT_APP_ADMIN_PASSWORD
3. Tu možeš:
   - Pisati **Misao dana** za svaki dan
   - Dodavati **link snimka** za svaki dan
   - Dodavati/brisati/uređivati **tapkanja** (koliko god hoćeš)

---

## Problemi? 

Pošalji screenshot grešci i rešavamo zajedno.
