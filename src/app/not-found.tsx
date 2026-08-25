'use client';

import { BRAND_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Bus } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="relative mx-auto mb-6">
          <div className="font-heading select-none text-7xl font-extrabold text-primary/10 sm:text-8xl">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-lg">
              <Bus className="h-8 w-8" />
            </div>
          </div>
        </div>
        <h1 className="mb-3 font-heading text-2xl font-extrabold text-card-foreground sm:text-3xl">
          Halaman Tidak Ditemukan
        </h1>
        <p className="mb-8 text-sm text-muted-foreground sm:text-base">
          Halaman yang kamu cari tidak tersedia. Kembali ke halaman utama untuk cari jadwal bis
          antar kota.
        </p>
        <Button asChild size="lg" className="gap-2">
          <a href="/">
            <Home className="h-5 w-5" />
            Kembali ke Home
          </a>
        </Button>
        <Badge variant="outline" className="mt-10 text-muted-foreground">
          bis.informakita.my.id · {BRAND_NAME} Tiket Bis Online
        </Badge>
      </div>
    </div>
  );
}
