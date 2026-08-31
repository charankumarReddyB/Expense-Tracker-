'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Plus, TrendingUp, AlertCircle, CheckCircle, DollarSign, Loader2, Edit2, Trash2, Target, X } from 'lucide-react'

interface Budget {
  budget_id: string
  category_id: string
  category_name: string
  category_icon: string
  category_color: string
  limit_amount: number
  current_spent: number
  remaining: number
  percentage_used: number
  status: 'on_track' | 'warning' | 'exceeded'
  period: string
  start_date: string
  end_date: string
  alert_thresholds: number[]
}

interface BudgetSummary {
  total_budget: number
  total_spent: number
  total_remaining: number
  budgets_count: number
  on_track_count: number
  warning_count: number
  exceeded_count: number
}

interface Category {
  category_id: string
  name: string
  icon: string
  color: string
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    category_id: '',
    limit_amount: '',
    period: 'monthly',
    alert_thresholds: [80, 90, 100]
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [budgetsRes, summaryRes, categoriesRes] = await Promise.all([
        api.get('/api/budgets/?active_only=true'),
        api.get('/api/budgets/summary'),
        api.get('/api/categories/')
      ])
      
      setBudgets(budgetsRes.data)
      setSummary(summaryRes.data)
      setCategories(categoriesRes.data)
    } catch (error) {
      console.error('Failed to fetch budgets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBudget = async () => {
    try {
      await api.post('/api/budgets/', {
        category_id: formData.category_id,
        limit_amount: parseFloat(formData.limit_amount),
        period: formData.period,
        alert_thresholds: formData.alert_thresholds
      })
      
      setShowAddModal(false)
      setFormData({
        category_id: '',
        limit_amount: '',
        period: 'monthly',
        alert_thresholds: [80, 90, 100]
      })
      fetchData()
    } catch (error: any) {
      console.error('Failed to create budget:', error)
      alert(error.response?.data?.detail || 'Failed to create budget')
    }
  }

  const handleUpdateBudget = async () => {
    if (!selectedBudget) return
    
    try {
      await api.put(`/api/budgets/${selectedBudget.budget_id}`, {
        limit_amount: parseFloat(formData.limit_amount),
        alert_thresholds: formData.alert_thresholds
      })
      
      setShowEditModal(false)
      setSelectedBudget(null)
      fetchData()
    } catch (error: any) {
      console.error('Failed to update budget:', error)
      alert(error.response?.data?.detail || 'Failed to update budget')
    }
  }

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return
    
    try {
      await api.delete(`/api/budgets/${budgetId}`)
      fetchData()
    } catch (error: any) {
      console.error('Failed to delete budget:', error)
      alert(error.response?.data?.detail || 'Failed to delete budget')
    }
  }

  const openEditModal = (budget: Budget) => {
    setSelectedBudget(budget)
    setFormData({
      category_id: budget.category_id,
      limit_amount: budget.limit_amount.toString(),
      period: budget.period,
      alert_thresholds: budget.alert_thresholds
    })
    setShowEditModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-400'
      case 'exceeded':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track':
        return <CheckCircle className="w-5 h-5" />
      case 'warning':
        return <AlertCircle className="w-5 h-5" />
      case 'exceeded':
        return <AlertCircle className="w-5 h-5" />
      default:
        return null
    }
  }

  const totalBudget = summary?.total_budget || 0
  const totalSpent = summary?.total_spent || 0
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  
  const availableCategories = categories.filter(
    cat => !budgets.some(b => b.category_id === cat.category_id)
  )

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-accent-blue/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-accent-blue" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 rounded-xl ${percentUsed > 80 ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
              <CheckCircle className={`w-6 h-6 ${percentUsed > 80 ? 'text-red-400' : 'text-green-400'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Remaining</p>
              <p className="text-2xl font-bold">{formatCurrency(totalBudget - totalSpent)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Overall Budget Usage</h2>
          <span className={`text-2xl font-bold ${getStatusColor(percentUsed > 100 ? 'exceeded' : percentUsed > 80 ? 'warning' : 'on_track')}`}>
            {percentUsed.toFixed(0)}%
          </span>
        </div>
        <div className="h-4 bg-dark-elevated rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              percentUsed > 100
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : percentUsed > 80
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                : 'bg-gradient-to-r from-primary to-primary-dark'
            }`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Budgets List */}
      <div className="space-y-4">
        {budgets.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Budgets Yet</h3>
            <p className="text-gray-400 mb-6">Create your first budget to start tracking your spending</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-primary text-dark-bg font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Budget
            </button>
          </div>
        ) : (
          budgets.map((budget) => {
            const percentSpent = budget.percentage_used

            return (
              <div key={budget.budget_id} className="glass-card p-6 hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                      style={{ backgroundColor: `${budget.category_color}20` }}
                    >
                      {budget.category_icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{budget.category_name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{budget.period} Budget</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-2 ${getStatusColor(budget.status)}`}>
                      {getStatusIcon(budget.status)}
                      <span className="font-medium capitalize">{budget.status.replace('_', ' ')}</span>
                    </div>
                    <button
                      onClick={() => openEditModal(budget)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400 hover:text-primary" />
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(budget.budget_id)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {formatCurrency(budget.current_spent)} of {formatCurrency(budget.limit_amount)}
                    </span>
                    <span className={getStatusColor(budget.status)}>
                      {budget.remaining >= 0 ? `${formatCurrency(budget.remaining)} left` : `${formatCurrency(Math.abs(budget.remaining))} over`}
                    </span>
                  </div>

                  <div className="h-3 bg-dark-elevated rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        percentSpent > 100
                          ? 'bg-gradient-to-r from-red-500 to-red-600'
                          : percentSpent > 80
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                          : 'bg-gradient-to-r from-primary to-primary-dark'
                      }`}
                      style={{ width: `${Math.min(percentSpent, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-end">
                    <span className="text-lg font-bold">{percentSpent.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Budget Button */}
      {availableCategories.length > 0 && (
        <div 
          onClick={() => setShowAddModal(true)}
          className="glass-card p-8 text-center hover:border-primary/30 transition-all cursor-pointer"
        >
          <Plus className="w-12 h-12 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-1">Create New Budget</h3>
          <p className="text-gray-400 text-sm">Set spending limits for another category</p>
        </div>
      )}

      {/* Add Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Create New Budget</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-white/5 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                >
                  <option value="">Select a category</option>
                  {availableCategories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Budget Amount</label>
                <input
                  type="number"
                  value={formData.limit_amount}
                  onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
                  placeholder="10000"
                  className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Period</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBudget}
                  disabled={!formData.category_id || !formData.limit_amount}
                  className="flex-1 px-4 py-2 bg-primary text-dark-bg font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Budget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {showEditModal && selectedBudget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Edit Budget</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-white/5 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <div className="flex items-center space-x-2 px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg">
                  <span className="text-2xl">{selectedBudget.category_icon}</span>
                  <span>{selectedBudget.category_name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Budget Amount</label>
                <input
                  type="number"
                  value={formData.limit_amount}
                  onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBudget}
                  disabled={!formData.limit_amount}
                  className="flex-1 px-4 py-2 bg-primary text-dark-bg font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Budget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
