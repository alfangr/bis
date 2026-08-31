'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SearchForm } from '@/components/SearchForm';
import { BusList } from '@/components/BusList';
import { City, Bus } from '@/types';
import { searchBuses } from '@/utils/searchBuses';
import { formatDateLong } from '@/utils/formatters';
import { BRAND_NAME } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Bus as BusIcon,
  CalendarClock,
  ArrowLeft,
  X,
  Loader2,
  Info,
} from 'lucide-react';

type SearchResult = {
  from: string;
  to: string;
  date: string;
  buses: Bus[];
} | null;

const STEPS = [
  {
    icon: Search,
    title: '1. Cari rute & tanggal',
    description: 'Pilih kota asal dan kota tujuan, lalu tekan cari.',
  },
  {
    icon: SlidersHorizontal,
    title: '2. Saring & urutkan',
    description: 'Saring dan urutkan hasil berdasarkan harga atau jam berangkat.',
  },
  {
    icon: MapPin,
    title: '3. Datang & naik langsung',
    description: 'Cocok? Datang ke titik keberangkatan sesuai jadwal, tanpa reservasi.',
  },
];

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

  const operatorCount = useMemo(
    () => new Set(buses.map((b) => b.busId)).size,
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

      {/* Section 1: Info — apa website ini dan apa yang bukan */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Info Jadwal Bis Indonesia
            </span>
            <h1 className="mt-5 font-heading text-3xl font-extrabold leading-tight text-card-foreground sm:text-4xl">
              Cari Jadwal Bis Antar Kota di Indonesia
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {BRAND_NAME} menampilkan data jadwal dan harga tiket bis antar kota dari
              berbagai PO di Indonesia. Cukup datang ke titik keberangkatan sesuai
              jadwal dan naik langsung — tanpa reservasi.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="rounded-xl border border-border bg-card p-4 text-center"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading text-sm font-bold text-card-foreground">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {!isLoading && (
            <div className="mx-auto mt-10 flex max-w-md items-stretch justify-center divide-x divide-border rounded-xl border border-border">
              <div className="flex flex-1 flex-col items-center gap-1 px-4 py-3">
                <div className="flex items-center gap-1.5 text-primary">
                  <MapPin className="h-4 w-4" />
                  <span className="font-heading text-lg font-bold text-card-foreground">
                    {cities.length}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">Kota</span>
              </div>
              <div className="flex flex-1 flex-col items-center gap-1 px-4 py-3">
                <div className="flex items-center gap-1.5 text-primary">
                  <BusIcon className="h-4 w-4" />
                  <span className="font-heading text-lg font-bold text-card-foreground">
                    {operatorCount}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">PO Bis</span>
              </div>
              <div className="flex flex-1 flex-col items-center gap-1 px-4 py-3">
                <div className="flex items-center gap-1.5 text-primary">
                  <CalendarClock className="h-4 w-4" />
                  <span className="font-heading text-lg font-bold text-card-foreground">
                    {buses.length}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">Jadwal</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Cari & bandingkan jadwal */}
      <section ref={resultsRef} className="bg-muted/30 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-extrabold text-card-foreground sm:text-3xl">
              Cari Jadwal Bis
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pilih kota asal dan tujuan untuk melihat jadwal, harga, dan kontak PO bis
              yang tersedia hari ini.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <SearchForm cities={cities} onSearch={handleSearch} />
          </div>

          <div className="mt-10">
            {!result ? (
              <Card className="mx-auto max-w-2xl p-6 sm:p-10">
                <CardContent className="p-0 text-center">
                  <h3 className="mb-2 font-heading text-lg font-bold text-card-foreground">
                    Belum ada pencarian
                  </h3>
                  <p className="mx-auto max-w-md text-sm text-muted-foreground">
                    Isi form di atas untuk melihat daftar jadwal bis yang tersedia.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setResult(null)}
                      className="mb-1 h-6 gap-1 p-0 text-xs font-medium text-muted-foreground hover:text-primary"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Ubah pencarian
                    </Button>
                    <h3 className="font-heading text-2xl font-extrabold text-card-foreground sm:text-3xl">
                      {result.from} <span className="mx-2 text-primary">→</span>{' '}
                      {result.to}
                    </h3>
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
        </div>
      </section>
    </div>
  );
}
