import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const formatted = goals.map((g) => ({
      goal_id: g.id,
      name: g.title,
      target_amount: g.targetAmount,
      current_amount: g.currentAmount,
      deadline: g.deadline ? g.deadline.toISOString().split('T')[0] : '',
      priority: g.targetAmount > 150000 ? 'high' : g.targetAmount > 100000 ? 'medium' : 'low',
      category: g.category || 'Savings',
    }))

    return NextResponse.json({ goals: formatted })
  } catch (error) {
    console.error('Goals error:', error)
    return NextResponse.json({ detail: 'Failed to fetch goals' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, target_amount, current_amount, deadline, category } = body

    const goal = await prisma.goal.create({
      data: {
        userId: 'default-user-id',
        title: name,
        targetAmount: parseFloat(target_amount),
        currentAmount: current_amount ? parseFloat(current_amount) : 0,
        deadline: deadline ? new Date(deadline) : null,
        category: category || 'Savings',
      },
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error('Create goal error:', error)
    return NextResponse.json({ detail: 'Failed to create goal' }, { status: 500 })
  }
}
