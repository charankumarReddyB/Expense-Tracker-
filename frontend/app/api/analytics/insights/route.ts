import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    insights: [
      {
        type: 'positive',
        title: 'Dining Out Reduced',
        message: 'Your spending on food & dining is down 18% compared to last month!',
      },
      {
        type: 'warning',
        title: 'Utility Bill Spike',
        message: 'Electricity expense was ₹4,200 higher than your 3-month rolling average.',
      },
      {
        type: 'tip',
        title: 'Budget Allocation',
        message: 'You have ₹8,500 remaining in your entertainment budget for this cycle.',
      },
    ],
  })
}
