export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const anomalies = await prisma.anomaly.findMany()

    return NextResponse.json({
      total_alerts: anomalies.length,
      by_risk_level: {
        low: 0,
        medium: anomalies.filter((a) => a.severity.toLowerCase() !== 'high').length,
        high: anomalies.filter((a) => a.severity.toLowerCase() === 'high').length,
        critical: 0,
      },
      by_fraud_type: {
        amount_anomaly: anomalies.length,
      },
      false_positive_rate: 0.05,
      suspicious_merchants: ['GlobalTech Mart', 'QuickTransfer Online'],
    })
  } catch (error) {
    console.error('Fraud stats error:', error)
    return NextResponse.json({ detail: 'Failed to get fraud stats' }, { status: 500 })
  }
}
