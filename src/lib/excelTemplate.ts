import ExcelJS from 'exceljs';

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF1D4ED8' },
};
const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };

const styleHeaderRow = (row: ExcelJS.Row) => {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } } };
  });
  row.height = 22;
};

const GUIDE_LINES = [
  { text: 'PANDUAN IMPORT DATA — INFORMAKITA BIS', bold: true, size: 13 },
  { text: '' },
  { text: '1. File ini punya 3 sheet data: "Kota", "PO Bis", dan "Jadwal". Isi ketiganya sesuai kebutuhan.' },
  { text: '2. Jangan ubah nama sheet atau nama/urutan kolom di baris pertama (header) tiap sheet.' },
  { text: '3. Baris pertama tiap sheet adalah header — mulai isi data dari baris ke-2.' },
  { text: '4. Sheet "Kota": Nama Kota dan Provinsi wajib diisi.' },
  { text: '5. Sheet "PO Bis": Nama PO Bis wajib diisi dan sebaiknya unik (tidak diulang).' },
  { text: '6. Sheet "Jadwal":' },
  { text: '   - Kolom "PO Bis" harus persis sama dengan salah satu nama di sheet "PO Bis" (atau PO yang sudah ada di sistem).' },
  { text: '   - Kolom "Kelas Bis" hanya boleh "Ekonomi" atau "Patas" — pakai dropdown yang sudah disediakan.' },
  { text: '   - Kolom "Jam Berangkat" dan "Jam Tiba" pakai format 24 jam HH:MM, contoh: 05:30.' },
  { text: '   - Kolom "Harga (Rp)" diisi angka saja, tanpa titik/koma/Rp. Contoh: 25000.' },
  { text: '   - Kolom "Titik Berhenti" opsional. Format: NamaKota:Harga, pisahkan dengan titik-koma (;) kalau lebih dari satu.' },
  { text: '     Contoh: Pasuruan:10000; Bangil:15000' },
  { text: '7. Kota / PO Bis yang namanya sudah ada di sistem tidak akan diduplikasi otomatis saat import.' },
  { text: '8. Setelah selesai diisi, simpan file ini lalu unggah lewat menu "Import Data" di halaman Admin.' },
];

export const buildImportTemplate = async (): Promise<ExcelJS.Workbook> => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Informakita Bis';
  wb.created = new Date();

  const guide = wb.addWorksheet('Petunjuk', {
    properties: { tabColor: { argb: 'FF1D4ED8' } },
  });
  guide.columns = [{ width: 100 }];
  GUIDE_LINES.forEach((line, i) => {
    const cell = guide.getRow(i + 1).getCell(1);
    cell.value = line.text;
    cell.font = { bold: line.bold ?? false, size: line.size ?? 11 };
    cell.alignment = { wrapText: true, vertical: 'top' };
  });

  const cities = wb.addWorksheet('Kota');
  cities.columns = [
    { header: 'Nama Kota', key: 'name', width: 28 },
    { header: 'Provinsi', key: 'province', width: 28 },
  ];
  styleHeaderRow(cities.getRow(1));
  cities.views = [{ state: 'frozen', ySplit: 1 }];
  cities.getCell('A1').note = 'Contoh: Malang';
  cities.getCell('B1').note = 'Contoh: Jawa Timur';

  const buses = wb.addWorksheet('PO Bis');
  buses.columns = [{ header: 'Nama PO Bis', key: 'poName', width: 32 }];
  styleHeaderRow(buses.getRow(1));
  buses.views = [{ state: 'frozen', ySplit: 1 }];
  buses.getCell('A1').note = 'Contoh: Bis Tentrem';

  const schedules = wb.addWorksheet('Jadwal');
  schedules.columns = [
    { header: 'PO Bis', key: 'poName', width: 22 },
    { header: 'Kelas Bis', key: 'busClass', width: 14 },
    { header: 'Kota Asal', key: 'from', width: 18 },
    { header: 'Kota Tujuan', key: 'to', width: 18 },
    { header: 'Jam Berangkat (HH:MM)', key: 'departure', width: 20 },
    { header: 'Jam Tiba (HH:MM)', key: 'arrival', width: 18 },
    { header: 'Harga (Rp)', key: 'price', width: 14 },
    { header: 'Titik Berhenti (opsional)', key: 'stops', width: 34 },
  ];
  styleHeaderRow(schedules.getRow(1));
  schedules.views = [{ state: 'frozen', ySplit: 1 }];
  schedules.getCell('A1').note = 'Contoh: Bis Tentrem — harus cocok dengan sheet "PO Bis"';
  schedules.getCell('B1').note = 'Isi persis: Ekonomi atau Patas';
  schedules.getCell('C1').note = 'Contoh: Malang';
  schedules.getCell('D1').note = 'Contoh: Surabaya';
  schedules.getCell('E1').note = 'Format 24 jam, contoh: 05:30';
  schedules.getCell('F1').note = 'Format 24 jam, contoh: 07:45';
  schedules.getCell('G1').note = 'Angka saja, contoh: 25000';
  schedules.getCell('H1').note = 'Opsional. Contoh: Pasuruan:10000; Bangil:15000';

  schedules.getColumn('departure').numFmt = '@';
  schedules.getColumn('arrival').numFmt = '@';
  schedules.getColumn('price').numFmt = '#,##0';

  for (let r = 2; r <= 500; r++) {
    schedules.getCell(`B${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Ekonomi,Patas"'],
      showErrorMessage: true,
      errorTitle: 'Kelas Bis tidak valid',
      error: 'Pilih Ekonomi atau Patas dari dropdown.',
    };
  }

  return wb;
};
