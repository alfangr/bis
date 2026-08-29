export interface BusSeats {
  available: number;
  total: number;
}

export interface BusStop {
  city: string;
  price: number;
}

export interface Bus {
  id: string;
  poName: string;
  poPhone: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration?: string;
  price: number;
  seats: BusSeats;
  amenities: string[];
  stops?: BusStop[];
  /**
   * Set only on a search-result bus that matched via an intermediate stop
   * instead of its official `to` — holds that official terminus so the UI
   * can show "turun di tengah rute" context. Never persisted.
   */
  officialTo?: string;
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
}
