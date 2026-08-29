import type { Database } from 'sql.js';
import type { Bus, City } from '@/types';

let dbPromise: Promise<Database> | null = null;

const getDb = (): Promise<Database> => {
  if (!dbPromise) {
    dbPromise = (async () => {
      const initSqlJs = (await import('sql.js')).default;
      const SQL = await initSqlJs({ locateFile: (file) => `/${file}` });
      const res = await fetch('/bis-inform.sqlite');
      const buffer = await res.arrayBuffer();
      return new SQL.Database(new Uint8Array(buffer));
    })();
  }
  return dbPromise;
};

const selectAll = async (db: Database, sql: string): Promise<Record<string, unknown>[]> => {
  const stmt = db.prepare(sql);
  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
};

const rowToCity = (row: Record<string, unknown>): City => ({
  id: row.id as string,
  name: row.name as string,
  province: row.province as string,
});

const rowToBus = (row: Record<string, unknown>): Bus => ({
  id: row.id as string,
  poName: row.po_name as string,
  poPhone: row.po_phone as string,
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
  amenities: JSON.parse((row.amenities as string) || '[]'),
  stops: row.stops ? JSON.parse(row.stops as string) : undefined,
});

const runInTransaction = (db: Database, fn: () => void): void => {
  db.run('BEGIN TRANSACTION');
  try {
    fn();
    db.run('COMMIT');
  } catch (err) {
    db.run('ROLLBACK');
    throw err;
  }
};

export const getCities = async (): Promise<City[]> => {
  const db = await getDb();
  const rows = await selectAll(db, 'SELECT * FROM cities');
  return rows.map(rowToCity);
};

export const saveCities = async (cities: City[]): Promise<void> => {
  const db = await getDb();
  runInTransaction(db, () => {
    db.run('DELETE FROM cities');
    const stmt = db.prepare('INSERT INTO cities (id, name, province) VALUES (?, ?, ?)');
    cities.forEach((c) => stmt.run([c.id, c.name, c.province]));
    stmt.free();
  });
};

export const getBuses = async (): Promise<Bus[]> => {
  const db = await getDb();
  const rows = await selectAll(db, 'SELECT * FROM buses');
  return rows.map(rowToBus);
};

export const saveBuses = async (buses: Bus[]): Promise<void> => {
  const db = await getDb();
  runInTransaction(db, () => {
    db.run('DELETE FROM buses');
    const stmt = db.prepare(
      `INSERT INTO buses
        (id, po_name, po_phone, from_city, to_city, departure, arrival, duration, price, seats_available, seats_total, amenities, stops)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    buses.forEach((b) =>
      stmt.run([
        b.id,
        b.poName,
        b.poPhone,
        b.from,
        b.to,
        b.departure,
        b.arrival,
        b.duration ?? null,
        b.price,
        b.seats.available,
        b.seats.total,
        JSON.stringify(b.amenities ?? []),
        b.stops ? JSON.stringify(b.stops) : null,
      ])
    );
    stmt.free();
  });
};

export const generateId = (prefix: string, items: { id: string }[]): string => {
  const existingNums = items
    .map((item) => {
      const match = item.id.match(/^[A-Z]+(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !Number.isNaN(n));

  const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
  return `${prefix}${String(nextNum).padStart(3, '0')}`;
};

export const exportDatabase = async (): Promise<Uint8Array> => {
  const db = await getDb();
  return db.export();
};
