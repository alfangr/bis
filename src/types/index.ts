export interface BusSeats {
  available: number;
  total: number;
}

export interface Bus {
  id: string;
  poName: string;
  poPhone: string;
  class: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration?: string;
  price: number;
  seats: BusSeats;
  amenities: string[];
  stops?: string[];
}

export interface City {
  id: string;
  name: string;
  province: string;
}

export interface SearchParams {
  from: string;
  to: string;
  date: string;
}

export type SortBy = 'price-asc' | 'price-desc' | 'time-asc' | 'time-desc' | 'seats-desc';

export interface FilterState {
  priceMin: number | null;
  priceMax: number | null;
  timeFrom: string | null;
  timeTo: string | null;
  classes: string[];
}
