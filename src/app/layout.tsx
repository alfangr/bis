import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BRAND_NAME, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND_NAME} Bis — Informasi Jadwal & Harga Tiket Bis Antar Kota`,
    template: `%s | ${BRAND_NAME} Bis`,
  },
  description:
    'Info jadwal dan harga tiket bis antar kota di Indonesia. Cari rute, jam berangkat, dan kelas bis (Ekonomi & Patas) dengan mudah.',
  keywords: ['bis', 'tiket bis', 'jadwal bis', 'antar kota', 'PO bis', 'informakita'],
  authors: [{ name: BRAND_NAME }],
  openGraph: {
    title: `${BRAND_NAME} Bis — Informasi Jadwal & Harga Tiket Bis Antar Kota`,
    description:
      'Info jadwal dan harga tiket bis antar kota di Indonesia. Cari rute, jam berangkat, dan kelas bis (Ekonomi & Patas) dengan mudah.',
    url: SITE_URL,
    siteName: `${BRAND_NAME} Bis`,
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND_NAME} Bis — Informasi Jadwal & Harga Tiket Bis Antar Kota`,
    description:
      'Platform informasi jadwal dan harga tiket bis antar kota terlengkap.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
