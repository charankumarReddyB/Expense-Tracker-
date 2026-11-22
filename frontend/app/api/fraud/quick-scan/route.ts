export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    const anomalies = await prisma.anomaly.findMany()
    const alerts = anomalies.map((a, i) => ({
      alert_id: a.id,
      expense_id: a.expenseId || `quick-scan-${i}`,
      fraud_type: 'amount_anomaly',
      risk_level: 'medium' as const,
      confidence_score: 0.88,
      reason: a.description,
      detected_at: a.createdAt.toISOString(),
      is_false_positive: a.resolved,
      expense: {
        amount: 5400,
        currency: 'INR',
        description: a.description,
        merchant: 'QuickTransfer Online',
        date: a.createdAt.toISOString().split('T')[0],
        category_name: 'Shopping',
      },
    }))
    return NextResponse.json({ alerts })
  } catch (error) {
    return NextResponse.json({ detail: 'Failed quick scan' }, { status: 500 })
  }
}
