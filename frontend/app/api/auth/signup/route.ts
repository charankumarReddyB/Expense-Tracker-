import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'dev-secret-key-change-in-production'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json({ detail: 'Email and password are required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ detail: 'Email already registered' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || ''
      }
    })

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
    }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 })
  }
}
