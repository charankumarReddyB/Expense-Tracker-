'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useToast } from '@/lib/hooks/useToast'
import { api } from '@/lib/api'
import { 
  Lightbulb, 
  TrendingDown, 
  Target, 
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  DollarSign,
  PiggyBank,
  Zap,
  Filter,
  RefreshCw
} from 'lucide-react'

interface Recommendation {
  id: string
  type: string
  title: string
  description: string
  potential_savings: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  priority: number
  action_items: string[]
  subscriptions?: string[]
  examples?: string[]
  goal_details?: any
}

interface FocusArea {
  id: string
  name: string
  description: string
  icon: string
}

export default function RecommendationsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([])
  const [selectedFocus, setSelectedFocus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [totalSavings, setTotalSavings] = useState(0)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchFocusAreas()
    fetchRecommendations()
  }, [])

  const fetchFocusAreas = async () => {
    try {
      const response = await api.get('/api/recommendations/focus-areas')
      setFocusAreas(response.data.focus_areas)
    } catch (error) {
      console.error('Failed to fetch focus areas:', error)
    }
  }

  const fetchRecommendations = async (focusArea: string = 'all') => {
    setLoading(true)
    try {
      const response = await api.post('/api/recommendations/generate', {
        focus_area: focusArea,
        limit: 20
      })
      
      setRecommendations(response.data.recommendations)
      setTotalSavings(response.data.total_potential_savings)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch recommendations')
    } finally {
      setLoading(false)
    }
  }

  const handleFocusChange = (focusId: string) => {
    setSelectedFocus(focusId)
    fetchRecommendations(focusId)
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const submitFeedback = async (recommendationId: string, helpful: boolean) => {
    try {
      await api.post('/api/recommendations/feedback', {
        recommendation_id: recommendationId,
        helpful,
        implemented: false
      })
      toast.success('Thank you for your feedback!')
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-500/20 text-green-400 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      hard: 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    return colors[difficulty as keyof typeof colors] || colors.medium
  }

  const getPriorityIcon = (priority: number) => {
    if (priority >= 4) return <Zap className="w-4 h-4 text-yellow-400" />
    return <Target className="w-4 h-4 text-gray-400" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Analyzing your spending patterns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Smart Recommendations</h1>
          <p className="text-gray-400">
            Personalized tips to help you save ₹{totalSavings.toLocaleString()} per month
          </p>
        </div>
        <button
          onClick={() => fetchRecommendations(selectedFocus)}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Savings Summary Card */}
      <div className="glass-card p-6 border-2 border-primary/20">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-primary/10 rounded-xl">
            <PiggyBank className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-400 mb-1">Total Potential Savings</div>
            <div className="text-3xl font-bold text-primary">
              ₹{totalSavings.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              per month from {recommendations.length} recommendations
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Annual Savings</div>
            <div className="text-2xl font-semibold text-green-400">
              ₹{(totalSavings * 12).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Focus Area Filter */}
      <div className="glass-card p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Filter by focus area:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {focusAreas.map((area) => (
            <button
              key={area.id}
              onClick={() => handleFocusChange(area.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedFocus === area.id
                  ? 'bg-primary text-dark-bg'
                  : 'bg-dark-elevated text-gray-400 hover:bg-dark-elevated/80'
              }`}
            >
              <span className="mr-2">{area.icon}</span>
              {area.name}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      {recommendations.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Recommendations Yet</h3>
          <p className="text-gray-400">
            Keep tracking your expenses to get personalized saving tips
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="glass-card overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Lightbulb className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getPriorityIcon(rec.priority)}
                        <h3 className="text-lg font-semibold">{rec.title}</h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{rec.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyBadge(rec.difficulty)}`}>
                          {rec.difficulty.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-dark-elevated text-gray-300">
                          {rec.category}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                          <DollarSign className="w-3 h-3 inline mr-1" />
                          Save ₹{rec.potential_savings.toLocaleString()}/month
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleExpanded(rec.id)}
                    className="p-2 hover:bg-dark-elevated rounded-lg transition-colors"
                  >
                    <ChevronRight 
                      className={`w-5 h-5 transition-transform ${
                        expandedIds.has(rec.id) ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Expanded Content */}
                {expandedIds.has(rec.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-700/30 space-y-4">
                    {/* Action Items */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-gray-300">Action Steps:</h4>
                      <ul className="space-y-2">
                        {rec.action_items.map((item, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm text-gray-400">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Subscriptions */}
                    {rec.subscriptions && rec.subscriptions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-gray-300">Related Subscriptions:</h4>
                        <div className="space-y-1">
                          {rec.subscriptions.map((sub, idx) => (
                            <div key={idx} className="text-sm text-gray-400 bg-dark-elevated px-3 py-2 rounded">
                              {sub}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Examples */}
                    {rec.examples && rec.examples.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-gray-300">Examples:</h4>
                        <div className="space-y-1">
                          {rec.examples.map((example, idx) => (
                            <div key={idx} className="text-sm text-gray-400 bg-dark-elevated px-3 py-2 rounded">
                              {example}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Feedback */}
                    <div className="flex items-center space-x-4 pt-2">
                      <span className="text-sm text-gray-400">Was this helpful?</span>
                      <button
                        onClick={() => submitFeedback(rec.id, true)}
                        className="text-sm px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                      >
                        👍 Yes
                      </button>
                      <button
                        onClick={() => submitFeedback(rec.id, false)}
                        className="text-sm px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                      >
                        👎 No
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
