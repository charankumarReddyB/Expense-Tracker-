export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const recurring = await prisma.recurringExpense.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { nextDueDate: 'asc' },
    })

    const bills = recurring.map((r) => {
      const dueDate = new Date(r.nextDueDate)
      const diffDays = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return {
        recurring_id: r.id,
        bill_id: r.id,
        name: r.description,
        amount: r.amount,
        currency: 'INR',
        next_due_date: dueDate.toISOString().split('T')[0],
        days_until_due: Math.max(0, diffDays),
        category_name: r.category?.name || 'Subscription',
        category_icon: r.category?.icon || '📅',
      }
    })

    return NextResponse.json(bills)
  } catch (error) {
    return NextResponse.json({ detail: 'Failed to fetch bills' }, { status: 500 })
  }
}
