import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('page_size') || '50')
    const categoryId = searchParams.get('category_id')

    const where: any = {
      NOT: {
        category: {
          name: 'Salary & Income'
        }
      }
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const [total, expenses] = await Promise.all([
      prisma.expense.count({ where }),
      prisma.expense.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    const formattedExpenses = expenses.map((exp) => ({
      expense_id: exp.id,
      amount: exp.amount,
      description: exp.description,
      merchant: exp.description.split(' - ')[1] || exp.description,
      date: exp.date.toISOString().split('T')[0],
      category: {
        category_id: exp.category?.id || '',
        name: exp.category?.name || 'Uncategorized',
        icon: exp.category?.icon || '📁',
        color: exp.category?.color || '#3B82F6',
      },
    }))

    return NextResponse.json({
      expenses: formattedExpenses,
      total,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Expenses error:', error)
    return NextResponse.json({ detail: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, description, date, category_id } = body

    if (!amount || !description || !category_id) {
      return NextResponse.json({ detail: 'Amount, description, and category are required' }, { status: 400 })
    }

    const expense = await prisma.expense.create({
      data: {
        userId: 'default-user-id',
        amount: parseFloat(amount),
        description,
        categoryId: category_id,
        date: date ? new Date(date) : new Date(),
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Add expense error:', error)
    return NextResponse.json({ detail: 'Failed to add expense' }, { status: 500 })
  }
}
