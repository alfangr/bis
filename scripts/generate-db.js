const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const SEED_DIR = path.join(__dirname, 'seed');
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'bis-inform.sqlite');

const SCHEMA_SQL = `
CREATE TABLE cities (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  province TEXT NOT NULL
);

CREATE TABLE buses (
  id        TEXT PRIMARY KEY,
  po_name   TEXT NOT NULL,
  po_phone  TEXT NOT NULL DEFAULT '',
  amenities TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE schedules (
  id              TEXT PRIMARY KEY,
  bus_id          TEXT NOT NULL REFERENCES buses(id),
  from_city       TEXT NOT NULL,
  to_city         TEXT NOT NULL,
  departure       TEXT NOT NULL,
  arrival         TEXT NOT NULL,
  duration        TEXT,
  price           INTEGER NOT NULL,
  seats_available INTEGER NOT NULL,
  seats_total     INTEGER NOT NULL,
  stops           TEXT
);
`;

const readSeed = (file) => JSON.parse(fs.readFileSync(path.join(SEED_DIR, file), 'utf-8'));

async function main() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(SCHEMA_SQL);

  const { cities } = readSeed('cities.json');
  const { buses } = readSeed('buses.json');
  const { schedules } = readSeed('schedules.json');

  const insertCity = db.prepare('INSERT INTO cities (id, name, province) VALUES (?, ?, ?)');
  cities.forEach((c) => insertCity.run([c.id, c.name, c.province]));
  insertCity.free();

  const insertBus = db.prepare(
    'INSERT INTO buses (id, po_name, po_phone, amenities) VALUES (?, ?, ?, ?)'
  );
  buses.forEach((b) =>
    insertBus.run([b.id, b.poName, b.poPhone ?? '', JSON.stringify(b.amenities ?? [])])
  );
  insertBus.free();

  const insertSchedule = db.prepare(
    `INSERT INTO schedules
      (id, bus_id, from_city, to_city, departure, arrival, duration, price, seats_available, seats_total, stops)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  schedules.forEach((s) =>
    insertSchedule.run([
      s.id,
      s.busId,
      s.from,
      s.to,
      s.departure,
      s.arrival,
      s.duration ?? null,
      s.price,
      s.seats.available,
      s.seats.total,
      s.stops ? JSON.stringify(s.stops) : null,
    ])
  );
  insertSchedule.free();

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, Buffer.from(db.export()));

  console.log(`Wrote ${OUTPUT_FILE}`);
  console.log(`  cities:    ${cities.length}`);
  console.log(`  buses:     ${buses.length}`);
  console.log(`  schedules: ${schedules.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
