import { createClient, type Client } from '@libsql/client';
import type { Bus, BusClass, BusOperator, BusStop, City, Schedule } from '@/types';

let client: Client | null = null;

const getClient = (): Client => {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url || !authToken) {
      throw new Error('TURSO_DATABASE_URL / TURSO_AUTH_TOKEN belum diset di environment.');
    }
    client = createClient({ url, authToken });
  }
  return client;
};

const rowToCity = (row: Record<string, unknown>): City => ({
  id: row.id as string,
  name: row.name as string,
  province: row.province as string,
});

const rowToBusOperator = (row: Record<string, unknown>): BusOperator => ({
  id: row.id as string,
  poName: row.po_name as string,
  amenities: JSON.parse((row.amenities as string) || '[]'),
});

// Row from a schedules-JOIN-buses query — a schedule flattened with its operator's info.
const rowToSchedule = (row: Record<string, unknown>): Bus => ({
  id: row.id as string,
  busId: row.bus_id as string,
  busClass: row.class as BusClass,
  poName: row.po_name as string,
  amenities: JSON.parse((row.amenities as string) || '[]'),
  from: row.from_city as string,
  to: row.to_city as string,
  departure: row.departure as string,
  arrival: row.arrival as string,
  duration: (row.duration as string | null) ?? undefined,
  price: row.price as number,
  seats: {
    available: row.seats_available as number,
    total: row.seats_total as number,
  },
  stops: row.stops ? JSON.parse(row.stops as string) : undefined,
});

