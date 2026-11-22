import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    // Current month expenses (excluding Income)
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        NOT: {
          category: {
            name: 'Salary & Income'
          }
        }
      },
    })

    const total_amount = expenses.reduce((sum, e) => sum + e.amount, 0)
    const expense_count = expenses.length
    const average_expense = expense_count > 0 ? Math.round(total_amount / expense_count) : 0

    // Previous month expenses for comparison
    const prevStartDate = new Date(year, month - 2, 1)
    const prevEndDate = new Date(year, month - 1, 0, 23, 59, 59)

    const prevExpenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
        NOT: {
          category: {
            name: 'Salary & Income'
          }
        }
      },
    })

    const prev_total = prevExpenses.reduce((sum, e) => sum + e.amount, 0)
    const month_comparison = prev_total > 0 ? ((total_amount - prev_total) / prev_total) * 100 : 0

    return NextResponse.json({
      total_amount,
      expense_count,
      average_expense,
      month_comparison,
      period: {
        month,
        year,
      },
    })
  } catch (error) {
    console.error('Summary stats error:', error)
    return NextResponse.json({ detail: 'Failed to fetch summary stats' }, { status: 500 })
  }
}
