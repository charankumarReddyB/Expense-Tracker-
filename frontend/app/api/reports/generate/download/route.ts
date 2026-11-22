import { NextResponse } from 'next/server'

export async function POST() {
  // Return dummy PDF buffer for report download
  const buffer = Buffer.from('%PDF-1.4\n%Mock Financial Report\n')
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="report.pdf"',
    },
  })
}
