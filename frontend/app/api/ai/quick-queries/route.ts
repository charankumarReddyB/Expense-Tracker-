export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    queries: [
      { id: '1', label: 'How much did I spend this month?', query: 'How much did I spend this month?', icon: 'DollarSign' },
      { id: '2', label: 'Am I within budget?', query: 'Am I within budget?', icon: 'Target' },
      { id: '3', label: 'Any unusual expenses?', query: 'Check for unusual transactions', icon: 'AlertCircle' },
      { id: '4', label: 'Tips to save more', query: 'Give me 3 personalized savings tips', icon: 'Lightbulb' },
    ],
  })
}
