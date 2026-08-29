import { BRAND_NAME, STATS } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bus, MapPin, Search, ArrowRight } from 'lucide-react';

export const Footer = () => {
  const year = new Date().getFullYear();

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
                  Tiket Bis Online
                </span>
              </div>
            </div>
            <p className="max-w-xs text-sm text-slate-400">
              Informasi jadwal & harga tiket bis antar kota. Cepat, akurat, dan langsung
              terhubung ke PO Bis.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Menu
            </h4>
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="w-fit justify-start px-2 text-slate-300 hover:text-white hover:bg-white/5"
              >
                <a href="#cari" className="gap-2">
                  <Search className="h-4 w-4" />
                  Cari Bis
                </a>
              </Button>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Cakupan
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-1.5 text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="text-lg font-bold text-white">{STATS.cities}</span>
                </div>
                <span className="text-slate-400">Kota</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-1.5 text-primary">
                  <Bus className="h-3.5 w-3.5" />
                  <span className="text-lg font-bold text-white">{STATS.buses}</span>
                </div>
                <span className="text-slate-400">Jadwal</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6 border-white/10" />

        <div className="flex flex-col items-start justify-between gap-3 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© {year} {BRAND_NAME}. All rights reserved.</p>
          <Badge variant="outline" className="border-white/10 text-slate-400 bg-white/5">
            <ArrowRight className="mr-1 h-3 w-3" />
            bis.informakita.my.id
          </Badge>
        </div>
      </div>
    </footer>
  );
};
