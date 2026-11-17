import { test, expect } from '@playwright/test';
import { mockApi } from './support/mock-api';

/**
 * Test dasar (disebut juga "smoke test"): memastikan halaman utama tampil
 * dengan benar dan elemen-elemen penting ada.
 */
test.describe('Halaman utama', () => {
  test.beforeEach(async ({ page }) => {
    // Ganti API dengan data palsu, lalu buka halaman utama.
    await mockApi(page);
    await page.goto('/');
  });

  test('menampilkan judul halaman dan hero section', async ({ page }) => {
    await expect(page).toHaveTitle(/Informasi Jadwal/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Cari Jadwal Bis Antar Kota di Indonesia'
    );
    // `exact: true` penting: tanpa itu, h1 di atas juga ikut cocok.
    await expect(
      page.getByRole('heading', { name: 'Cari Jadwal Bis', exact: true })
    ).toBeVisible();
  });

  test('menampilkan form pencarian dan state awal', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Cari Bis' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Swap kota' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Belum ada pencarian' })
    ).toBeVisible();
  });

  test('menampilkan error bila kota belum dipilih', async ({ page }) => {
    // Klik "Cari Bis" tanpa memilih kota -> harus muncul pesan validasi.
    await page.getByRole('button', { name: 'Cari Bis' }).click();
    // Dibatasi ke dalam form, karena Next.js juga punya elemen role="alert"
    // (route announcer) di halaman ini.
    await expect(page.locator('form#cari').getByRole('alert')).toContainText(
      'Pilih kota asal dan kota tujuan terlebih dahulu.'
    );
  });
});
