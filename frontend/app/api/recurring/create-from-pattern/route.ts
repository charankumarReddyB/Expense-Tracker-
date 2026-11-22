export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { merchant, frequency } = await request.json()
    const categories = await prisma.category.findMany()
    const cat = categories.find((c) => c.name.toLowerCase().includes('entertainment')) || categories[0]

    const created = await prisma.recurringExpense.create({
      data: {
        userId: 'default-user-id',
        description: merchant,
        amount: 649,
        frequency: frequency || 'monthly',
        categoryId: cat.id,
        nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        active: true,
      },
    })

    return NextResponse.json(created)
  } catch (error) {
    return NextResponse.json({ detail: 'Failed create from pattern' }, { status: 500 })
  }
}
