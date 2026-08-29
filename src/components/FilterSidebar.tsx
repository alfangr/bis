'use client';

import { FilterState } from '@/types';
import { formatCurrencyShort } from '@/utils/formatters';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  minPrice: number;
  maxPrice: number;
  resultCount: number;
}

export const FilterSidebar = ({
  filters,
  onChange,
  minPrice,
  maxPrice,
  resultCount,
}: FilterSidebarProps) => {
  const update = (patch: Partial<FilterState>) => {
    onChange({ ...filters, ...patch });
  };

  const reset = () => {
    onChange({
      priceMin: null,
      priceMax: null,
      timeFrom: null,
      timeTo: null,
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <h3 className="flex items-center gap-2 font-heading font-bold text-card-foreground">
          <Filter className="h-5 w-5 text-primary" />
          Filter
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={reset}
          className="h-8 px-2 text-xs text-primary hover:text-primary/80"
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wide">
            Range Harga
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="price-min" className="text-[11px] text-muted-foreground">
                Min
              </Label>
              <Input
                id="price-min"
                type="number"
                value={filters.priceMin ?? ''}
                placeholder={minPrice.toString()}
                min={0}
                onChange={(e) =>
                  update({ priceMin: e.target.value ? Number(e.target.value) : null })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="price-max" className="text-[11px] text-muted-foreground">
                Max
              </Label>
              <Input
                id="price-max"
                type="number"
                value={filters.priceMax ?? ''}
                placeholder={maxPrice.toString()}
                min={0}
                onChange={(e) =>
                  update({ priceMax: e.target.value ? Number(e.target.value) : null })
                }
              />
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{formatCurrencyShort(minPrice)}</span>
            <span>{formatCurrencyShort(maxPrice)}</span>
          </div>
        </section>

        <section className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wide">
            Jam Berangkat
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="time-from" className="text-[11px] text-muted-foreground">
                Dari jam
              </Label>
              <Input
                id="time-from"
                type="time"
                value={filters.timeFrom ?? ''}
                onChange={(e) => update({ timeFrom: e.target.value || null })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="time-to" className="text-[11px] text-muted-foreground">
                Sampai jam
              </Label>
              <Input
                id="time-to"
                type="time"
                value={filters.timeTo ?? ''}
                onChange={(e) => update({ timeTo: e.target.value || null })}
              />
            </div>
          </div>
        </section>
      </CardContent>
      <Separator className="mx-6" />
      <CardFooter className="pt-4">
        <p className="text-xs text-muted-foreground">
          Menampilkan{' '}
          <span className="font-bold text-card-foreground">{resultCount}</span> bis
        </p>
      </CardFooter>
    </Card>
  );
};
