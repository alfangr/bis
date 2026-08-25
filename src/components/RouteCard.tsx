'use client';

import { Route } from '@/types';
import { formatCurrencyShort } from '@/utils/formatters';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, ArrowRight, Bus as BusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RouteCardProps {
  route: Route;
  onClickQuick?: (from: string, to: string) => void;
}

export const RouteCard = ({ route, onClickQuick }: RouteCardProps) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClickQuick) {
      e.preventDefault();
      onClickQuick(route.from, route.to);
    }
  };

  return (
    <Card
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className={cn(
        'group w-full cursor-pointer transition-all duration-200 hover:border-primary/40 hover:shadow-lg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClickQuick) {
          e.preventDefault();
          onClickQuick(route.from, route.to);
        }
      }}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
              <span>{route.from}</span>
              <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
              <span>{route.to}</span>
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <BusIcon className="h-3 w-3" />
          {route.busCount} bis
        </Badge>
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <p className="line-clamp-2 text-xs text-muted-foreground">{route.description}</p>
      </CardContent>
      <Separator className="mx-6" />
      <CardFooter className="flex items-end justify-between pt-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Mulai dari
          </p>
          <p className="text-lg font-bold text-primary">
            {formatCurrencyShort(route.minPrice)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-transform group-hover:translate-x-1">
          Cek jadwal
          <ArrowRight className="h-4 w-4" />
        </span>
      </CardFooter>
    </Card>
  );
};
