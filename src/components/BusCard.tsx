import { Bus } from '@/types';
import { formatCurrencyShort } from '@/utils/formatters';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  MapPinned,
} from 'lucide-react';

interface BusCardProps {
  bus: Bus;
}

export const BusCard = ({ bus }: BusCardProps) => {
  const availablePct = Math.round((bus.seats.available / bus.seats.total) * 100);
  const isLow = availablePct <= 20;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-wrap flex-row items-start justify-between gap-3 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-heading text-lg font-bold text-card-foreground">
              {bus.poName}
            </h3>
            <Badge variant="outline" className="font-normal">
              {bus.busClass}
            </Badge>
          </div>
        </div>
        <Badge
          variant={isLow ? 'destructive' : 'secondary'}
          className="flex items-center gap-1"
        >
          {isLow ? (
            <AlertTriangle className="h-3 w-3" />
          ) : (
            <CheckCircle2 className="h-3 w-3" />
          )}
          {isLow ? 'Sisa sedikit' : 'Masih banyak'} · {bus.seats.available}/
          {bus.seats.total} kursi
        </Badge>
      </CardHeader>

      <CardContent className="pb-4 pt-0">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4">
          <div className="text-center">
            <p className="text-xl font-bold text-card-foreground">{bus.departure}</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {bus.from}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative flex w-full items-center">
              <Separator className="w-full" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="mt-3 text-[11px] font-medium text-muted-foreground">
              {bus.duration}
            </p>
            {!bus.officialTo && bus.stops && bus.stops.length > 0 && (
              <p className="mt-0.5 text-center text-[10px] text-muted-foreground/70">
                Transit: {bus.stops.map((s) => (s.time ? `${s.city} (${s.time})` : s.city)).join(', ')}
              </p>
            )}
          </div>

          <div className="text-center">
            <p className="text-xl font-bold text-card-foreground">{bus.arrival}</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {bus.to}
            </p>
          </div>
        </div>

        {bus.officialTo && (
          <div className="mb-4 flex items-center gap-1.5 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <MapPinned className="h-3.5 w-3.5 shrink-0 text-primary" />
            Titik berhenti di rute resmi {bus.from} → {bus.officialTo}. Bis akan lanjut ke{' '}
            {bus.officialTo} setelah {bus.to}.
          </div>
        )}

        <Separator className="mb-4" />

        <div className="flex flex-wrap items-center gap-2">
          {bus.amenities.map((a) => (
            <Badge
              key={a}
              variant="outline"
              className="font-normal text-muted-foreground"
            >
              {a}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="bg-muted/30">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Harga
          </p>
          <p className="font-heading text-2xl font-bold text-primary">
            {formatCurrencyShort(bus.price)}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};
