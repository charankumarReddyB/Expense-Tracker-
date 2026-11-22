import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const formatted = goals.map((g) => {
      const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0
      const days_remaining = g.deadline
        ? Math.max(0, Math.ceil((new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 30
      const status = (g.currentAmount >= g.targetAmount ? 'completed' : 'active') as
        | 'active'
        | 'paused'
        | 'completed'
        | 'abandoned'

      return {
        goal_id: g.id,
        id: g.id,
        name: g.title,
        title: g.title,
        description: g.category ? `Goal for ${g.category}` : 'Personal Savings Goal',
        target_amount: g.targetAmount,
        current_amount: g.currentAmount,
        target_date: g.deadline ? g.deadline.toISOString().split('T')[0] : null,
        deadline: g.deadline ? g.deadline.toISOString().split('T')[0] : '',
        status,
        priority: 2,
        milestones: [],
        progress_percentage: Math.round(progress * 10) / 10,
        days_remaining,
        projected_completion_date: g.deadline ? g.deadline.toISOString().split('T')[0] : null,
        is_on_track: progress >= 25,
        category: g.category || 'Savings',
        created_at: g.createdAt.toISOString(),
      }
    })

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
