export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    focus_areas: [
      { id: 'all', name: 'All Categories', description: 'Holistic savings overview', icon: '✨' },
      { id: 'subscriptions', name: 'Subscriptions', description: 'Recurring membership optimization', icon: '🔄' },
      { id: 'dining', name: 'Food & Dining', description: 'Grocery and restaurant reduction', icon: '🍽️' },
      { id: 'utilities', name: 'Utilities', description: 'Power and data plan savings', icon: '⚡' },
    ],
  })
}
