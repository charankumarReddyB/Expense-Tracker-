'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  X,
  Calendar
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface Expense {
  expense_id: string
  amount: number
  description: string
  merchant: string
  date: string
  category: {
    category_id: string
    name: string
    icon: string
    color: string
  }
}

interface Category {
  category_id: string
  name: string
  icon: string
  color: string
}

export default function ExpensesPage() {
  const searchParams = useSearchParams()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(searchParams.get('action') === 'add')
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [expensesRes, categoriesRes] = await Promise.all([
        api.get('/api/expenses/?page=1&page_size=50'),
        api.get('/api/categories/'),
      ])
      setExpenses(expensesRes.data.expenses || [])
      setCategories(categoriesRes.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/expenses/', {
        ...formData,
        amount: parseFloat(formData.amount),
      })
      setShowAddModal(false)
      setFormData({
        amount: '',
        description: '',
        merchant: '',
        date: new Date().toISOString().split('T')[0],
        category_id: '',
      })
      fetchData()
    } catch (error) {
      console.error('Failed to add expense:', error)
    }
  }

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExpense) return

    try {
      await api.put(`/api/expenses/${selectedExpense.expense_id}`, {
        ...formData,
        amount: parseFloat(formData.amount),
      })
      setShowEditModal(false)
      setSelectedExpense(null)
      fetchData()
    } catch (error) {
      console.error('Failed to update expense:', error)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    try {
      await api.delete(`/api/expenses/${id}`)
      fetchData()
    } catch (error) {
      console.error('Failed to delete expense:', error)
    }
  }

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.merchant?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || expense.category?.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-glass w-full pl-11"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-glass w-full sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        <button onClick={() => setShowAddModal(true)} className="glass-button whitespace-nowrap">
          <Plus className="w-5 h-5 mr-2 inline" />
          Add Expense
        </button>
      </div>

      {/* Expenses List */}
      <div className="glass-card">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredExpenses.length > 0 ? (
          <div className="divide-y divide-dark-border">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.expense_id}
                className="p-6 hover:bg-dark-elevated/30 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${expense.category?.color}20` }}
                    >
                      {expense.category?.icon || '📁'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{expense.description}</h3>
                      <p className="text-sm text-gray-400">
                        {expense.merchant && `${expense.merchant} • `}
                        {expense.category?.name} • {formatDate(expense.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(expense.amount)}</p>
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSelectedExpense(expense)
                          setFormData({
                            amount: expense.amount.toString(),
                            description: expense.description,
                            merchant: expense.merchant || '',
                            date: expense.date,
                            category_id: expense.category?.category_id || '',
                          })
                          setShowEditModal(true)
                        }}
                        className="p-2 hover:bg-dark-elevated rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5 text-primary" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.expense_id)}
                        className="p-2 hover:bg-dark-elevated rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-400 mb-4">No expenses found</p>
            <button onClick={() => setShowAddModal(true)} className="glass-button">
              <Plus className="w-5 h-5 mr-2 inline" />
              Add Your First Expense
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {showEditModal ? 'Edit Expense' : 'Add Expense'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                  setSelectedExpense(null)
                }}
                className="p-2 hover:bg-dark-elevated rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={showEditModal ? handleUpdateExpense : handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-glass w-full"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-glass w-full"
                  placeholder="What did you buy?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Merchant (Optional)</label>
                <input
                  type="text"
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  className="input-glass w-full"
                  placeholder="Store or vendor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="input-glass w-full"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-glass w-full"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                    setSelectedExpense(null)
                  }}
                  className="flex-1 px-6 py-3 border border-white/10 rounded-xl hover:bg-dark-elevated transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="glass-button flex-1">
                  {showEditModal ? 'Update' : 'Add'} Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
