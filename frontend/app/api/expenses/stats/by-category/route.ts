import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        NOT: { name: 'Salary & Income' }
      }
    })

    const result = []

    for (const cat of categories) {
      const expenses = await prisma.expense.findMany({
        where: { categoryId: cat.id }
      })

      const total = expenses.reduce((sum, e) => sum + e.amount, 0)
      if (total > 0) {
        result.push({
          category_id: cat.id,
          name: cat.name,
          icon: cat.icon || '📁',
          color: cat.color || '#3B82F6',
          total,
          count: expenses.length,
          percentage: 0
        })
      }
    }

    const overallTotal = result.reduce((sum, item) => sum + item.total, 0)
    result.forEach((item) => {
      item.percentage = overallTotal > 0 ? Math.round((item.total / overallTotal) * 100) : 0
    })

    result.sort((a, b) => b.total - a.total)

    return NextResponse.json({ categories: result })
  } catch (error) {
    console.error('By-category stats error:', error)
    return NextResponse.json({ detail: 'Failed to fetch category stats' }, { status: 500 })
  }
}
