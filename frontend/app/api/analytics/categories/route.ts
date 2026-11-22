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
      include: { category: true },
    })

    const total = expenses.reduce((sum, e) => sum + e.amount, 0)
    const map = new Map<string, number>()

    expenses.forEach((e) => {
      const name = e.category?.name || 'Other'
      map.set(name, (map.get(name) || 0) + e.amount)
    })

    const categories = Array.from(map.entries()).map(([category_name, amount]) => ({
      category_name,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Analytics categories error:', error)
    return NextResponse.json({ detail: 'Failed to fetch categories' }, { status: 500 })
  }
}
