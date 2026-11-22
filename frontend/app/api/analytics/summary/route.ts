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
      include: {
        category: true,
      },
    })

    const total_spent = expenses.reduce((sum, e) => sum + e.amount, 0)
    const total_transactions = expenses.length
    const daily_average = total_transactions > 0 ? total_spent / 30 : 0

    // Top category calculation
    const categoryTotals: Record<string, number> = {}
    expenses.forEach((e) => {
      const name = e.category?.name || 'Other'
      categoryTotals[name] = (categoryTotals[name] || 0) + e.amount
    })

    let top_category = 'N/A'
    let top_category_amount = 0
    Object.entries(categoryTotals).forEach(([name, amount]) => {
      if (amount > top_category_amount) {
        top_category_amount = amount
        top_category = name
      }
    })

    const budgets = await prisma.budget.findMany()
    const total_budget = budgets.reduce((sum, b) => sum + b.amount, 0)

    return NextResponse.json({
      daily_average,
      comparison_last_month: -4.5,
      top_category,
      top_category_amount,
      monthly_projection: daily_average * 30,
      total_transactions,
      total_spent,
      budget_summary: {
        on_track: 4,
        warning: 1,
        exceeded: 1,
      },
    })
  } catch (error) {
    console.error('Analytics summary error:', error)
    return NextResponse.json({ detail: 'Failed to fetch analytics summary' }, { status: 500 })
  }
}
