export const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || 'Informakita';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bis.informakita.my.id';

export const STATS = {
  cities: 10,
  buses: 14,
  operators: 14,
};

export const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Harga: Termurah' },
  { value: 'price-desc', label: 'Harga: Termahal' },
  { value: 'time-asc', label: 'Jam Berangkat: Paling Awal' },
  { value: 'time-desc', label: 'Jam Berangkat: Paling Akhir' },
  { value: 'seats-desc', label: 'Kursi: Tersedia Banyak' },
] as const;

export const WHY_CHOOSE_US = [
  {
    title: 'Harga Terbaik',
    description: 'Dapatkan harga tiket bis paling kompetitif dengan banyak pilihan PO.',
    icon: 'badge',
  },
  {
    title: 'Pilihan Lengkap',
    description: 'Ratusan rute dan puluhan PO bis siap mengantarkan perjalananmu.',
    icon: 'grid',
  },
  {
    title: 'Mudah & Cepat',
    description: 'Cari dan bandingkan bis dalam hitungan detik, tanpa ribet.',
    icon: 'bolt',
  },
  {
    title: 'Terpercaya',
    description: 'Bekerjasama dengan PO bis terkemuka yang terjamin keamanannya.',
    icon: 'shield',
  },
] as const;

export const FAQS = [
  {
    q: 'Apakah harga di website ini termasuk biaya admin?',
    a: 'Ya, semua harga yang ditampilkan sudah termasuk biaya admin dan pajak.',
  },
  {
    q: 'Bagaimana cara memesan tiket?',
    a: 'Untuk saat ini, klik tombol "PESAN SEKARANG" untuk menghubungi PO bis langsung via WhatsApp/telepon.',
  },
  {
    q: 'Apakah jadwal bis selalu update?',
    a: 'Kami berusaha update data secara berkala. Untuk kepastian jadwal, silakan konfirmasi ke PO bis terkait.',
  },
  {
    q: 'Apakah bisa reschedule atau refund?',
    a: 'Kebijakan reschedule/refund tergantung dari masing-masing PO bis. Silakan tanyakan saat konfirmasi pemesanan.',
  },
] as const;
