import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      where: {
        NOT: {
          category: {
            name: 'Salary & Income',
          },
        },
      },
      orderBy: { date: 'asc' },
    })

    const monthlyMap = new Map<string, { amount: number; count: number }>()
    expenses.forEach((e) => {
      const key = `${e.date.toLocaleString('default', { month: 'short' })} ${e.date.getFullYear()}`
      const curr = monthlyMap.get(key) || { amount: 0, count: 0 }
      curr.amount += e.amount
      curr.count += 1
      monthlyMap.set(key, curr)
    })

    const data_points = Array.from(monthlyMap.entries()).map(([period, data]) => ({
      period,
      amount: data.amount,
      transaction_count: data.count,
    }))

    return NextResponse.json({ data_points })
  } catch (error) {
    console.error('Analytics trends error:', error)
    return NextResponse.json({ detail: 'Failed to fetch trends' }, { status: 500 })
  }
}
