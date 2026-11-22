'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatCurrency, getCategoryColor } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Target,
  AlertCircle,
  CheckCircle2,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts'

interface Stats {
  total_amount: number
  expense_count: number
  average_expense: number
  month_comparison: number
  category_breakdown: Record<string, number>
  period: {
    month: number | null
    year: number | null
  }
}

interface RecentExpense {
  expense_id: string
  amount: number
  description: string
  merchant: string
  date: string
  category: {
    name: string
    icon: string
  }
}

interface BudgetSummary {
  total_budget: number
  total_spent: number
  total_remaining: number
  percentage_used: number
  budgets_count: number
  on_track_count: number
  warning_count: number
  exceeded_count: number
}

interface Goal {
  goal_id: string
  name: string
  target_amount: number
  current_amount: number
  deadline: string
  priority: string
}

interface CategoryBreakdown {
  category_id: string
  name: string
  icon: string
  color: string
  total: number
  count: number
  percentage: number
}

interface MonthlyTrend {
  month: number
  year: number
  total: number
  count: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentExpenses, setRecentExpenses] = useState<RecentExpense[]>([])
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyTrend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()
      
      const [statsRes, expensesRes, budgetsRes, goalsRes, categoryRes, trendRes] = await Promise.all([
        api.get(`/api/expenses/stats/summary?month=${currentMonth}&year=${currentYear}`),
        api.get('/api/expenses/?page=1&page_size=5'),
        api.get('/api/budgets/summary').catch(() => ({ data: null })),
        api.get('/api/goals?page=1&page_size=3').catch(() => ({ data: { goals: [] } })),
        api.get('/api/expenses/stats/by-category?page=1&page_size=5').catch(() => ({ data: { categories: [] } })),
        api.get('/api/expenses/stats/monthly-trend?months=6').catch(() => ({ data: { trends: [] } }))
      ])
      
      setStats(statsRes.data)
      setRecentExpenses(expensesRes.data.expenses)
      setBudgetSummary(budgetsRes.data)
      setGoals(goalsRes.data.goals || [])
      setCategoryData(categoryRes.data.categories || [])
      setMonthlyData(trendRes.data.trends || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate budget health percentage
  const budgetHealthPercentage = budgetSummary && budgetSummary.total_budget > 0
    ? Math.round((budgetSummary.total_spent / budgetSummary.total_budget) * 100)
    : 0

  // Calculate financial health score (0-100)
  const calculateHealthScore = () => {
    if (!stats || !budgetSummary) return 0
    
    let score = 100
    
    // Penalize if over budget
    if (budgetHealthPercentage > 100) score -= 30
    else if (budgetHealthPercentage > 90) score -= 15
    else if (budgetHealthPercentage > 80) score -= 5
    
    // Reward if under budget significantly
    if (budgetHealthPercentage < 50) score += 10
    
    // Note: month_comparison not available in current API response
    // Future: Add trend analysis when API provides comparison data
    
    // Check goals progress
    const goalsOnTrack = goals.filter(g => 
      (g.current_amount / g.target_amount) * 100 >= 
      (Date.now() - new Date().getTime()) / (new Date(g.deadline).getTime() - new Date().getTime()) * 100
    ).length
    
    if (goalsOnTrack === goals.length && goals.length > 0) score += 10
    
    return Math.max(0, Math.min(100, score))
  }

  const healthScore = calculateHealthScore()
  
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  // Chart colors
  const COLORS = ['#BFF549', '#4ECDC4', '#FF6B6B', '#C7CEEA', '#A8E6CF', '#FFD93D']

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-6 animate-pulse">
            <div className="h-6 bg-dark-elevated rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-dark-elevated rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <span className={`text-xs flex items-center ${stats && stats.month_comparison > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {stats && stats.month_comparison > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +{(stats.month_comparison || 0).toFixed(1)}%
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 mr-1" />
                  {(stats?.month_comparison || 0).toFixed(1)}%
                </>
              )}
            </span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Total Expenses</h3>
          <p className="text-3xl font-bold">
            {stats ? formatCurrency(stats.total_amount) : '₹0'}
          </p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-accent-blue/10 rounded-xl group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-accent-blue" />
            </div>
            <span className="text-xs text-gray-400">This Month</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Transactions</h3>
          <p className="text-3xl font-bold">{stats?.expense_count || 0}</p>
          <p className="text-xs text-gray-500 mt-1">
            Avg: {stats ? formatCurrency(stats.average_expense) : '₹0'}
          </p>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-accent-purple/10 rounded-xl group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-accent-purple" />
            </div>
            <span className={`text-xs font-medium ${getHealthColor(healthScore)}`}>
              {getHealthLabel(healthScore)}
            </span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Financial Health</h3>
          <p className={`text-3xl font-bold ${getHealthColor(healthScore)}`}>
            {healthScore}%
          </p>
          <div className="mt-2 h-1.5 bg-dark-elevated rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${healthScore >= 80 ? 'bg-green-400' : healthScore >= 60 ? 'bg-yellow-400' : healthScore >= 40 ? 'bg-orange-400' : 'bg-red-400'}`}
              style={{ width: `${healthScore}%` }}
            ></div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-accent-pink/10 rounded-xl group-hover:scale-110 transition-transform">
              {budgetSummary && budgetSummary.exceeded_count > 0 ? (
                <AlertCircle className="w-6 h-6 text-red-400" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              )}
            </div>
            <span className="text-xs text-gray-400">
              {budgetHealthPercentage}% used
            </span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Budget Remaining</h3>
          <p className={`text-3xl font-bold ${budgetSummary && budgetSummary.total_remaining < 0 ? 'text-red-400' : 'text-primary'}`}>
            {budgetSummary ? formatCurrency(Math.abs(budgetSummary.total_remaining)) : '₹0'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {budgetSummary && budgetSummary.exceeded_count > 0 
              ? `${budgetSummary.exceeded_count} budget(s) exceeded` 
              : 'All on track'}
          </p>
        </div>
      </div>

      {/* Goals Progress Widget */}
      {goals.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary" />
              Active Goals
            </h2>
            <Link href="/dashboard/goals">
              <button className="text-primary hover:text-primary-dark transition-colors text-sm font-medium">
                View All →
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map((goal) => {
              const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
              const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              
              return (
                <div key={goal.goal_id} className="p-4 bg-dark-elevated/50 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-sm">{goal.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      goal.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                      goal.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {goal.priority}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="font-medium">{(progress || 0).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-dark-elevated rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent-blue transition-all"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatCurrency(goal.current_amount)}</span>
                      <span>{formatCurrency(goal.target_amount)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6">Spending Trend</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData.map(d => ({
                month: new Date(d.year, d.month - 1).toLocaleDateString('en-US', { month: 'short' }),
                amount: d.total
              }))}>
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1D24',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#BFF549"
                  strokeWidth={3}
                  dot={{ fill: '#BFF549', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              <p>No data available</p>
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6">Category Distribution</h2>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData.map((cat, idx) => ({
                      name: cat.name,
                      value: cat.total,
                      color: COLORS[idx % COLORS.length]
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1D24',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {categoryData.slice(0, 4).map((cat, idx) => (
                  <div key={cat.name} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    ></div>
                    <span className="text-sm text-gray-400 truncate">{cat.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              <p>No category data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Link href="/dashboard/expenses">
            <button className="text-primary hover:text-primary-dark transition-colors text-sm font-medium">
              View All →
            </button>
          </Link>
        </div>

        <div className="space-y-3">
          {recentExpenses.length > 0 ? (
            recentExpenses.map((expense) => (
              <div
                key={expense.expense_id}
                className="flex items-center justify-between p-4 bg-dark-elevated/50 hover:bg-dark-elevated rounded-xl transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent-purple/20 flex items-center justify-center text-2xl">
                    {expense.category?.icon || '📁'}
                  </div>
                  <div>
                    <h3 className="font-medium">{expense.description}</h3>
                    <p className="text-sm text-gray-400">
                      {expense.merchant} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">{formatCurrency(expense.amount)}</p>
                  <p className="text-xs text-gray-400">{expense.category?.name}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No expenses yet</p>
              <Link href="/dashboard/expenses">
                <button className="glass-button">
                  <Plus className="w-5 h-5 mr-2 inline" />
                  Add Expense
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/expenses?action=add">
          <div className="glass-card p-6 hover:border-primary/30 transition-all cursor-pointer group">
            <Plus className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-1">Add Expense</h3>
            <p className="text-sm text-gray-400">Record a new transaction</p>
          </div>
        </Link>

        <Link href="/dashboard/budgets?action=create">
          <div className="glass-card p-6 hover:border-accent-blue/30 transition-all cursor-pointer group">
            <DollarSign className="w-8 h-8 text-accent-blue mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-1">Set Budget</h3>
            <p className="text-sm text-gray-400">Create spending limits</p>
          </div>
        </Link>

        <Link href="/dashboard/analytics">
          <div className="glass-card p-6 hover:border-accent-purple/30 transition-all cursor-pointer group">
            <TrendingUp className="w-8 h-8 text-accent-purple mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-1">View Analytics</h3>
            <p className="text-sm text-gray-400">Detailed insights</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
