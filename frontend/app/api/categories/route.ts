export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    })

    const formatted = categories.map((cat) => ({
      category_id: cat.id,
      name: cat.name,
      icon: cat.icon || '📁',
      color: cat.color || '#3B82F6',
      keywords: cat.keywords || '',
      is_custom: cat.isCustom,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Categories error:', error)
    return NextResponse.json({ detail: 'Failed to fetch categories' }, { status: 500 })
  }
}
