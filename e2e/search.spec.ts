import { test, expect, type Page } from '@playwright/test';
import { mockApi } from './support/mock-api';

/**
 * Test alur pencarian jadwal bis (end-to-end): pilih kota -> cari -> lihat hasil.
 */

/** Helper: buka dropdown kota ke-`index` (0 = asal, 1 = tujuan) lalu pilih `kota`. */
const pilihKota = async (page: Page, index: number, kota: string) => {
  await page.locator('form#cari').getByRole('combobox').nth(index).click();
  await page.getByRole('option', { name: kota, exact: true }).click();
};

/** Helper: isi rute lalu tekan tombol cari. */
const cariRute = async (page: Page, asal: string, tujuan: string) => {
  await pilihKota(page, 0, asal);
  await pilihKota(page, 1, tujuan);
  await page.getByRole('button', { name: 'Cari Bis' }).click();
};

/**
 * Helper: locator untuk satu kartu bis, dicari lewat nama PO-nya.
 * Dipakai agar pencarian teks di dalam kartu tidak "tertukar" dengan teks
 * serupa di tempat lain (mis. "Rp 150.000" juga muncul di sidebar filter).
 */
const kartuBis = (page: Page, poName: string) =>
  page.locator('div.bg-card').filter({
    has: page.getByRole('heading', { name: poName, exact: true }),
  });

test.describe('Alur pencarian jadwal', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
  });

  test('menampilkan daftar bis yang sesuai dengan rute', async ({ page }) => {
    await cariRute(page, 'Malang', 'Bojonegoro');

    await expect(page.getByText('2 bis ditemukan')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Hasil Pencarian' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Bis Jaya Indah', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Bis Maju Jaya', exact: true })
    ).toBeVisible();
    await expect(kartuBis(page, 'Bis Jaya Indah').getByText('Rp 150.000')).toBeVisible();
    await expect(kartuBis(page, 'Bis Maju Jaya').getByText('Rp 120.000')).toBeVisible();
  });

  test('urut default menampilkan harga termurah lebih dulu', async ({ page }) => {
    await cariRute(page, 'Malang', 'Bojonegoro');

    const termurah = page.getByRole('heading', { name: 'Bis Maju Jaya', exact: true }); // Rp 120.000
    const termahal = page.getByRole('heading', { name: 'Bis Jaya Indah', exact: true }); // Rp 150.000

    await expect(termurah).toBeVisible();
    await expect(termahal).toBeVisible();

    // Bandingkan posisi vertikal: nilai y lebih kecil berarti tampil lebih atas.
    const posisiTermurah = (await termurah.boundingBox())!.y;
    const posisiTermahal = (await termahal.boundingBox())!.y;
    expect(posisiTermurah).toBeLessThan(posisiTermahal);
  });

  test('menampilkan pesan kosong bila rute tidak tersedia', async ({ page }) => {
    await cariRute(page, 'Jakarta', 'Bandung');

    await expect(page.getByText('0 bis ditemukan')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Tidak ada bis yang sesuai' })
    ).toBeVisible();
  });
});
