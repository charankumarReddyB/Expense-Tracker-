export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json([
    {
      merchant: 'Netflix',
      average_amount: 649,
      occurrence_count: 6,
      frequency: 'monthly',
      confidence_score: 98,
      last_transaction_date: '2026-11-15',
      category_name: 'Entertainment',
    },
    {
      merchant: 'Spotify Premium',
      average_amount: 119,
      occurrence_count: 5,
      frequency: 'monthly',
      confidence_score: 95,
      last_transaction_date: '2026-11-08',
      category_name: 'Entertainment',
    },
  ])
}
