import { NextResponse } from 'next/server';
import { importWorkbook, type ImportSummary } from '@/lib/excelImport';

export const dynamic = 'force-dynamic';

export async function POST(req: Request): Promise<NextResponse<ImportSummary | { error: string }>> {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File Excel tidak ditemukan' }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      return NextResponse.json({ error: 'File harus berformat .xlsx' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const summary = await importWorkbook(buffer);
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Gagal memproses file import' },
      { status: 400 }
    );
  }
}
