import { defineConfig, devices } from '@playwright/test';

/**
 * Konfigurasi Playwright untuk proyek bis-inform.
 * Dokumentasi lengkap: https://playwright.dev/docs/test-configuration
 */

// Port khusus test (3100) supaya tidak bentrok dengan `npm run dev` di port 3000.
const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  // Folder tempat file test (*.spec.ts) disimpan.
  testDir: './e2e',

  // Jalankan semua test secara paralel agar cepat.
  fullyParallel: true,

  // Di CI: gagalkan test bila ada `test.only` yang tidak sengaja ter-commit.
  forbidOnly: !!process.env.CI,

  // Ulangi test yang gagal (lebih banyak di CI karena lingkungan lebih ramai).
  retries: process.env.CI ? 2 : 0,

  // Di CI cukup 1 worker agar stabil.
  workers: process.env.CI ? 1 : undefined,

  // Laporan hasil test: HTML (bisa dibuka manual) + ringkasan di terminal.
  reporter: [['html', { open: 'never' }], ['list']],

  // Pengaturan default untuk semua test.
  use: {
    baseURL: BASE_URL, // Jadi di test cukup `page.goto('/')`.
    trace: 'on-first-retry', // Rekam jejak langkah saat test diulang karena gagal.
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Browser yang diuji. Kita hanya memasang Chromium (paling cepat & ringan).
  // Ingin menambah browser lain? Jalankan dulu:
  //   npx playwright install firefox webkit
  // lalu tambahkan project baru di bawah ini.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Playwright otomatis menyalakan aplikasi Next.js sebelum test berjalan,
  // lalu mematikannya lagi setelah selesai. Tidak perlu `npm run dev` manual.
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
