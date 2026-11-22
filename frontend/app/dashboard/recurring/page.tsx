'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Plus,
  RefreshCw,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react'

interface RecurringExpense {
  recurring_id: string
  name: string
  description: string
  amount: number
  currency: string
  merchant: string
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
  next_due_date: string
  is_auto_detected: boolean
  detection_confidence: number
  is_active: boolean
  category: {
    category_id: string
    name: string
    icon: string
    color: string
  }
  alert_days_before: number
}

interface UpcomingBill {
  recurring_id: string
  name: string
  amount: number
  currency: string
  next_due_date: string
  days_until_due: number
  category_name: string
  category_icon: string
}

interface DetectedPattern {
  merchant: string
  average_amount: number
  occurrence_count: number
  frequency: string
  confidence_score: number
  last_transaction_date: string
  category_name: string
}

export default function RecurringExpensesPage() {
  const [recurring, setRecurring] = useState<RecurringExpense[]>([])
  const [upcomingBills, setUpcomingBills] = useState<UpcomingBill[]>([])
  const [detectedPatterns, setDetectedPatterns] = useState<DetectedPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPatternsModal, setShowPatternsModal] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    merchant: '',
    category_id: '',
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    alert_days_before: '3'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [recurringRes, billsRes, categoriesRes] = await Promise.all([
        api.get('/api/recurring/?is_active=true'),
        api.get('/api/recurring/upcoming/bills?days_ahead=30'),
        api.get('/api/categories/')
      ])
      const recurringData = Array.isArray(recurringRes.data)
        ? recurringRes.data
        : recurringRes.data?.items || recurringRes.data?.recurring || []
      const billsData = Array.isArray(billsRes.data)
        ? billsRes.data
        : billsRes.data?.bills || []
      const categoriesData = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : categoriesRes.data?.categories || []

      setRecurring(recurringData)
      setUpcomingBills(billsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to fetch recurring expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const detectPatterns = async () => {
    try {
      const response = await api.post('/api/recurring/detect-patterns', {
        lookback_months: 6,
        min_occurrences: 3,
        amount_tolerance: 0.1
      })
      setDetectedPatterns(response.data || [])
      setShowPatternsModal(true)
    } catch (error) {
      console.error('Failed to detect patterns:', error)
    }
  }

  const createFromPattern = async (pattern: DetectedPattern) => {
    try {
      await api.post('/api/recurring/create-from-pattern', {
        merchant: pattern.merchant,
        frequency: pattern.frequency,
        lookback_months: 6
      })
      setShowPatternsModal(false)
      fetchData()
    } catch (error) {
      console.error('Failed to create recurring expense:', error)
    }
  }

  const handleAddRecurring = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/recurring/', {
        ...formData,
        amount: parseFloat(formData.amount),
        alert_days_before: parseInt(formData.alert_days_before)
      })
      setShowAddModal(false)
      setFormData({
        name: '',
        description: '',
        amount: '',
        merchant: '',
        category_id: '',
        frequency: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        alert_days_before: '3'
      })
      fetchData()
    } catch (error) {
      console.error('Failed to add recurring expense:', error)
    }
  }

  const deleteRecurring = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring expense?')) return
    try {
      await api.delete(`/api/recurring/${id}`)
      fetchData()
    } catch (error) {
      console.error('Failed to delete recurring expense:', error)
    }
  }

  const getFrequencyBadge = (frequency: string) => {
    const colors: any = {
      daily: 'bg-purple-500/10 text-purple-500',
      weekly: 'bg-blue-500/10 text-blue-500',
      biweekly: 'bg-cyan-500/10 text-cyan-500',
      monthly: 'bg-green-500/10 text-green-500',
      quarterly: 'bg-yellow-500/10 text-yellow-500',
      yearly: 'bg-orange-500/10 text-orange-500'
    }
    return colors[frequency] || colors.monthly
  }

  const getDaysUntilColor = (days: number) => {
    if (days <= 3) return 'text-red-500'
    if (days <= 7) return 'text-yellow-500'
    return 'text-gray-400'
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Recurring Expenses</h1>
          <div className="flex gap-3">
            <button
              onClick={detectPatterns}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Detect Patterns
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#BFF549] text-black hover:bg-[#a8d93d] rounded-lg transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Recurring
            </button>
          </div>
        </div>
        <p className="text-gray-400">
          Manage subscriptions and recurring payments
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-[#BFF549]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Bills */}
          <div className="lg:col-span-1">
            <div className="bg-[#151B2E] rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#BFF549]" />
                Upcoming Bills
              </h2>
              <div className="space-y-3">
                {upcomingBills.slice(0, 10).map((bill) => (
                  <div
                    key={bill.recurring_id}
                    className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{bill.category_icon}</span>
                          <span className="font-medium">{bill.name}</span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {formatDate(bill.next_due_date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(bill.amount, bill.currency)}
                        </div>
                        <div className={`text-xs ${getDaysUntilColor(bill.days_until_due)}`}>
                          {bill.days_until_due === 0 ? 'Today' : `${bill.days_until_due}d`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {upcomingBills.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No upcoming bills</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recurring Expenses List */}
          <div className="lg:col-span-2">
            <div className="bg-[#151B2E] rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#BFF549]" />
                Active Recurring Expenses
              </h2>
              <div className="space-y-3">
                {recurring.map((item) => (
                  <div
                    key={item.recurring_id}
                    className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{item.category?.icon || '📅'}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{item.name || item.description}</h3>
                              {item.is_auto_detected && (
                                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  Auto-detected
                                </span>
                              )}
                            </div>
                            {item.merchant && (
                              <div className="text-sm text-gray-400">{item.merchant}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`px-3 py-1 rounded-full font-medium ${getFrequencyBadge(item.frequency || 'monthly')}`}>
                            {(item.frequency || 'monthly').charAt(0).toUpperCase() + (item.frequency || 'monthly').slice(1)}
                          </span>
                          <span className="text-gray-400">
                            Next: {formatDate(item.next_due_date)}
                          </span>
                          {item.is_auto_detected && (
                            <span className="text-gray-400">
                              {(item.detection_confidence ?? 90).toFixed(0)}% confidence
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xl font-semibold">
                            {formatCurrency(item.amount, item.currency || 'INR')}
                          </div>
                          <div className="text-sm text-gray-400">
                            {item.category?.name || 'Subscription'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteRecurring(item.recurring_id)}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {recurring.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No recurring expenses yet</p>
                    <p className="text-sm">Add one manually or detect patterns from your transactions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Recurring Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#151B2E] rounded-xl p-6 max-w-md w-full border border-white/10">
            <h2 className="text-2xl font-bold mb-4">Add Recurring Expense</h2>
            <form onSubmit={handleAddRecurring} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#BFF549]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#BFF549]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Merchant</label>
                <input
                  type="text"
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#BFF549]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#BFF549]"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Frequency *</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#BFF549]"
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#BFF549]"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#BFF549] text-black hover:bg-[#a8d93d] rounded-lg font-semibold transition-colors"
                >
                  Add Recurring
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detected Patterns Modal */}
      {showPatternsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#151B2E] rounded-xl p-6 max-w-2xl w-full border border-white/10 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              Detected Recurring Patterns
            </h2>
            {detectedPatterns.length > 0 ? (
              <div className="space-y-3">
                {detectedPatterns.map((pattern, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{pattern.merchant}</div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span>{pattern.category_name}</span>
                          <span className={`px-2 py-0.5 rounded-full ${getFrequencyBadge(pattern.frequency)}`}>
                            {pattern.frequency}
                          </span>
                          <span>{pattern.occurrence_count} transactions</span>
                          <span className="text-purple-400">{pattern.confidence_score.toFixed(0)}% confidence</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-4">
                          <div className="font-semibold">{formatCurrency(pattern.average_amount)}</div>
                          <div className="text-sm text-gray-400">avg amount</div>
                        </div>
                        <button
                          onClick={() => createFromPattern(pattern)}
                          className="px-4 py-2 bg-[#BFF549] text-black hover:bg-[#a8d93d] rounded-lg font-semibold transition-colors"
                        >
                          Create
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No recurring patterns detected</p>
                <p className="text-sm mt-2">Try adding more transactions or adjusting the detection settings</p>
              </div>
            )}
            <div className="mt-6">
              <button
                onClick={() => setShowPatternsModal(false)}
                className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
