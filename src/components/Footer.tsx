'use client';

import { useEffect, useState } from 'react';
import { BRAND_NAME } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';
import { Bus, MapPin, CalendarClock, Search, Info } from 'lucide-react';
import type { City, Bus as BusSchedule } from '@/types';

export const Footer = () => {
  const year = new Date().getFullYear();
  const [cityCount, setCityCount] = useState<number | null>(null);
  const [scheduleCount, setScheduleCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/cities')
      .then((r) => r.json())
      .then((data: City[]) => setCityCount(data.length))
      .catch(() => setCityCount(null));
    fetch('/api/schedules')
      .then((r) => r.json())
      .then((data: BusSchedule[]) => setScheduleCount(data.length))
      .catch(() => setScheduleCount(null));
  }, []);

  return (
    <footer className="mt-auto border-t border-border bg-slate-950 text-slate-300">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Bus className="h-5 w-5" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-heading font-bold text-lg text-white">
                  {BRAND_NAME}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500">
                  Info Jadwal Bis
                </span>
              </div>
            </div>
            <p className="flex items-start gap-2 max-w-xs text-sm text-slate-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
              <span>
                Informasi jadwal & harga tiket bis antar kota di Indonesia. Pesan
                tiket langsung ke PO bis terkait.
              </span>
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Menu
            </h4>
            <a
              href="#cari"
              className="flex w-fit items-center gap-2 text-sm text-slate-300 hover:text-white"
            >
              <Search className="h-4 w-4" />
              Cari Bis
            </a>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Cakupan
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-1.5 text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="text-lg font-bold text-white">
                    {cityCount ?? '—'}
                  </span>
                </div>
                <span className="text-slate-400">Kota</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-1.5 text-primary">
                  <CalendarClock className="h-3.5 w-3.5" />
                  <span className="text-lg font-bold text-white">
                    {scheduleCount ?? '—'}
                  </span>
                </div>
                <span className="text-slate-400">Jadwal</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6 border-white/10" />

        <div className="text-xs text-slate-500">
          © {year} {BRAND_NAME}. Data jadwal & harga dapat berubah sewaktu-waktu —
          konfirmasi ke PO bis terkait sebelum berangkat.
        </div>
      </div>
    </footer>
  );
};
