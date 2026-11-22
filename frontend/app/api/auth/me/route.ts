import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'dev-secret-key-change-in-production'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    let payload
    try {
      payload = jwt.verify(token, JWT_SECRET) as any
    } catch (e) {
      return NextResponse.json({ detail: 'Invalid or expired token' }, { status: 401 })
    }

    if (payload.type !== 'access') {
      return NextResponse.json({ detail: 'Invalid token type' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub }
    })

    if (!user) {
      return NextResponse.json({ detail: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user_id: user.id,
      email: user.email,
      profile: {
        name: user.name,
        currency: 'INR',
        timezone: 'Asia/Kolkata'
      }
    })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 })
  }
}
