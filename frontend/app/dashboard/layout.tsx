'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  RefreshCw,
  FileText,
  Upload,
  Shield,
  Target
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { getInitials } from '@/lib/utils'
import AIAssistantWidget from '@/components/AIAssistantWidget'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Receipt, label: 'Expenses', href: '/dashboard/expenses' },
  { icon: RefreshCw, label: 'Recurring', href: '/dashboard/recurring' },
  { icon: PiggyBank, label: 'Budgets', href: '/dashboard/budgets' },
  { icon: Target, label: 'Goals', href: '/dashboard/goals' },
  { icon: Sparkles, label: 'Recommendations', href: '/dashboard/recommendations' },
  { icon: TrendingUp, label: 'Forecasting', href: '/dashboard/forecasting' },
  { icon: TrendingUp, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
  { icon: Upload, label: 'Import/Export', href: '/dashboard/import-export' },
  { icon: Shield, label: 'Fraud Detection', href: '/dashboard/fraud' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Direct access allowed without login
  }, [user, loading])

  const activeUser = user || {
    user_id: 'default-user-id',
    email: 'user@expensetracker.com',
    profile: {
      name: 'Default User',
      currency: 'INR',
      timezone: 'Asia/Kolkata'
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-card border-r border-dark-border transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-dark-border">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold gradient-text">ExpenseAI</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-gray-400 hover:text-white hover:bg-dark-elevated'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-dark-border">
            <div className="glass-card p-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent-purple flex items-center justify-center text-dark-bg font-semibold">
                  {getInitials(activeUser.profile.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{activeUser.profile.name}</div>
                  <div className="text-xs text-gray-400 truncate">{activeUser.email}</div>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-dark-card/80 backdrop-blur-xl border-b border-dark-border">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-dark-elevated transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex-1 lg:ml-0 ml-4">
              <h1 className="text-2xl font-bold">
                {navItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm text-gray-400">Balance</div>
                <div className="text-lg font-semibold text-primary">₹45,230</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* AI Assistant Widget */}
      <AIAssistantWidget />
    </div>
  )
}
