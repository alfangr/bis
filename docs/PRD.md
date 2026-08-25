# Prompt Detail: Sistem Informasi Bis (bis.informakita.my.id)

## 📋 PROJECT OVERVIEW

**Project Name:** Bis Information Platform
**Domain:** bis.informakita.my.id
**Tech Stack:** Next.js 14+ (App Router) + TypeScript + Tailwind CSS + JSON
**Type:** Frontend Only (Static Generation)
**Purpose:** MVP untuk informasi jadwal bis dan harga antar kota

---

## 🎯 FEATURES (Phase 1)

### Core Features:
1. **Search Functionality**
   - Input: Kota Asal, Kota Tujuan, Tanggal Berangkat
   - Output: Daftar bis yang sesuai dengan harga & jadwal

2. **Bus List Display**
   - Tampilkan semua bis hasil pencarian
   - Info: PO Name, Jadwal berangkat, Jadwal tiba, Harga, Kursi tersedia
   - Sorting: By price (low-high), By departure time
   - Filtering: By price range, By departure time range

3. **Route Information**
   - Tampilkan populer routes dengan link quick access
   - Harga dan waktu tempuh

4. **Hero Section**
   - Search form prominently placed
   - Tagline & CTA buttons

5. **Information Sections**
   - Why choose us (3-4 points)
   - Stats (X cities, Y buses, Z routes)
   - FAQ atau simple info

---

## 📁 PROJECT STRUCTURE

```
bis-platform/
├── public/
│   ├── logo.svg                    # Informakita logo
│   ├── images/
│   │   ├── hero-bis.jpg
│   │   └── hero-banner.jpg
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (navbar, footer)
│   │   ├── page.tsx                # Homepage (landing)
│   │   ├── globals.css             # Global styles
│   │   └── not-found.tsx           # 404 page
│   │
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── SearchForm.tsx          # Search form component
│   │   ├── BusCard.tsx             # Individual bus card
│   │   ├── BusList.tsx             # Bus list display
│   │   ├── RouteCard.tsx           # Popular route card
│   │   ├── FilterSidebar.tsx       # Filter options
│   │   └── LoadingSpinner.tsx
│   │
│   ├── data/
│   │   ├── buses.json              # Bus data (PO, jadwal, harga)
│   │   ├── routes.json             # Popular routes
│   │   └── cities.json             # List of cities
│   │
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   │
│   ├── utils/
│   │   ├── searchBuses.ts          # Search logic
│   │   ├── filterBuses.ts          # Filter logic
│   │   └── formatters.ts           # Format date, price, time
│   │
│   └── lib/
│       └── constants.ts            # Constants (colors, text, etc)
│
├── .env.local                      # Environment variables (jika ada)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.js
```

---

## 🗂️ DATA MODELS (JSON Structure)

### **buses.json** (Data Bis)
```json
{
  "buses": [
    {
      "id": "BIS001",
      "poName": "Bis Jaya Indah",
      "poPhone": "0812-3456-7890",
      "class": "Executive",
      "from": "Malang",
      "to": "Bojonegoro",
      "departure": "08:00",
      "arrival": "12:00",
      "duration": "4 jam",
      "price": 150000,
      "seats": {
        "available": 20,
        "total": 45
      },
      "amenities": ["AC", "WiFi", "Kursi Reclining"],
      "stops": ["Kediri", "Nganjuk"]
    },
    {
      "id": "BIS002",
      "poName": "Bis Maju Jaya",
      "poPhone": "0813-1234-5678",
      "class": "Standar",
      "from": "Malang",
      "to": "Bojonegoro",
      "departure": "10:30",
      "arrival": "14:30",
      "duration": "4 jam",
      "price": 120000,
      "seats": {
        "available": 35,
        "total": 50
      },
      "amenities": ["AC", "Kursi Standard"],
      "stops": ["Kertosono"]
    }
    // ... more buses
  ]
}
```

### **routes.json** (Popular Routes)
```json
{
  "routes": [
    {
      "id": "ROUTE001",
      "from": "Malang",
      "to": "Bojonegoro",
      "minPrice": 120000,
      "maxPrice": 180000,
      "busCount": 8,
      "description": "Rute populer dengan beberapa pilihan bus setiap hari"
    },
    {
      "id": "ROUTE002",
      "from": "Surabaya",
      "to": "Malang",
      "minPrice": 100000,
      "maxPrice": 150000,
      "busCount": 12,
      "description": "Rute dekat, banyak pilihan"
    }
    // ... more routes
  ]
}
```

