'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useToast } from '@/lib/hooks/useToast'
import { api } from '@/lib/api'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  Calendar,
  BarChart3,
  Brain,
  Target,
  RefreshCw,
  Loader2,
  Info
} from 'lucide-react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ForecastData {
  month: string
  predicted_amount: number
  lower_bound: number
  upper_bound: number
  confidence_level: number
}

interface HistoricalData {
  month: string
  actual_amount: number
}

interface Insight {
  type: string
  category: string
  title: string
  description: string
  action: string
  priority: string
}

export default function ForecastingPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [forecastData, setForecastData] = useState<any>(null)
  const [insights, setInsights] = useState<Insight[]>([])
  const [monthsAhead, setMonthsAhead] = useState(3)
  const [anomalies, setAnomalies] = useState<any>(null)

  useEffect(() => {
    fetchForecast()
    fetchInsights()
    fetchAnomalies()
  }, [monthsAhead])

  const fetchForecast = async () => {
    setLoading(true)
    try {
      const response = await api.post('/api/forecasting/generate', {
        months_ahead: monthsAhead,
        category_id: null
      })
      
      setForecastData(response.data)
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error('Not enough data to generate forecast. Need at least 3 months of expenses.')
      } else {
        toast.error('Failed to generate forecast')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchInsights = async () => {
    try {
      const response = await api.get('/api/forecasting/insights')
      setInsights(response.data.insights || [])
    } catch (error) {
      console.error('Failed to fetch insights:', error)
    }
  }

  const fetchAnomalies = async () => {
    try {
      const response = await api.get('/api/forecasting/anomalies')
      setAnomalies(response.data)
    } catch (error) {
      console.error('Failed to fetch anomalies:', error)
    }
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-red-400" />
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-green-400" />
      default:
        return <Minus className="w-5 h-5 text-gray-400" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'success':
        return <TrendingUp className="w-5 h-5 text-green-400" />
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/50 bg-red-500/10'
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10'
      default:
        return 'border-blue-500/50 bg-blue-500/10'
    }
  }

  // Prepare chart data
  const chartData = forecastData ? {
    labels: [
      ...forecastData.historical_data.map((d: HistoricalData) => d.month),
      ...forecastData.forecast.map((d: ForecastData) => d.month)
    ],
    datasets: [
      {
        label: 'Historical',
        data: [
          ...forecastData.historical_data.map((d: HistoricalData) => d.actual_amount),
          ...Array(forecastData.forecast.length).fill(null)
        ],
        borderColor: 'rgb(191, 245, 73)',
        backgroundColor: 'rgba(191, 245, 73, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4
      },
      {
        label: 'Forecast',
        data: [
          ...Array(forecastData.historical_data.length).fill(null),
          forecastData.historical_data[forecastData.historical_data.length - 1]?.actual_amount,
          ...forecastData.forecast.map((d: ForecastData) => d.predicted_amount)
        ],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4
      },
      {
        label: 'Upper Bound',
        data: [
          ...Array(forecastData.historical_data.length).fill(null),
          ...forecastData.forecast.map((d: ForecastData) => d.upper_bound)
        ],
        borderColor: 'rgba(239, 68, 68, 0.3)',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderWidth: 1,
        pointRadius: 0,
        fill: '+1',
        tension: 0.4
      },
      {
        label: 'Lower Bound',
        data: [
          ...Array(forecastData.historical_data.length).fill(null),
          ...forecastData.forecast.map((d: ForecastData) => d.lower_bound)
        ],
        borderColor: 'rgba(34, 197, 94, 0.3)',
        backgroundColor: 'rgba(34, 197, 94, 0.05)',
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        tension: 0.4
      }
    ]
  } : null

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#9CA3AF',
          font: { size: 12 }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#F3F4F6',
        bodyColor: '#D1D5DB',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ₹${context.parsed.y?.toLocaleString() || 0}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: '#9CA3AF'
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: '#9CA3AF',
          callback: (value: any) => `₹${value.toLocaleString()}`
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Analyzing spending patterns...</p>
        </div>
      </div>
    )
  }

  if (!forecastData) {
    return (
      <div className="glass-card p-12 text-center">
        <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Not Enough Data</h3>
        <p className="text-gray-400 mb-4">
          We need at least 3 months of expense data to generate forecasts.
        </p>
        <p className="text-sm text-gray-500">
          Keep tracking your expenses and check back soon!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Predictive Analytics</h1>
          <p className="text-gray-400">
            AI-powered spending forecasts and insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={monthsAhead}
            onChange={(e) => setMonthsAhead(Number(e.target.value))}
            className="px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
          >
            <option value={1}>1 Month</option>
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
          </select>
          <button
            onClick={fetchForecast}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Spending Trend</span>
            {getTrendIcon(forecastData.trend.direction)}
          </div>
          <div className="text-2xl font-bold mb-1 capitalize">
            {forecastData.trend.direction}
          </div>
          <div className="text-sm text-gray-400">
            {forecastData.trend.relative_change_pct > 0 ? '+' : ''}
            {forecastData.trend.relative_change_pct.toFixed(1)}% per month
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Forecast Accuracy</span>
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold mb-1">
            {forecastData.accuracy_metrics.accuracy_description}
          </div>
          <div className="text-sm text-gray-400">
            {forecastData.accuracy_metrics.mape 
              ? `MAPE: ${forecastData.accuracy_metrics.mape.toFixed(1)}%`
              : 'Based on historical patterns'}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Budget Alerts</span>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-2xl font-bold mb-1">
            {forecastData.budget_violations.length}
          </div>
          <div className="text-sm text-gray-400">
            {forecastData.budget_violations.length > 0 
              ? 'Predicted violations'
              : 'All budgets on track'}
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Spending Forecast</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Historical</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span>Forecast</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500/30 rounded-full"></div>
              <span>Confidence Range</span>
            </div>
          </div>
        </div>
        <div className="h-96">
          {chartData && <Line data={chartData} options={chartOptions} />}
        </div>
        <div className="mt-4 text-xs text-gray-500 text-center">
          Forecast generated using {forecastData.methods_used.join(', ')}
        </div>
      </div>

      {/* Budget Violations */}
      {forecastData.budget_violations.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>Predicted Budget Violations</span>
          </h3>
          <div className="space-y-3">
            {forecastData.budget_violations.map((violation: any, index: number) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  violation.severity === 'high' 
                    ? 'border-red-500/50 bg-red-500/10' 
                    : 'border-yellow-500/50 bg-yellow-500/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold mb-1">{violation.category}</div>
                    <div className="text-sm text-gray-400">
                      {violation.month} - Predicted: ₹{violation.predicted_amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-red-400">
                      +₹{violation.overage.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">
                      {violation.overage_percentage.toFixed(0)}% over budget
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <span>AI Insights</span>
          </h3>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <span className="text-xs px-2 py-0.5 bg-dark-elevated rounded-full text-gray-400">
                        {insight.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{insight.description}</p>
                    <div className="text-sm text-primary">
                      💡 {insight.action}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomalies */}
      {anomalies && anomalies.anomalies.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            <span>Unusual Spending Patterns</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anomalies.anomalies.slice(0, 4).map((anomaly: any, index: number) => (
              <div key={index} className="p-4 bg-dark-elevated rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">{anomaly.month}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    anomaly.severity === 'extreme' 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {anomaly.severity.toUpperCase()}
                  </span>
                </div>
                <div className="text-lg font-semibold mb-1">
                  ₹{anomaly.amount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">
                  {anomaly.type === 'high' ? 'Above' : 'Below'} expected: 
                  <span className="ml-1">
                    ₹{anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
