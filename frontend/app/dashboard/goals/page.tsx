'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Plus, Target, TrendingUp, CheckCircle, Clock, 
  Edit2, Trash2, Loader2, X, DollarSign, Calendar,
  Trophy, Flag, Zap
} from 'lucide-react'

interface Goal {
  goal_id: string
  name: string
  description: string
  target_amount: number
  current_amount: number
  target_date: string | null
  status: 'active' | 'paused' | 'completed' | 'abandoned'
  priority: number
  milestones: any[]
  progress_percentage: number
  days_remaining: number | null
  projected_completion_date: string | null
  is_on_track: boolean
  created_at: string
}

interface GoalSummary {
  total_goals: number
  active_goals: number
  completed_goals: number
  total_target_amount: number
  total_saved_amount: number
  overall_progress: number
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [summary, setSummary] = useState<GoalSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    target_date: '',
    priority: 3
  })

  const [progressAmount, setProgressAmount] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [goalsRes, summaryRes] = await Promise.all([
        api.get('/api/goals/?include_completed=true'),
        api.get('/api/goals/summary')
      ])
      
      setGoals(Array.isArray(goalsRes.data) ? goalsRes.data : (goalsRes.data?.goals || []))
      setSummary(summaryRes.data)
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddGoal = async () => {
    try {
      await api.post('/api/goals/', {
        name: formData.name,
        description: formData.description,
        target_amount: parseFloat(formData.target_amount),
        target_date: formData.target_date || null,
        priority: formData.priority
      })
      
      setShowAddModal(false)
      setFormData({
        name: '',
        description: '',
        target_amount: '',
        target_date: '',
        priority: 3
      })
      fetchData()
    } catch (error: any) {
      console.error('Failed to create goal:', error)
      alert(error.response?.data?.detail || 'Failed to create goal')
    }
  }

  const handleUpdateGoal = async () => {
    if (!selectedGoal) return
    
    try {
      await api.put(`/api/goals/${selectedGoal.goal_id}`, {
        name: formData.name,
        description: formData.description,
        target_amount: parseFloat(formData.target_amount),
        target_date: formData.target_date || null,
        priority: formData.priority
      })
      
      setShowEditModal(false)
      setSelectedGoal(null)
      fetchData()
    } catch (error: any) {
      console.error('Failed to update goal:', error)
      alert(error.response?.data?.detail || 'Failed to update goal')
    }
  }

  const handleAddProgress = async () => {
    if (!selectedGoal) return
    
    try {
      await api.post(`/api/goals/${selectedGoal.goal_id}/progress`, {
        amount: parseFloat(progressAmount)
      })
      
      setShowProgressModal(false)
      setSelectedGoal(null)
      setProgressAmount('')
      fetchData()
    } catch (error: any) {
      console.error('Failed to add progress:', error)
      alert(error.response?.data?.detail || 'Failed to add progress')
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return
    
    try {
      await api.delete(`/api/goals/${goalId}`)
      fetchData()
    } catch (error: any) {
      console.error('Failed to delete goal:', error)
      alert(error.response?.data?.detail || 'Failed to delete goal')
    }
  }

  const handlePauseResume = async (goalId: string, currentStatus: string) => {
    try {
      await api.patch(`/api/goals/${goalId}/status`, {
        status: currentStatus === 'active' ? 'paused' : 'active'
      })
      fetchData()
    } catch (error: any) {
      console.error('Failed to update status:', error)
      alert(error.response?.data?.detail || 'Failed to update status')
    }
  }

  const openEditModal = (goal: Goal) => {
    setSelectedGoal(goal)
    setFormData({
      name: goal.name,
      description: goal.description,
      target_amount: goal.target_amount.toString(),
      target_date: goal.target_date || '',
      priority: goal.priority
    })
    setShowEditModal(true)
  }

  const openProgressModal = (goal: Goal) => {
    setSelectedGoal(goal)
    setShowProgressModal(true)
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { color: 'bg-green-500/10 text-green-400', label: 'Active' },
      paused: { color: 'bg-yellow-500/10 text-yellow-400', label: 'Paused' },
      completed: { color: 'bg-blue-500/10 text-blue-400', label: 'Completed' },
      abandoned: { color: 'bg-gray-500/10 text-gray-400', label: 'Abandoned' }
    }
    return badges[status as keyof typeof badges] || badges.active
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'text-red-400'
    if (priority === 3) return 'text-yellow-400'
    return 'text-green-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Financial Goals</h1>
          <p className="text-gray-400">Track your savings progress and achieve your dreams</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-primary text-dark-bg font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Goals</p>
              <p className="text-2xl font-bold">{summary?.total_goals || 0}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active</p>
              <p className="text-2xl font-bold">{summary?.active_goals || 0}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Trophy className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-2xl font-bold">{summary?.completed_goals || 0}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Saved</p>
              <p className="text-2xl font-bold">{formatCurrency(summary?.total_saved_amount || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      {summary && summary.total_target_amount > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Overall Progress</h2>
            <span className="text-2xl font-bold text-primary">
              {summary.overall_progress.toFixed(0)}%
            </span>
          </div>
          <div className="mb-4">
            <div className="h-4 bg-dark-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500"
                style={{ width: `${Math.min(summary.overall_progress, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{formatCurrency(summary.total_saved_amount)} saved</span>
            <span>{formatCurrency(summary.total_target_amount)} target</span>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Goals Yet</h3>
            <p className="text-gray-400 mb-6">Set your first financial goal and start saving!</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-primary text-dark-bg font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          goals.map((goal) => {
            const badge = getStatusBadge(goal.status)
            
            return (
              <div key={goal.goal_id} className="glass-card p-6 hover:border-primary/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold">{goal.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                      {goal.priority <= 2 && (
                        <Flag className={`w-4 h-4 ${getPriorityColor(goal.priority)}`} />
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-sm text-gray-400 mb-3">{goal.description}</p>
                    )}
                    <div className="flex items-center space-x-6 text-xs text-gray-500">
                      {goal.target_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {formatDate(goal.target_date)}</span>
                        </div>
                      )}
                      {goal.days_remaining !== null && goal.days_remaining >= 0 && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{goal.days_remaining} days left</span>
                        </div>
                      )}
                      {goal.is_on_track !== null && (
                        <div className={`flex items-center space-x-1 ${goal.is_on_track ? 'text-green-400' : 'text-yellow-400'}`}>
                          <TrendingUp className="w-3 h-3" />
                          <span>{goal.is_on_track ? 'On Track' : 'Behind Schedule'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {goal.status === 'active' && (
                      <button
                        onClick={() => openProgressModal(goal)}
                        className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                        title="Add Progress"
                      >
                        <Plus className="w-4 h-4 text-primary" />
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(goal)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400 hover:text-primary" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.goal_id)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}
                    </span>
                    <span className="font-semibold text-primary">
                      {(goal.progress_percentage ?? 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 bg-dark-elevated rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        (goal.progress_percentage ?? 0) >= 100
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : (goal.progress_percentage ?? 0) >= 75
                          ? 'bg-gradient-to-r from-primary to-primary-dark'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}
                      style={{ width: `${Math.min(goal.progress_percentage ?? 0, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                {goal.status === 'active' && goal.progress_percentage < 100 && (
                  <div className="mt-4 pt-4 border-t border-gray-700/30">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {formatCurrency(goal.target_amount - goal.current_amount)} remaining
                      </span>
                      {goal.projected_completion_date && (
                        <span className="text-gray-500">
                          Projected: {formatDate(goal.projected_completion_date)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Create New Goal</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-white/5 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Goal Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Emergency Fund"
                  className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="6 months of living expenses"
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Amount *</label>
                <input
                  type="number"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  placeholder="100000"
                  className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Date (Optional)</label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Priority (1=High, 5=Low)</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                >
                  <option value={1}>1 - Highest</option>
                  <option value={2}>2 - High</option>
                  <option value={3}>3 - Medium</option>
                  <option value={4}>4 - Low</option>
                  <option value={5}>5 - Lowest</option>
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
                  onClick={handleAddGoal}
                  disabled={!formData.name || !formData.target_amount}
                  className="flex-1 px-4 py-2 bg-primary text-dark-bg font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Edit Goal</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-white/5 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Goal Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Amount *</label>
                <input
                  type="number"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Date (Optional)</label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                >
                  <option value={1}>1 - Highest</option>
                  <option value={2}>2 - High</option>
                  <option value={3}>3 - Medium</option>
                  <option value={4}>4 - Low</option>
                  <option value={5}>5 - Lowest</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateGoal}
                  disabled={!formData.name || !formData.target_amount}
                  className="flex-1 px-4 py-2 bg-primary text-dark-bg font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Progress Modal */}
      {showProgressModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Add Progress</h3>
              <button onClick={() => setShowProgressModal(false)} className="p-1 hover:bg-white/5 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{selectedGoal.name}</span>
                <span className="text-sm text-primary">{selectedGoal.progress_percentage.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-dark-elevated rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-dark"
                  style={{ width: `${Math.min(selectedGoal.progress_percentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400">
                Current: {formatCurrency(selectedGoal.current_amount)} / Target: {formatCurrency(selectedGoal.target_amount)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount to Add</label>
                <input
                  type="number"
                  value={progressAmount}
                  onChange={(e) => setProgressAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProgress}
                  disabled={!progressAmount || parseFloat(progressAmount) <= 0}
                  className="flex-1 px-4 py-2 bg-primary text-dark-bg font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