### **cities.json** (List Kota)
```json
{
  "cities": [
    {"id": "CITY001", "name": "Malang", "province": "Jawa Timur"},
    {"id": "CITY002", "name": "Bojonegoro", "province": "Jawa Timur"},
    {"id": "CITY003", "name": "Surabaya", "province": "Jawa Timur"},
    {"id": "CITY004", "name": "Kediri", "province": "Jawa Timur"},
    {"id": "CITY005", "name": "Yogyakarta", "province": "DI Yogyakarta"},
    {"id": "CITY006", "name": "Jakarta", "province": "DKI Jakarta"},
    {"id": "CITY007", "name": "Bandung", "province": "Jawa Barat"}
  ]
}
```

---

## 🎨 UI/UX REQUIREMENTS

### **Navbar**
- Logo Informakita (kecil)
- Text "Bis" / Branding
- Simple nav links (Home, About, Contact)
- Responsive mobile menu

### **Hero Section**
```
┌─────────────────────────────────────┐
│    Cari Bis Mudah & Terpercaya      │
│                                     │
│  [Dari ▼] [Ke ▼] [Tgl] [CARI]       │
│                                     │
│  Atau pilih rute populer ↓          │
└─────────────────────────────────────┘
```

### **Popular Routes Section**
- 3-4 cards dengan: From → To, Min-Max Price, Bus Count
- Clickable untuk search otomatis

### **Search Results**
- Filter sidebar (kiri): Price Range, Departure Time
- Bus list (kanan): 
  - BusCard component per bus
  - Show: PO Name, Class, Departure-Arrival, Price, Seats Available
  - Sort options (price asc/desc, time asc/desc)
  - Pagination (optional untuk MVP)

### **Bus Card**
```
┌──────────────────────────────┐
│ Bis Jaya Indah   Executive   │
│                              │
│ 08:00 ────────→ 12:00       │
│ Malang           Bojonegoro  │
│ 4 jam perjalanan            │
│                              │
│ Rp 150.000    Kursi: 20/45  │
│                              │
│ AC • WiFi • Reclining       │
│                              │
│        [PESAN SEKARANG]      │
└──────────────────────────────┘
```
(Click PESAN SEKARANG bisa buka detail atau future booking page)

### **Footer**
- Copyright Informakita
- Links: Privacy, Terms, Contact
- Social media icons (optional)

---

## 🎯 COMPONENT DETAILS

### **SearchForm.tsx**
```typescript
Props:
- onSearch(from: string, to: string, date: string): void
- cities: City[]

State:
- selectedFrom: string
- selectedTo: string
- selectedDate: string

Features:
- Autocomplete atau dropdown untuk cities
- Date input (tidak boleh tanggal lampau)
- Swap button (dari ↔ ke)
- Clear button
- Validation sebelum search
```

### **BusList.tsx**
```typescript
Props:
- buses: Bus[]
- isLoading: boolean

State:
- sortBy: 'price' | 'time' | 'seats'
- filterPriceMin: number
- filterPriceMax: number
- filterTimeFrom: string
- filterTimeTo: string

Features:
- Filter sidebar
- Sort dropdown
- Display hasil filtered/sorted
- No results message
```

### **BusCard.tsx**
```typescript
Props:
- bus: Bus

Display:
- PO Name + Class badge
- Departure & Arrival time
- Cities (from & to)
- Duration
- Price (formatted Rp)
- Seats available
- Amenities tags
- CTA button (untuk future booking)
```

---

## 🔧 TECHNICAL REQUIREMENTS

### **Next.js Setup**
- App Router (not pages directory)
- TypeScript strict mode
- Static generation (SSG) recommended
- Image optimization with next/image

### **Styling**
- Tailwind CSS untuk utility styles
- Custom CSS module untuk component-specific styles (optional)
- Mobile-first responsive design
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

### **Performance**
- Code splitting (automatic dengan Next.js)
- Image optimization (next/image)
- Lazy loading untuk components di below fold
- JSON data loading di build time (ideal)

### **TypeScript Interfaces (types/index.ts)**
```typescript
interface Bus {
  id: string;
  poName: string;
  poPhone: string;
  class: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  seats: {
    available: number;
    total: number;
  };
  amenities: string[];
  stops?: string[];
}

interface Route {
  id: string;
  from: string;
  to: string;
  minPrice: number;
  maxPrice: number;
  busCount: number;
  description: string;
}

interface City {
  id: string;
  name: string;
  province: string;
}

interface SearchParams {
  from: string;
  to: string;
  date: string;
}
```

