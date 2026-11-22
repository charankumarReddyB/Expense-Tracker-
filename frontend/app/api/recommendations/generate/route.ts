export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  return NextResponse.json({
    total_potential_savings: 8200,
    recommendations: [
      {
        id: 'rec-1',
        type: 'subscription',
        title: 'Review Duplicate Cloud Subscriptions',
        description: 'You have active plans for both Google One and iCloud storage.',
        potential_savings: 650,
        difficulty: 'easy',
        category: 'Subscriptions',
        priority: 1,
        action_items: ['Cancel redundant cloud storage plan', 'Export older backup archives'],
      },
      {
        id: 'rec-2',
        type: 'dining',
        title: 'Batch Weekend Food Deliveries',
        description: 'Frequent small food delivery orders incurred ₹1,400 in delivery & surge fees last month.',
        potential_savings: 3200,
        difficulty: 'medium',
        category: 'Food & Dining',
        priority: 2,
        action_items: ['Cook at home 2 extra nights per week', 'Use store pick-up where available'],
      },
      {
        id: 'rec-3',
        type: 'utilities',
        title: 'Switch to Annual Broadband Plan',
        description: 'Your ISP offers a 20% discount on annual prepaid billing.',
        potential_savings: 4350,
        difficulty: 'easy',
        category: 'Utilities',
        priority: 3,
        action_items: ['Upgrade internet subscription from monthly to annual'],
      },
    ],
  })
}
