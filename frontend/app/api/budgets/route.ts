import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany()
    const categories = await prisma.category.findMany()
    const catMap = new Map(categories.map((c) => [c.id, c]))

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const result = []

    for (const b of budgets) {
      const cat = catMap.get(b.categoryId)

      // Calculate current spent in this category for current month
      const expenses = await prisma.expense.findMany({
        where: {
          categoryId: b.categoryId,
          date: { gte: startOfMonth, lte: endOfMonth }
        }
      })

      const current_spent = expenses.reduce((sum, e) => sum + e.amount, 0)
      const remaining = b.amount - current_spent
      const percentage_used = Math.round((current_spent / b.amount) * 100)

      let status = 'on_track'
      if (percentage_used > 100) status = 'exceeded'
      else if (percentage_used >= 80) status = 'warning'

      result.push({
        budget_id: b.id,
        category_id: b.categoryId,
        category_name: cat?.name || 'Category',
        category_icon: cat?.icon || '📁',
        category_color: cat?.color || '#3B82F6',
        limit_amount: b.amount,
        current_spent,
        remaining,
        percentage_used,
        status,
        period: b.period,
        start_date: b.startDate.toISOString(),
        end_date: b.endDate?.toISOString() || '',
        alert_thresholds: [80, 90, 100]
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Budgets GET error:', error)
    return NextResponse.json({ detail: 'Failed to fetch budgets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { category_id, limit_amount, period } = body

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const budget = await prisma.budget.create({
      data: {
        userId: 'default-user-id',
        categoryId: category_id,
        amount: parseFloat(limit_amount),
        period: period || 'monthly',
        startDate: startOfMonth,
        endDate: endOfMonth,
      }
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error('Budgets POST error:', error)
    return NextResponse.json({ detail: 'Failed to create budget' }, { status: 500 })
  }
}
