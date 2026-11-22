import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    insights: [
      {
        type: 'warning',
        priority: 'high',
        title: 'Holiday Spending Surge',
        category: 'Shopping',
        description: 'Historical records project a 15% increase in November & December shopping expenses.',
        action: 'Set a holiday shopping buffer of ₹15,000.',
      },
      {
        type: 'success',
        priority: 'medium',
        title: 'Dining Out Stabilizing',
        category: 'Food & Dining',
        description: 'Dining out expenditures have leveled off across the last 60 days.',
        action: 'Maintain current weekly home meal prep routine.',
      },
      {
        type: 'info',
        priority: 'low',
        title: 'Utility Bill Consistency',
        category: 'Utilities',
        description: 'Electricity and internet charges have stayed within 3% of baseline.',
        action: 'No budget adjustment necessary for upcoming cycle.',
      },
    ],
  })
}
