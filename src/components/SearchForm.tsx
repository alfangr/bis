'use client';

import { FormEvent, useMemo, useState } from 'react';
import { City } from '@/types';
import { todayISO } from '@/utils/formatters';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeftRight, Search, AlertCircle } from 'lucide-react';

interface SearchFormProps {
  cities: City[];
  onSearch: (from: string, to: string, date: string) => void;
  initialFrom?: string;
  initialTo?: string;
}

export const SearchForm = ({
  cities,
  onSearch,
  initialFrom = '',
  initialTo = '',
}: SearchFormProps) => {
  const today = todayISO();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [error, setError] = useState<string | null>(null);

  const cityOptions = useMemo(() => {
    const names = cities.map((c) => c.name);
    return Array.from(new Set(names)).sort();
  }, [cities]);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!from || !to) {
      setError('Pilih kota asal dan kota tujuan terlebih dahulu.');
      return;
    }
    if (from === to) {
      setError('Kota asal dan kota tujuan tidak boleh sama.');
      return;
    }

    onSearch(from, to, today);
  };

  return (
    <form
      onSubmit={handleSubmit}
      id="cari"
      className="w-full rounded-2xl border border-border bg-card p-5 shadow-xl sm:p-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] items-end">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide">
            Kota Asal
          </Label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Pilih kota asal" />
            </SelectTrigger>
            <SelectContent>
              {cityOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide">
            Kota Tujuan
          </Label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Pilih kota tujuan" />
            </SelectTrigger>
            <SelectContent>
              {cityOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleSwap}
            aria-label="Swap kota"
            title="Tukar asal & tujuan"
            className="h-11 w-11 shrink-0"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </Button>
          <Button type="submit" className="h-11 shrink-0" size="lg">
            <Search className="mr-2 h-5 w-5" />
            Cari Bis
          </Button>
        </div>
      </div>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </form>
  );
};
