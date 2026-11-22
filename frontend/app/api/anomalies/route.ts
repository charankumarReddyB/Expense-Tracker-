export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const anomalies = await prisma.anomaly.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const formatted = anomalies.map((a) => ({
      anomaly_id: a.id,
      description: a.description,
      severity: a.severity,
      resolved: a.resolved,
      created_at: a.createdAt.toISOString(),
    }))

    return NextResponse.json({ anomalies: formatted })
  } catch (error) {
    console.error('Anomalies error:', error)
    return NextResponse.json({ detail: 'Failed to fetch anomalies' }, { status: 500 })
  }
}
