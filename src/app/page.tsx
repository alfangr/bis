'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SearchForm } from '@/components/SearchForm';
import { BusList } from '@/components/BusList';
import { City, Bus } from '@/types';
import { searchBuses } from '@/utils/searchBuses';
import { formatDateLong } from '@/utils/formatters';
import { BRAND_NAME } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search as SearchIcon,
  ArrowLeft,
  X,
  ArrowRightLeft,
  Bus as BusIcon,
  MapPin,
  Loader2,
} from 'lucide-react';

const HERO_IMAGE =
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=modern+tourist+bus+on+the+road+in+east+java+indonesia+with+mountains+green+rice+fields%2C+sunny+day%2C+realistic+photography&image_size=landscape_16_9';

type SearchResult = {
  from: string;
  to: string;
  date: string;
  buses: Bus[];
} | null;

export default function HomePage() {
  const [cities, setCities] = useState<City[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [result, setResult] = useState<SearchResult>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [citiesRes, busesRes] = await Promise.all([
          fetch('/api/cities').then((r) => r.json()),
          fetch('/api/schedules').then((r) => r.json()),
        ]);
        setCities(citiesRes);
        setBuses(busesRes);
      } catch {
        setLoadError('Gagal memuat data. Silakan muat ulang halaman.');
      } finally {
        setIsLoading(false);
      }
    };
    void loadData();
  }, []);

  const handleSearch = useCallback(
    (from: string, to: string, date: string) => {
      const foundBuses = searchBuses(buses, { from, to, date });
      setResult({ from, to, date, buses: foundBuses });
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    },
    [buses]
  );

  return (
    <div className="flex flex-col">
      {loadError && (
        <div className="mx-auto mt-4 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        </div>
      )}
      {isLoading && !loadError && (
        <div className="mx-auto mt-4 flex w-full max-w-7xl items-center gap-2 px-4 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat data...
        </div>
      )}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-muted/30">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">
          <div className="mb-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <Badge variant="secondary" className="mb-4 gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                Tiket Bis Antar Kota
              </Badge>
              <h1 className="mb-4 font-heading text-3xl font-extrabold leading-[1.1] text-card-foreground sm:text-4xl lg:text-5xl">
                Cari Tiket Bis <span className="text-primary">Antar Kota</span>
                <br />
                Mudah & Terpercaya
              </h1>
              <p className="mb-6 max-w-lg text-base text-muted-foreground">
                Bandingkan jadwal dan harga bis dari berbagai PO di berbagai kota. Dari
                Malang, Surabaya, Bojonegoro, Jember, sampai Banyuwangi.
              </p>
              <div className="flex flex-wrap gap-3 text-xs">
                {cities.slice(0, 6).map((c) => (
                  <Badge
                    key={c.id}
                    variant="outline"
                    className="gap-1 font-medium text-muted-foreground"
                  >
                    <MapPin className="h-3 w-3" />
                    {c.name}
                  </Badge>
                ))}
                <Badge variant="outline" className="font-medium text-muted-foreground">
                  +{cities.length - 6} kota lainnya
                </Badge>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-white shadow-2xl">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${HERO_IMAGE})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent" />
                <Card className="absolute bottom-4 left-4 right-4 border-0 bg-white/95 shadow-lg backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          Kota Tersedia
                        </p>
                        <p className="flex items-center gap-1 font-bold text-card-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          {cities.length} Kota
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          Total Bis
                        </p>
                        <p className="flex items-center justify-end gap-1 font-bold text-primary">
                          <BusIcon className="h-4 w-4" />
                          {cities.length * 2}+ Jadwal
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <SearchForm cities={cities} onSearch={handleSearch} />
        </div>
      </section>

      <section ref={resultsRef} className="bg-muted/30 py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {!result ? (
            <Card className="p-6 sm:p-10">
              <CardContent className="p-0 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <ArrowRightLeft className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 font-heading text-xl font-bold text-card-foreground">
                  Mulai Cari Jadwal Bis
                </h3>
                <p className="mx-auto max-w-md text-sm text-muted-foreground">
                  Pilih kota asal dan tujuan di form di atas untuk melihat daftar jadwal bis
                  yang tersedia.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-6 p-0 text-muted-foreground hover:text-primary"
                    >
                      <a href="#cari" className="gap-1">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Ubah pencarian
                      </a>
                    </Button>
                  </div>
                  <h2 className="font-heading text-2xl font-extrabold text-card-foreground sm:text-3xl">
                    {result.from} <span className="text-primary mx-2">→</span> {result.to}
                  </h2>
                  <p className="text-sm font-medium text-muted-foreground">
                    {formatDateLong(result.date)} ·{' '}
                    <span
                      className={
                        result.buses.length > 0 ? 'text-accent-700' : 'text-destructive'
                      }
                    >
                      {result.buses.length} bis ditemukan
                    </span>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResult(null)}
                  className="self-start gap-2 text-sm sm:self-auto"
                >
                  <X className="h-4 w-4" />
                  Clear hasil
                </Button>
              </div>

              <BusList buses={result.buses} />
            </div>
          )}
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-8 text-white sm:p-10">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <h2 className="mb-2 font-heading text-2xl font-bold sm:text-3xl">
                  Butuh Bantuan?
                </h2>
                <p className="max-w-lg text-sm text-white/80 sm:text-base">
                  Klik tombol <strong>Pesan Sekarang</strong> di daftar bis untuk langsung
                  chat WhatsApp ke PO bis terkait. Semua pemesanan langsung ke PO tanpa
                  perantara.
                </p>
              </div>
              <div className="flex items-center md:justify-end">
                <Button asChild size="lg" variant="secondary" className="gap-2">
                  <a href="#cari">
                    <SearchIcon className="h-5 w-5 text-primary" />
                    Cari Bis Sekarang
                  </a>
                </Button>
              </div>
            </div>
            <Separator className="my-6 border-white/20" />
            <div className="text-xs text-white/70">
              © {new Date().getFullYear()} {BRAND_NAME}. Data jadwal bis dapat berubah
              sewaktu-waktu.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
