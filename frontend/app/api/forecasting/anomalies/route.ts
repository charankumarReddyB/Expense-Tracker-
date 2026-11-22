import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    anomalies: [
      {
        month: 'August 2026',
        severity: 'moderate',
        amount: 14999,
        type: 'high',
        deviation: 4200,
        expected_range: '₹8,000 - ₹11,000',
        impact_on_forecast: '+4.2%',
      },
      {
        month: 'July 2026',
        severity: 'extreme',
        amount: 22400,
        type: 'high',
        deviation: 8600,
        expected_range: '₹12,000 - ₹14,000',
        impact_on_forecast: '+6.1%',
      },
    ],
  })
}
