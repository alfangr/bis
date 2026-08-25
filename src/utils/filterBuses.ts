import { Bus, SortBy, FilterState } from '@/types';

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const sortBuses = (buses: Bus[], sortBy: SortBy): Bus[] => {
  const sorted = [...buses];

  switch (sortBy) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'time-asc':
      sorted.sort((a, b) => timeToMinutes(a.departure) - timeToMinutes(b.departure));
      break;
    case 'time-desc':
      sorted.sort((a, b) => timeToMinutes(b.departure) - timeToMinutes(a.departure));
      break;
    case 'seats-desc':
      sorted.sort((a, b) => b.seats.available - a.seats.available);
      break;
    default:
      break;
  }

  return sorted;
};

export const filterBuses = (buses: Bus[], filters: FilterState): Bus[] => {
  return buses.filter((bus) => {
    if (filters.priceMin !== null && bus.price < filters.priceMin) return false;
    if (filters.priceMax !== null && bus.price > filters.priceMax) return false;

    const depMinutes = timeToMinutes(bus.departure);
    if (filters.timeFrom !== null) {
      const minMinutes = timeToMinutes(filters.timeFrom);
      if (depMinutes < minMinutes) return false;
    }
    if (filters.timeTo !== null) {
      const maxMinutes = timeToMinutes(filters.timeTo);
      if (depMinutes > maxMinutes) return false;
    }

    if (filters.classes.length > 0 && !filters.classes.includes(bus.class)) return false;

    return true;
  });
};
