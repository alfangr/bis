import type { Page } from '@playwright/test';

/**
 * Data contoh + helper untuk "memalsukan" (mock) API.
 *
 * Kenapa perlu mock?
 * Aplikasi ini membaca data dari database Turso lewat endpoint /api/cities dan
 * /api/schedules. Saat menjalankan test kita tidak mau bergantung pada database
 * asli (harus punya kredensial, data bisa berubah, dll). Dengan `page.route(...)`
 * kita membelokkan (intercept) request tersebut dan menggantinya dengan data
 * palsu di bawah ini, sehingga test selalu deterministik.
 */

export interface MockCity {
  id: string;
  name: string;
  province: string;
}

export interface MockSchedule {
  id: string;
  busId: string;
  busClass: 'Ekonomi' | 'Patas';
  poName: string;
  amenities: string[];
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  seats: { available: number; total: number };
  stops?: { city: string; time?: string; price: number }[];
}

export const SAMPLE_CITIES: MockCity[] = [
  { id: 'CITY001', name: 'Malang', province: 'Jawa Timur' },
  { id: 'CITY002', name: 'Bojonegoro', province: 'Jawa Timur' },
  { id: 'CITY003', name: 'Surabaya', province: 'Jawa Timur' },
  { id: 'CITY004', name: 'Jakarta', province: 'DKI Jakarta' },
  { id: 'CITY005', name: 'Bandung', province: 'Jawa Barat' },
];

export const SAMPLE_SCHEDULES: MockSchedule[] = [
  {
    id: 'JDW001',
    busId: 'BIS001',
    busClass: 'Patas',
    poName: 'Bis Jaya Indah',
    amenities: ['AC', 'WiFi', 'Kursi Reclining'],
    from: 'Malang',
    to: 'Bojonegoro',
    departure: '08:00',
    arrival: '12:00',
    duration: '4 jam',
    price: 150000,
    seats: { available: 20, total: 45 },
    stops: [{ city: 'Kediri', time: '10:00', price: 80000 }],
  },
  {
    id: 'JDW002',
    busId: 'BIS002',
    busClass: 'Ekonomi',
    poName: 'Bis Maju Jaya',
    amenities: ['AC', 'Kursi Standard'],
    from: 'Malang',
    to: 'Bojonegoro',
    departure: '10:30',
    arrival: '14:30',
    duration: '4 jam',
    price: 120000,
    seats: { available: 35, total: 50 },
  },
];

/**
 * Pasang mock untuk /api/cities dan /api/schedules pada halaman tertentu.
 * Panggil SEBELUM `page.goto('/')` agar request pertama sudah ter-intercept.
 */
export const mockApi = async (
  page: Page,
  data: { cities?: MockCity[]; schedules?: MockSchedule[] } = {}
): Promise<void> => {
  const cities = data.cities ?? SAMPLE_CITIES;
  const schedules = data.schedules ?? SAMPLE_SCHEDULES;

  await page.route('**/api/cities', (route) => route.fulfill({ json: cities }));
  await page.route('**/api/schedules', (route) => route.fulfill({ json: schedules }));
};
