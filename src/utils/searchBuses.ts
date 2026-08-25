import type { Bus, SearchParams } from '@/types';

export const searchBuses = (buses: Bus[], params: SearchParams): Bus[] => {
  const { from, to } = params;

  if (!from || !to) {
    return [];
  }

  return buses.filter(
    (bus) =>
      bus.from.toLowerCase() === from.toLowerCase() &&
      bus.to.toLowerCase() === to.toLowerCase()
  );
};

export const getPriceRange = (buses: Bus[]): { min: number; max: number } => {
  if (buses.length === 0) return { min: 0, max: 0 };
  const prices = buses.map((b) => b.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};

export const getUniqueClasses = (buses: Bus[]): string[] => {
  const classes = new Set(buses.map((b) => b.class));
  return Array.from(classes).sort();
};