---

## 🎨 BRAND & STYLING

### **Color Palette**
- Primary Blue: `#1E5AA8`
- Accent Green: `#10B981`
- Neutral Gray: `#6B7280`
- Light Gray: `#F3F4F6`
- White: `#FFFFFF`
- Red (untuk alert): `#EF4444`

### **Typography**
- Heading (H1-H3): Poppins Bold / Semi-bold
- Body Text: Inter Regular
- Small Text: Inter 14px

### **Spacing**
- Base unit: 4px
- Use Tailwind spacing (4, 8, 12, 16, 20, 24, 32, etc)

### **Border Radius**
- Buttons: 8px
- Cards: 12px
- Input: 8px

---

## 📝 PAGE ROUTES

```
/                    → Landing page (hero + popular routes)
/search              → Search results (with query params)
/search?from=X&to=Y&date=Z → Auto-populated hasil search
/about               → About Informakita (optional untuk MVP)
/contact             → Contact page (simple form atau info)
```

### **Query Parameters**
```
/search?from=Malang&to=Bojonegoro&date=2024-12-25
```

---

## 🚀 DEPLOYMENT

### **Hosting: Vercel** (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod

# Or connect GitHub:
# 1. Push to GitHub
# 2. Connect di vercel.com
# 3. Auto deploy setiap push
```

### **Domain Setup (bis.informakita.my.id)**
```
Di Vercel Project Settings:
1. Go to Domains
2. Add Custom Domain: bis.informakita.my.id
3. Update DNS di registrar:
   - Add CNAME: bis → cname.vercel-dns.com
   - Or update A record (follow Vercel instructions)
4. Wait 5-30 min untuk propagasi
```

### **Environment Variables (.env.local)**
```
NEXT_PUBLIC_SITE_URL=https://bis.informakita.my.id
NEXT_PUBLIC_BRAND_NAME=Informakita
```

---

## 📦 DEPENDENCIES

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "tailwindcss": "^3.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0",
    "@tailwindcss/forms": "^0.5.0"
  }
}
```

---

## 🛠️ DEVELOPMENT WORKFLOW

### **Setup:**
```bash
npx create-next-app@latest bis-platform --typescript --tailwind
cd bis-platform
npm install
```

### **Development:**
```bash
npm run dev
# Akses: http://localhost:3000
```

### **Build & Test:**
```bash
npm run build
npm run start
```

### **Deployment:**
```bash
git push (to GitHub)
# Vercel auto-deploys
```

---

## ✅ ACCEPTANCE CRITERIA (MVP)

- [ ] Landing page dengan hero section + search form
- [ ] Search functionality (filter bis berdasarkan from, to, date)
- [ ] Display hasil search dengan bus cards
- [ ] Filter sidebar (price, time)
- [ ] Sort options (price, time)
- [ ] Popular routes section dengan quick links
- [ ] Mobile responsive (teruji di mobile)
- [ ] Performance: LCP < 2.5s, FID < 100ms
- [ ] No console errors
- [ ] Basic SEO (meta tags, structured data optional)
- [ ] Deploy ke bis.informakita.my.id
- [ ] JSON data mudah di-update (tanpa rebuild)

---

## 📝 NOTES

1. **Data Management:**
   - Update buses.json, routes.json, cities.json untuk refresh data
   - Tidak perlu rebuild Next.js (static generation akan updated)
   - Optional: Setup webhook untuk auto-rebuild jika data berubah

2. **Future Phase 2:**
   - Add backend API (NestJS/Express)
   - Real-time seat availability
   - User login & booking
   - Payment integration
   - Email notifications

3. **SEO Considerations:**
   - Dynamic page titles berdasarkan search (from-to-date)
   - Meta descriptions
   - Structured data (Organization, LocalBusiness schema)
   - Sitemap.xml

4. **Analytics (Optional):**
   - Google Analytics 4
   - Track search queries
   - Track popular routes

---

## 📞 SUPPORT & UPDATES

**Data Update Process:**
1. Edit buses.json / routes.json
2. Commit & push
3. Vercel auto-redeploys (~2 min)
4. Data live di bis.informakita.my.id

**Future Questions:**
- Integration dengan backend bis PO?
- Real-time seat availability?
- Booking & payment system?
- Mobile app (React Native)?

---

**Status:** Ready for Development ✅
**Last Updated:** 2024
**Version:** MVP 1.0
