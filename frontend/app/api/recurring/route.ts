export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const recurring = await prisma.recurringExpense.findMany({
      orderBy: { nextDueDate: 'asc' },
      include: { category: true },
    })

    const formatted = recurring.map((r) => ({
      recurring_id: r.id,
      name: r.description,
      description: r.description,
      amount: r.amount,
      currency: 'INR',
      merchant: r.description.split(' - ')[1] || r.description,
      frequency: (r.frequency.toLowerCase() || 'monthly') as
        | 'daily'
        | 'weekly'
        | 'biweekly'
        | 'monthly'
        | 'quarterly'
        | 'yearly',
      next_due_date: r.nextDueDate.toISOString().split('T')[0],
      is_auto_detected: true,
      detection_confidence: 94,
      is_active: r.active,
      category: {
        category_id: r.categoryId,
        name: r.category?.name || 'Subscriptions',
        icon: r.category?.icon || '📁',
        color: r.category?.color || '#3B82F6',
      },
      alert_days_before: 3,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Recurring expenses error:', error)
    return NextResponse.json({ detail: 'Failed to fetch recurring expenses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, amount, frequency, category_id, start_date } = body

    const newRec = await prisma.recurringExpense.create({
      data: {
        userId: 'default-user-id',
        description: name,
        amount: parseFloat(amount),
        frequency: frequency || 'monthly',
        categoryId: category_id,
        nextDueDate: start_date ? new Date(start_date) : new Date(),
        active: true,
      },
      include: { category: true },
    })

    return NextResponse.json(newRec, { status: 201 })
  } catch (error) {
    console.error('Add recurring error:', error)
    return NextResponse.json({ detail: 'Failed to add recurring expense' }, { status: 500 })
  }
}
