export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    const msgLower = (message || '').toLowerCase()

    let response = "I'm your Smart Expense Assistant. I can help analyze your spending, check budgets, and suggest savings!"

    if (msgLower.includes('spend') || msgLower.includes('how much') || msgLower.includes('total')) {
      const expenses = await prisma.expense.findMany({
        where: {
          NOT: { category: { name: 'Salary & Income' } }
        }
      })
      const total = expenses.reduce((sum, e) => sum + e.amount, 0)
      response = `You have recorded a total of ₹${total.toLocaleString('en-IN')} across ${expenses.length} transactions.`
    } else if (msgLower.includes('budget')) {
      response = "Your monthly budgets are mostly on track! Food & Dining has used 68% of its allocated limit, leaving you with healthy margin."
    } else if (msgLower.includes('unusual') || msgLower.includes('fraud') || msgLower.includes('alert')) {
      const anomalies = await prisma.anomaly.findMany()
      response = `There are ${anomalies.length} flagged transaction alerts currently under review. Most recent: "${anomalies[0]?.description || 'None'}"`
    } else if (msgLower.includes('save') || msgLower.includes('tip')) {
      response = "Top saving tip: Reducing weekend food delivery orders by 2 days a week can save approximately ₹3,200/month."
    }

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
      suggestions: ['Check monthly trends', 'View top category', 'Review active budgets'],
    })
  } catch (error) {
    return NextResponse.json({
      response: "I'm available to help with your expense questions!",
      timestamp: new Date().toISOString(),
    })
  }
}
