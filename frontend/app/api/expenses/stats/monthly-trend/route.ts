import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const trends = []

    for (let i = 5; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const expenses = await prisma.expense.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
          NOT: { category: { name: 'Salary & Income' } }
        }
      })

      const total = expenses.reduce((sum, e) => sum + e.amount, 0)
      trends.push({
        month: startDate.getMonth() + 1,
        year: startDate.getFullYear(),
        total,
        count: expenses.length
      })
    }

    return NextResponse.json({ trends })
  } catch (error) {
    console.error('Monthly trend error:', error)
    return NextResponse.json({ detail: 'Failed to fetch monthly trends' }, { status: 500 })
  }
}
