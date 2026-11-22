import { NextResponse } from 'next/server'

export async function GET() {
  const csvContent = 'date,amount,category,description,merchant\n2026-11-01,1200,Food & Dining,Dinner with team,Swiggy\n'
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="expense_import_template.csv"',
    },
  })
}
