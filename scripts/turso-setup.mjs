import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_DIR = path.join(__dirname, 'seed');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error(
    'Missing TURSO_DATABASE_URL / TURSO_AUTH_TOKEN. Add them to .env.local first.'
  );
  process.exit(1);
}

const client = createClient({ url, authToken });

const readSeed = (file) => JSON.parse(fs.readFileSync(path.join(SEED_DIR, file), 'utf-8'));

async function main() {
  await client.batch(
    [
      `CREATE TABLE IF NOT EXISTS cities (
        id       TEXT PRIMARY KEY,
        name     TEXT NOT NULL,
        province TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS buses (
        id        TEXT PRIMARY KEY,
        po_name   TEXT NOT NULL,
        amenities TEXT NOT NULL DEFAULT '[]'
      )`,
      `CREATE TABLE IF NOT EXISTS schedules (
        id              TEXT PRIMARY KEY,
        bus_id          TEXT NOT NULL REFERENCES buses(id),
        class           TEXT NOT NULL DEFAULT 'Ekonomi',
        from_city       TEXT NOT NULL,
        to_city         TEXT NOT NULL,
        departure       TEXT NOT NULL,
        arrival         TEXT NOT NULL,
        duration        TEXT,
        price           INTEGER NOT NULL,
        seats_available INTEGER NOT NULL,
        seats_total     INTEGER NOT NULL,
        stops           TEXT
      )`,
    ],
    'write'
  );

  // Migrate databases created before these columns existed. Safe to re-run —
  // a duplicate-column error just means the migration already applied.
  const migrations = [
    `ALTER TABLE schedules ADD COLUMN class TEXT NOT NULL DEFAULT 'Ekonomi'`,
  ];
  for (const sql of migrations) {
    try {
      await client.execute(sql);
      console.log(`Migration applied: ${sql}`);
    } catch (err) {
      if (!/duplicate column name/i.test(String(err.message))) throw err;
    }
  }

  console.log('Schema ready (cities, buses, schedules).');

  const { cities } = readSeed('cities.json');
  const { buses } = readSeed('buses.json');
  const { schedules } = readSeed('schedules.json');

  // INSERT OR IGNORE keeps this idempotent — re-running never overwrites rows an
  // admin has since edited or deleted through the app.
  for (const c of cities) {
    await client.execute({
      sql: 'INSERT OR IGNORE INTO cities (id, name, province) VALUES (?, ?, ?)',
      args: [c.id, c.name, c.province],
    });
  }
  for (const b of buses) {
    await client.execute({
      sql: 'INSERT OR IGNORE INTO buses (id, po_name, amenities) VALUES (?, ?, ?)',
      args: [b.id, b.poName, JSON.stringify(b.amenities ?? [])],
    });
  }
  for (const s of schedules) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO schedules
        (id, bus_id, class, from_city, to_city, departure, arrival, duration, price, seats_available, seats_total, stops)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        s.id,
        s.busId,
        s.busClass ?? 'Ekonomi',
        s.from,
        s.to,
        s.departure,
        s.arrival,
        s.duration ?? null,
        s.price,
        s.seats.available,
        s.seats.total,
        s.stops ? JSON.stringify(s.stops) : null,
      ],
    });
  }

  console.log(`Seeded (or already present): ${cities.length} cities, ${buses.length} buses, ${schedules.length} schedules.`);
  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
