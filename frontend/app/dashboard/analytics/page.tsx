'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  AreaChart
} from 'recharts'
import { TrendingUp, TrendingDown, Calendar, DollarSign, Loader2 } from 'lucide-react'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [trends, setTrends] = useState<any>(null)
  const [categories, setCategories] = useState<any>(null)
  const [dayPattern, setDayPattern] = useState<any>(null)
  const [insights, setInsights] = useState<any>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      const [summaryRes, trendsRes, categoriesRes, dayPatternRes, insightsRes] = await Promise.all([
        api.get('/api/analytics/summary'),
        api.get('/api/analytics/trends?period=monthly&periods=6'),
        api.get('/api/analytics/categories'),
        api.get('/api/analytics/day-pattern?weeks=4'),
        api.get('/api/analytics/insights')
      ])

      setSummary(summaryRes.data)
      setTrends(trendsRes.data)
      setCategories(categoriesRes.data)
      setDayPattern(dayPatternRes.data)
      setInsights(insightsRes.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  // Format data for charts
  const monthlyData = trends?.data_points.map((dp: any) => ({
    month: dp.period.split(' ')[0],
    expenses: dp.amount,
    transactions: dp.transaction_count
  })) || []

  const categoryComparison = categories?.categories.slice(0, 5).map((cat: any) => ({
    category: cat.category_name,
    amount: cat.amount,
    percentage: cat.percentage
  })) || []

  const weeklySpending = dayPattern?.map((dp: any) => ({
    day: dp.day_of_week.substring(0, 3),
    amount: dp.amount
  })) || []

  // Category pie chart colors
  const COLORS = ['#BFF549', '#4ECDC4', '#FFE66D', '#A8E6CF', '#95E1D3', '#FF6B6B']

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Avg. Daily Spending</p>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-3xl font-bold mb-1">₹{summary?.daily_average.toFixed(0) || 0}</p>
          <p className={`text-xs ${summary?.comparison_last_month < 0 ? 'text-green-400' : 'text-red-400'}`}>
            {summary?.comparison_last_month ? `${summary.comparison_last_month > 0 ? '+' : ''}${summary.comparison_last_month.toFixed(1)}% from last month` : 'No comparison data'}
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Top Category</p>
            <DollarSign className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-3xl font-bold mb-1">₹{summary?.top_category_amount?.toFixed(0) || 0}</p>
          <p className="text-xs text-gray-400">{summary?.top_category || 'N/A'}</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Monthly Projection</p>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-bold mb-1">₹{summary?.monthly_projection?.toFixed(0) || 0}</p>
          <p className="text-xs text-primary">Based on current pace</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Transactions</p>
            <Calendar className="w-4 h-4 text-accent-blue" />
          </div>
          <p className="text-3xl font-bold mb-1">{summary?.total_transactions || 0}</p>
          <p className="text-xs text-accent-blue">This month</p>
        </div>
      </div>

      {/* Monthly Spending Trend */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-semibold mb-6">Monthly Spending Trend</h2>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#BFF549" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#BFF549" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1D24',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#BFF549"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorExpenses)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6">Top Categories</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryComparison}>
              <XAxis dataKey="category" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1D24',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
              />
              <Bar dataKey="amount" fill="#BFF549" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6">Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryComparison}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category} ${percentage.toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="percentage"
              >
                {categoryComparison.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1D24',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Spending Pattern */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6">Weekly Spending Pattern</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklySpending}>
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1D24',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Performance */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6">Budget Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-sm">On Track</span>
              </div>
              <span className="text-lg font-semibold">{summary?.budget_summary?.on_track || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-sm">Warning</span>
              </div>
              <span className="text-lg font-semibold">{summary?.budget_summary?.warning || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-sm">Exceeded</span>
              </div>
              <span className="text-lg font-semibold">{summary?.budget_summary?.exceeded || 0}</span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-sm text-gray-300">
              Total spending: <span className="font-bold text-primary">₹{summary?.total_spent?.toFixed(0) || 0}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Smart Insights */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-6">💡 Smart Insights</h2>
        {insights?.insights && insights.insights.length > 0 ? (
          <div className="space-y-4">
            {insights.insights.map((insight: any, index: number) => (
              <div
                key={index}
                className={`flex items-start space-x-4 p-4 rounded-xl border ${
                  insight.type === 'positive'
                    ? 'bg-green-500/5 border-green-500/20'
                    : insight.type === 'warning'
                    ? 'bg-yellow-500/5 border-yellow-500/20'
                    : insight.type === 'tip'
                    ? 'bg-blue-500/5 border-blue-500/20'
                    : 'bg-primary/5 border-primary/20'
                }`}
              >
                {insight.type === 'positive' ? (
                  <TrendingUp className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                ) : insight.type === 'warning' ? (
                  <TrendingDown className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                ) : (
                  <DollarSign className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                )}
                <div>
                  <p className={`font-semibold mb-1 ${
                    insight.type === 'positive' ? 'text-green-400' :
                    insight.type === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    {insight.title}
                  </p>
                  <p className="text-sm text-gray-300">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">
            No insights available yet. Start tracking expenses to see personalized insights!
          </p>
        )}
      </div>
    </div>
  )
}
