import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const recurring = await prisma.recurringExpense.findMany({
      where: { active: true },
      include: { category: true },
    })

    const bills = recurring.map((r) => {
      const dueDate = new Date(r.nextDueDate)
      const diffDays = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return {
        bill_id: r.id,
        name: r.description,
        amount: r.amount,
        due_date: dueDate.toISOString().split('T')[0],
        days_until_due: diffDays,
        category: r.category?.name || 'General',
        frequency: r.frequency,
        is_paid: false,
      }
    })

    return NextResponse.json(bills)
  } catch (error) {
    return NextResponse.json({ detail: 'Failed to fetch bills' }, { status: 500 })
  }
}
