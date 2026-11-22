import { NextResponse } from 'next/server'

export async function GET() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const pattern = days.map((day_of_week) => ({
    day_of_week,
    amount: Math.round(1500 + Math.random() * 2500),
  }))

  return NextResponse.json(pattern)
}
