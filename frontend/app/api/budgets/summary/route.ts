import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany()
    
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    let total_budget = 0
    let total_spent = 0
    let on_track_count = 0
    let warning_count = 0
    let exceeded_count = 0

    for (const b of budgets) {
      total_budget += b.amount

      const expenses = await prisma.expense.findMany({
        where: {
          categoryId: b.categoryId,
          date: { gte: startOfMonth, lte: endOfMonth }
        }
      })

      const spent = expenses.reduce((sum, e) => sum + e.amount, 0)
      total_spent += spent

      const pct = (spent / b.amount) * 100
      if (pct > 100) exceeded_count++
      else if (pct >= 80) warning_count++
      else on_track_count++
    }

    const total_remaining = total_budget - total_spent
    const percentage_used = total_budget > 0 ? Math.round((total_spent / total_budget) * 100) : 0

    return NextResponse.json({
      total_budget,
      total_spent,
      total_remaining,
      percentage_used,
      budgets_count: budgets.length,
      on_track_count,
      warning_count,
      exceeded_count,
    })
  } catch (error) {
    console.error('Budget summary error:', error)
    return NextResponse.json({ detail: 'Failed to fetch budget summary' }, { status: 500 })
  }
}
