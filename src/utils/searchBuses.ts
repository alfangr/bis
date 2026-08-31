import type { Bus, SearchParams } from '@/types';

/**
 * Matches a bus either by its official `to` (full-route fare) or by one of
 * its intermediate `stops` (e.g. a bus whose official route is Malang -
 * Surabaya but also stops at Pasuruan for a cheaper fare). A stop match is
 * returned as a derived bus record with `to`/`price`/`arrival` overridden to
 * the stop's values (falling back to the full-route arrival if the stop has
 * no time of its own) and `officialTo` set to the bus's real terminus, so the
 * UI can show that the bus continues past this stop.
 */
export const searchBuses = (buses: Bus[], params: SearchParams): Bus[] => {
  const { from, to } = params;

  if (!from || !to) {
    return [];
  }

  const fromLower = from.toLowerCase();
  const toLower = to.toLowerCase();
  const results: Bus[] = [];

  for (const bus of buses) {
    if (bus.from.toLowerCase() !== fromLower) continue;

    if (bus.to.toLowerCase() === toLower) {
      results.push(bus);
      continue;
    }

    const stop = bus.stops?.find((s) => s.city.toLowerCase() === toLower);
    if (stop) {
      results.push({
        ...bus,
        to: stop.city,
        price: stop.price,
        arrival: stop.time || bus.arrival,
        officialTo: bus.to,
      });
    }
  }

  return results;
};

export const getPriceRange = (buses: Bus[]): { min: number; max: number } => {
  if (buses.length === 0) return { min: 0, max: 0 };
  const prices = buses.map((b) => b.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};
