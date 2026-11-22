import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    insights: [
      {
        type: 'seasonal_spike',
        category: 'Shopping',
        title: 'Anticipated Festive Spending',
        description: 'Historical records show November and December spending rises by ~15% due to holidays.',
        action: 'Allocate ₹15,000 to seasonal buffer in November.',
        priority: 'high',
      },
      {
        type: 'budget_trend',
        category: 'Food & Dining',
        title: 'Steady Dining Out Stabilization',
        description: 'Dining out expenditures have leveled off across the last 60 days.',
        action: 'Maintain current weekly meal prep schedule.',
        priority: 'medium',
      },
    ],
  })
}
