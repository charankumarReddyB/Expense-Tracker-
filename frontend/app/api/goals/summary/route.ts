import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const goals = await prisma.goal.findMany()
    const total_goals = goals.length
    const active_goals = goals.filter((g) => g.currentAmount < g.targetAmount).length
    const completed_goals = goals.filter((g) => g.currentAmount >= g.targetAmount).length
    const total_target_amount = goals.reduce((sum, g) => sum + g.targetAmount, 0)
    const total_saved_amount = goals.reduce((sum, g) => sum + g.currentAmount, 0)
    const overall_progress = total_target_amount > 0 ? (total_saved_amount / total_target_amount) * 100 : 0

    return NextResponse.json({
      total_goals,
      active_goals,
      completed_goals,
      total_target_amount,
      total_saved_amount,
      overall_progress,
    })
  } catch (error) {
    console.error('Goals summary error:', error)
    return NextResponse.json({ detail: 'Failed to fetch goal summary' }, { status: 500 })
  }
}
