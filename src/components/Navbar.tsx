'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Bus, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BRAND_NAME } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="container">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Bus className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-heading font-bold text-lg text-primary">
                {BRAND_NAME}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Tiket Bis Online
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="default" asChild>
              <a href="#cari" className="gap-2">
                <Search className="h-4 w-4" />
                Cari Bis
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin" className="gap-2">
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {isOpen && (
          <>
            <Separator className="md:hidden" />
            <div className="md:hidden pb-4 space-y-1 pt-3">
              <Button
                variant="default"
                className="w-full justify-start"
                onClick={() => setIsOpen(false)}
                asChild
              >
                <a href="#cari" className="gap-2">
                  <Search className="h-4 w-4" />
                  Cari Bis
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link href="/admin" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Dashboard Admin
                </Link>
              </Button>
            </div>
          </>
        )}
      </nav>
    </header>
  );
};
