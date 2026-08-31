export interface BusSeats {
  available: number;
  total: number;
}

export interface BusStop {
  city: string;
  price: number;
  /** Arrival time at this stop (HH:MM). Optional — falls back to the schedule's arrival. */
  time?: string;
}

export type BusClass = 'Ekonomi' | 'Patas';

/** Master data for a bus/PO — reusable across many schedules. */
export interface BusOperator {
  id: string;
  poName: string;
  amenities: string[];
}

/** A single trip entry ("jadwal"): a bus operator running a specific route/time/price. */
export interface Schedule {
  id: string;
  busId: string;
  busClass: BusClass;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration?: string;
  price: number;
  seats: BusSeats;
  stops?: BusStop[];
}

/**
 * A schedule flattened with its operator's info — the shape used everywhere
 * schedules are displayed or searched (homepage results, admin "Jadwal" list).
 * Never written back as-is; admin writes persist the `Schedule` fields only.
 */
export interface Bus extends Schedule {
  poName: string;
  amenities: string[];
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
