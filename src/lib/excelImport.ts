import ExcelJS from 'exceljs';
import {
  createBusOperator,
  createCity,
  createSchedule,
  getBusOperators,
  getCities,
  type ScheduleInput,
} from '@/lib/db';
import type { BusClass, BusStop } from '@/types';

export type ImportSummary = {
  cities: { created: number; skipped: number };
  buses: { created: number; skipped: number };
  schedules: { created: number; errors: string[] };
};

const BUS_CLASSES: BusClass[] = ['Ekonomi', 'Patas'];
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

const cellText = (cell: ExcelJS.Cell | undefined): string => {
  if (!cell || cell.value == null) return '';
  const v = cell.value;
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number') return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object') {
    const anyV = v as { text?: unknown; result?: unknown; richText?: { text: string }[] };
    if (Array.isArray(anyV.richText)) return anyV.richText.map((t) => t.text).join('').trim();
    if (anyV.text != null) return String(anyV.text).trim();
    if (anyV.result != null) return String(anyV.result).trim();
  }
  return String(v).trim();
};

const cellNumber = (cell: ExcelJS.Cell | undefined): number | null => {
  const text = cellText(cell).replace(/[^0-9.-]/g, '');
  if (!text) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
};

const rowIsEmpty = (row: ExcelJS.Row): boolean => {
  let empty = true;
  row.eachCell({ includeEmpty: false }, () => {
    empty = false;
  });
  return empty;
};

const parseStops = (raw: string): BusStop[] | undefined => {
  if (!raw.trim()) return undefined;
  const stops = raw
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [city, priceRaw] = part.split(':').map((s) => s?.trim() ?? '');
      const price = Number((priceRaw ?? '').replace(/[^0-9.-]/g, ''));
      return city ? { city, price: Number.isFinite(price) ? price : 0 } : null;
    })
    .filter((s): s is BusStop => s !== null);
  return stops.length > 0 ? stops : undefined;
};

export const importWorkbook = async (buffer: Buffer): Promise<ImportSummary> => {
  const wb = new ExcelJS.Workbook();
  // exceljs ships its own (older) @types/node, whose Buffer type doesn't
  // structurally match this project's — same type at runtime, so cast through.
  await wb.xlsx.load(buffer as any);

  const summary: ImportSummary = {
    cities: { created: 0, skipped: 0 },
    buses: { created: 0, skipped: 0 },
    schedules: { created: 0, errors: [] },
  };

  // --- Kota ---
  const cityNames = new Set((await getCities()).map((c) => c.name.toLowerCase()));
  const citySheet = wb.getWorksheet('Kota');
  if (citySheet) {
    for (let r = 2; r <= citySheet.rowCount; r++) {
      const row = citySheet.getRow(r);
      if (rowIsEmpty(row)) continue;
      const name = cellText(row.getCell(1));
      const province = cellText(row.getCell(2));
      if (!name) continue;
      if (cityNames.has(name.toLowerCase())) {
        summary.cities.skipped++;
        continue;
      }
      await createCity({ name, province });
      cityNames.add(name.toLowerCase());
      summary.cities.created++;
    }
  }

  // --- PO Bis ---
  const operatorIdByName = new Map<string, string>();
  (await getBusOperators()).forEach((b) => operatorIdByName.set(b.poName.toLowerCase(), b.id));
  const busSheet = wb.getWorksheet('PO Bis');
  if (busSheet) {
    for (let r = 2; r <= busSheet.rowCount; r++) {
      const row = busSheet.getRow(r);
      if (rowIsEmpty(row)) continue;
      const poName = cellText(row.getCell(1));
      if (!poName) continue;
      if (operatorIdByName.has(poName.toLowerCase())) {
        summary.buses.skipped++;
        continue;
      }
      const created = await createBusOperator({ poName });
      operatorIdByName.set(poName.toLowerCase(), created.id);
      summary.buses.created++;
    }
  }

  // --- Jadwal ---
  const scheduleSheet = wb.getWorksheet('Jadwal');
  if (scheduleSheet) {
    for (let r = 2; r <= scheduleSheet.rowCount; r++) {
      const row = scheduleSheet.getRow(r);
      if (rowIsEmpty(row)) continue;

      const poName = cellText(row.getCell(1));
      const busClassRaw = cellText(row.getCell(2));
      const from = cellText(row.getCell(3));
      const to = cellText(row.getCell(4));
      const departure = cellText(row.getCell(5));
      const arrival = cellText(row.getCell(6));
      const price = cellNumber(row.getCell(7));
      const stopsRaw = cellText(row.getCell(8));

      const busClass = BUS_CLASSES.find((c) => c.toLowerCase() === busClassRaw.toLowerCase());
      const busId = poName ? operatorIdByName.get(poName.toLowerCase()) : undefined;

      const rowErrors: string[] = [];
      if (!poName) rowErrors.push('PO Bis kosong');
      else if (!busId) rowErrors.push(`PO Bis "${poName}" tidak ditemukan`);
      if (!busClass) rowErrors.push('Kelas Bis harus "Ekonomi" atau "Patas"');
      if (!from) rowErrors.push('Kota Asal kosong');
      if (!to) rowErrors.push('Kota Tujuan kosong');
      if (!departure || !TIME_RE.test(departure)) rowErrors.push('Jam Berangkat harus format HH:MM');
      if (!arrival || !TIME_RE.test(arrival)) rowErrors.push('Jam Tiba harus format HH:MM');
      if (price === null || price <= 0) rowErrors.push('Harga harus angka lebih dari 0');

      if (rowErrors.length > 0 || !busId || !busClass) {
        summary.schedules.errors.push(`Jadwal baris ${r}: ${rowErrors.join('; ')}`);
        continue;
      }

      const input: ScheduleInput = {
        busId,
        busClass,
        from,
        to,
        departure,
        arrival,
        price: price as number,
        stops: parseStops(stopsRaw),
      };
      const created = await createSchedule(input);
      if (!created) {
        summary.schedules.errors.push(`Jadwal baris ${r}: gagal menyimpan, PO Bis tidak ditemukan di database`);
        continue;
      }
      summary.schedules.created++;
    }
  }

  return summary;
};
