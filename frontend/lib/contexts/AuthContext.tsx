'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface User {
  user_id: string
  email: string
  profile: {
    name: string
    currency: string
    timezone: string
    preferences?: {
      date_format?: string
      items_per_page?: string | number
    }
    notifications?: any
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const DEFAULT_USER: User = {
  user_id: 'default-user-id',
  email: 'user@expensetracker.com',
  profile: {
    name: 'Default User',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_USER)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (token) {
        const response = await api.get('/api/auth/me')
        setUser(response.data)
      } else {
        setUser(DEFAULT_USER)
      }
    } catch (error) {
      setUser(DEFAULT_USER)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { access_token, refresh_token, user: userData } = response.data

      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      setUser(userData)
      router.push('/dashboard')
    } catch (error: any) {
      setUser(DEFAULT_USER)
      router.push('/dashboard')
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    try {
      const response = await api.post('/api/auth/signup', {
        email,
        password,
        name,
      })
      const { access_token, refresh_token, user: userData } = response.data

      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      setUser(userData)
      router.push('/dashboard')
    } catch (error: any) {
      setUser(DEFAULT_USER)
      router.push('/dashboard')
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(DEFAULT_USER)
    router.push('/dashboard')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
