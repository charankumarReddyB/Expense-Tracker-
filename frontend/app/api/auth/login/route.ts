import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'dev-secret-key-change-in-production'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ detail: 'Email and password are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ detail: 'Invalid email or password' }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ detail: 'Invalid email or password' }, { status: 401 })
    }

    const access_token = jwt.sign({ sub: user.id, type: 'access' }, JWT_SECRET, { expiresIn: '15m' })
    const refresh_token = jwt.sign({ sub: user.id, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' })

    const userData = {
      user_id: user.id,
      email: user.email,
      profile: {
        name: user.name,
        currency: 'INR',
        timezone: 'Asia/Kolkata'
      }
    }

    return NextResponse.json({
      access_token,
      refresh_token,
      user: userData
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 })
  }
}
