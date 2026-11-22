import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    anomalies: [
      {
        date: '2026-08-15',
        category: 'Shopping',
        amount: 14999,
        expected_range: '₹2,000 - ₹5,000',
        impact_on_forecast: '+4.2%',
      },
    ],
  })
}
