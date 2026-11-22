export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    const anomalies = await prisma.anomaly.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const alerts = anomalies.map((a, i) => ({
      alert_id: a.id,
      expense_id: a.expenseId || `mock-exp-${i}`,
      fraud_type: 'amount_anomaly',
      risk_level: (a.severity.toLowerCase() === 'high' ? 'high' : 'medium') as 'low' | 'medium' | 'high' | 'critical',
      confidence_score: 94.5,
      reason: a.description,
      detected_at: a.createdAt.toISOString(),
      is_false_positive: a.resolved,
      expense: {
        amount: 8500,
        currency: 'INR',
        description: a.description,
        merchant: 'Unusual Online Merchant',
        date: a.createdAt.toISOString().split('T')[0],
        category_name: 'Shopping',
      },
    }))

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Fraud analyze error:', error)
    return NextResponse.json({ detail: 'Failed to analyze fraud' }, { status: 500 })
  }
}
