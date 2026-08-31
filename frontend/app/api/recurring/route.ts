import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const recurring = await prisma.recurringExpense.findMany({
      orderBy: { nextDueDate: 'asc' },
    })

    const categories = await prisma.category.findMany()
    const catMap = new Map(categories.map((c) => [c.id, c]))

    const formatted = recurring.map((r) => {
      const cat = catMap.get(r.categoryId)
      return {
        recurring_id: r.id,
        description: r.description,
        amount: r.amount,
        frequency: r.frequency,
        next_due_date: r.nextDueDate.toISOString().split('T')[0],
        active: r.active,
        category: {
          name: cat?.name || 'Category',
          icon: cat?.icon || '📁',
          color: cat?.color || '#3B82F6',
        },
      }
    })

    return NextResponse.json({ items: formatted })
  } catch (error) {
    console.error('Recurring expenses error:', error)
    return NextResponse.json({ detail: 'Failed to fetch recurring expenses' }, { status: 500 })
  }
}