const generateId = async (
  prefix: string,
  table: 'cities' | 'buses' | 'schedules'
): Promise<string> => {
  const rs = await getClient().execute(`SELECT id FROM ${table}`);
  const nums = rs.rows
    .map((r) => {
      const match = (r.id as string).match(/^[A-Z]+(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !Number.isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
};

// Cities

export const getCities = async (): Promise<City[]> => {
  const rs = await getClient().execute('SELECT * FROM cities ORDER BY id');
  return rs.rows.map(rowToCity);
};

export const createCity = async (input: { name: string; province: string }): Promise<City> => {
  const id = await generateId('CITY', 'cities');
  await getClient().execute({
    sql: 'INSERT INTO cities (id, name, province) VALUES (?, ?, ?)',
    args: [id, input.name, input.province],
  });
  return { id, ...input };
};

export const updateCity = async (
  id: string,
  patch: Partial<{ name: string; province: string }>
): Promise<City | null> => {
  const db = getClient();
  const existing = await db.execute({ sql: 'SELECT * FROM cities WHERE id = ?', args: [id] });
  if (existing.rows.length === 0) return null;
  const next = { ...rowToCity(existing.rows[0]), ...patch };
  await db.execute({
    sql: 'UPDATE cities SET name = ?, province = ? WHERE id = ?',
    args: [next.name, next.province, id],
  });
  return next;
};

export const deleteCity = async (id: string): Promise<boolean> => {
  const rs = await getClient().execute({ sql: 'DELETE FROM cities WHERE id = ?', args: [id] });
  return rs.rowsAffected > 0;
};

// Bus operators (master)

export const getBusOperators = async (): Promise<BusOperator[]> => {
  const rs = await getClient().execute('SELECT * FROM buses ORDER BY id');
  return rs.rows.map(rowToBusOperator);
};

export const createBusOperator = async (input: {
  poName: string;
}): Promise<BusOperator> => {
  const id = await generateId('BIS', 'buses');
  const operator: BusOperator = { id, poName: input.poName, amenities: [] };
  await getClient().execute({
    sql: 'INSERT INTO buses (id, po_name, amenities) VALUES (?, ?, ?)',
    args: [operator.id, operator.poName, JSON.stringify(operator.amenities)],
  });
  return operator;
};

export const updateBusOperator = async (
  id: string,
  patch: Partial<{ poName: string }>
): Promise<BusOperator | null> => {
  const db = getClient();
  const existing = await db.execute({ sql: 'SELECT * FROM buses WHERE id = ?', args: [id] });
  if (existing.rows.length === 0) return null;
  const next = { ...rowToBusOperator(existing.rows[0]), ...patch };
  await db.execute({
    sql: 'UPDATE buses SET po_name = ? WHERE id = ?',
    args: [next.poName, id],
  });
  return next;
};

export const deleteBusOperator = async (id: string): Promise<boolean> => {
  const db = getClient();
  // A schedule without its bus operator has nothing to display — drop them together.
  await db.execute({ sql: 'DELETE FROM schedules WHERE bus_id = ?', args: [id] });
  const rs = await db.execute({ sql: 'DELETE FROM buses WHERE id = ?', args: [id] });
  return rs.rowsAffected > 0;
};

// Schedules ("jadwal") — a bus operator running a specific route/time/price.

export const getSchedules = async (): Promise<Bus[]> => {
  const rs = await getClient().execute(
    `SELECT s.*, b.po_name, b.amenities
     FROM schedules s
     JOIN buses b ON b.id = s.bus_id
     ORDER BY s.id`
  );
  return rs.rows.map(rowToSchedule);
};

export type ScheduleInput = {
  busId: string;
  busClass: BusClass;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  price: number;
  stops?: BusStop[];
};

export const createSchedule = async (input: ScheduleInput): Promise<Bus | null> => {
  const db = getClient();
  const operatorRs = await db.execute({ sql: 'SELECT * FROM buses WHERE id = ?', args: [input.busId] });
  if (operatorRs.rows.length === 0) return null;
  const operator = rowToBusOperator(operatorRs.rows[0]);

  const schedule: Schedule = {
    id: await generateId('JDW', 'schedules'),
    busId: input.busId,
    busClass: input.busClass,
    from: input.from,
    to: input.to,
    departure: input.departure,
    arrival: input.arrival,
    duration: '',
    price: input.price,
    seats: { available: 0, total: 0 },
    stops: input.stops && input.stops.length > 0 ? input.stops : undefined,
  };

  await db.execute({
    sql: `INSERT INTO schedules
      (id, bus_id, class, from_city, to_city, departure, arrival, duration, price, seats_available, seats_total, stops)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      schedule.id,
      schedule.busId,
      schedule.busClass,
      schedule.from,
      schedule.to,
      schedule.departure,
      schedule.arrival,
      schedule.duration ?? null,
      schedule.price,
      schedule.seats.available,
      schedule.seats.total,
      schedule.stops ? JSON.stringify(schedule.stops) : null,
    ],
  });

  return { ...schedule, poName: operator.poName, amenities: operator.amenities };
};

export const updateSchedule = async (
  id: string,
  patch: Partial<ScheduleInput>
): Promise<Bus | null> => {
  const db = getClient();
  const existingRs = await db.execute({
    sql: `SELECT s.*, b.po_name, b.amenities
          FROM schedules s JOIN buses b ON b.id = s.bus_id WHERE s.id = ?`,
    args: [id],
  });
  if (existingRs.rows.length === 0) return null;
  const current = rowToSchedule(existingRs.rows[0]);

  let operator = { poName: current.poName, amenities: current.amenities };
  let busId = current.busId;
  if (patch.busId && patch.busId !== current.busId) {
    const operatorRs = await db.execute({ sql: 'SELECT * FROM buses WHERE id = ?', args: [patch.busId] });
    if (operatorRs.rows.length === 0) {
      throw new Error('Bus tidak ditemukan');
    }
    const op = rowToBusOperator(operatorRs.rows[0]);
    operator = { poName: op.poName, amenities: op.amenities };
    busId = patch.busId;
  }

  const stops = patch.stops !== undefined ? (patch.stops.length > 0 ? patch.stops : undefined) : current.stops;
  const next: Schedule = {
    id: current.id,
    busId,
    busClass: patch.busClass ?? current.busClass,
    from: patch.from ?? current.from,
    to: patch.to ?? current.to,
    departure: patch.departure ?? current.departure,
    arrival: patch.arrival ?? current.arrival,
    duration: current.duration,
    price: patch.price ?? current.price,
    seats: current.seats,
    stops,
  };

  await db.execute({
    sql: `UPDATE schedules
          SET bus_id = ?, class = ?, from_city = ?, to_city = ?, departure = ?, arrival = ?, price = ?, stops = ?
          WHERE id = ?`,
    args: [
      next.busId,
      next.busClass,
      next.from,
      next.to,
      next.departure,
      next.arrival,
      next.price,
      next.stops ? JSON.stringify(next.stops) : null,
      id,
    ],
  });

  return { ...next, ...operator };
};

export const deleteSchedule = async (id: string): Promise<boolean> => {
  const rs = await getClient().execute({ sql: 'DELETE FROM schedules WHERE id = ?', args: [id] });
  return rs.rowsAffected > 0;
};
