import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const expenses = await prisma.expense.findMany({
    include: { category: true },
    orderBy: { date: 'desc' },
  })

  let csv = 'date,amount,category,description\n'
  expenses.forEach((e) => {
    csv += `${e.date.toISOString().split('T')[0]},${e.amount},"${e.category?.name || 'Uncategorized'}","${e.description.replace(/"/g, '""')}"\n`
  })

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="expenses_export.csv"',
    },
  })
}
