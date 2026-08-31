import { NextResponse } from 'next/server';
import { buildImportTemplate } from '@/lib/excelTemplate';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const wb = await buildImportTemplate();
  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template-import-bis-inform.xlsx"',
    },
  });
}
