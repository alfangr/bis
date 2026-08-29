'use client';

import { useMemo, useState } from 'react';
import { Bus, FilterState, SortBy } from '@/types';
import { BusCard } from './BusCard';
import { FilterSidebar } from './FilterSidebar';
import { LoadingSpinner } from './LoadingSpinner';
import { SORT_OPTIONS } from '@/lib/constants';
import { filterBuses, sortBuses } from '@/utils/filterBuses';
import { getPriceRange } from '@/utils/searchBuses';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Frown } from 'lucide-react';

interface BusListProps {
  buses: Bus[];
  isLoading?: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  priceMin: null,
  priceMax: null,
  timeFrom: null,
  timeTo: null,
};

export const BusList = ({ buses, isLoading = false }: BusListProps) => {
  const [sortBy, setSortBy] = useState<SortBy>('price-asc');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const priceRange = useMemo(() => getPriceRange(buses), [buses]);

  const filteredBuses = useMemo(() => filterBuses(buses, filters), [buses, filters]);
  const sortedBuses = useMemo(() => sortBuses(filteredBuses, sortBy), [filteredBuses, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Mencari jadwal bis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <FilterSidebar
        filters={filters}
        onChange={setFilters}
        minPrice={priceRange.min}
        maxPrice={priceRange.max}
        resultCount={sortedBuses.length}
      />

      <div>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-card-foreground">
              Hasil Pencarian
            </h2>
            <p className="text-sm text-muted-foreground">
              Ditemukan{' '}
              <span className="font-bold text-card-foreground">
                {sortedBuses.length}
              </span>{' '}
              pilihan bis
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Label
              htmlFor="sort-select"
              className="whitespace-nowrap text-xs font-medium text-muted-foreground"
            >
              Urutkan:
            </Label>
            <Select
              value={sortBy}
              onValueChange={(val) => setSortBy(val as SortBy)}
            >
              <SelectTrigger id="sort-select" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {sortedBuses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Frown className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-heading font-bold text-card-foreground">
                Tidak ada bis yang sesuai
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Coba ubah filter atau pilih tanggal dan rute yang lain.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedBuses.map((bus) => (
              <BusCard key={bus.id} bus={bus} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
