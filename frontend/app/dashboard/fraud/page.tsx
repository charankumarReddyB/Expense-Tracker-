'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Shield,
  AlertTriangle,
  Zap,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Copy,
  DollarSign,
  Calendar
} from 'lucide-react'

interface FraudAlert {
  alert_id: string
  expense_id: string
  fraud_type: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  confidence_score: number
  reason: string
  detected_at: string
  is_false_positive: boolean
  expense: {
    amount: number
    currency: string
    description: string
    merchant: string
    date: string
    category_name: string
  }
}

interface FraudStats {
  total_alerts: number
  by_risk_level: {
    low: number
    medium: number
    high: number
    critical: number
  }
  by_fraud_type: {
    [key: string]: number
  }
  false_positive_rate: number
  suspicious_merchants: string[]
}

export default function FraudAlertsPage() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([])
  const [stats, setStats] = useState<FraudStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [filterRisk, setFilterRisk] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [alertsRes, statsRes] = await Promise.all([
        api.post('/api/fraud/analyze', {
          lookback_days: 30,
          sensitivity: 'medium',
          check_types: [
            'amount_anomaly',
            'frequency_anomaly',
            'duplicate_transaction',
            'unusual_merchant',
            'time_pattern',
            'category_anomaly'
          ]
        }),
        api.get('/api/fraud/stats')
      ])
      setAlerts(alertsRes.data.alerts || [])
      setStats(statsRes.data || null)
    } catch (error) {
      console.error('Failed to fetch fraud data:', error)
    } finally {
      setLoading(false)
    }
  }

  const runQuickScan = async () => {
    try {
      setScanning(true)
      const response = await api.post('/api/fraud/quick-scan', {
        days: 7
      })
      setAlerts(response.data.alerts || [])
      // Refresh stats
      const statsRes = await api.get('/api/fraud/stats')
      setStats(statsRes.data)
    } catch (error) {
      console.error('Failed to run quick scan:', error)
    } finally {
      setScanning(false)
    }
  }

  const markFalsePositive = async (alertId: string) => {
    try {
      // This would need a backend endpoint to update the alert
      // For now, we'll just update locally
      setAlerts(alerts.map(a => 
        a.alert_id === alertId ? { ...a, is_false_positive: true } : a
      ))
    } catch (error) {
      console.error('Failed to mark as false positive:', error)
    }
  }

  const getRiskColor = (level: string) => {
    const colors: any = {
      low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      critical: 'bg-red-500/10 text-red-500 border-red-500/20'
    }
    return colors[level] || colors.low
  }

  const getRiskIcon = (level: string) => {
    if (level === 'critical') return <AlertTriangle className="w-5 h-5" />
    if (level === 'high') return <AlertTriangle className="w-5 h-5" />
    return <Shield className="w-5 h-5" />
  }

  const getFraudTypeIcon = (type: string) => {
    const icons: any = {
      amount_anomaly: <DollarSign className="w-5 h-5" />,
      frequency_anomaly: <TrendingUp className="w-5 h-5" />,
      duplicate_transaction: <Copy className="w-5 h-5" />,
      unusual_merchant: <AlertTriangle className="w-5 h-5" />,
      time_pattern: <Clock className="w-5 h-5" />,
      location_anomaly: <MapPin className="w-5 h-5" />,
      category_anomaly: <Calendar className="w-5 h-5" />
    }
    return icons[type] || <Shield className="w-5 h-5" />
  }

  const getFraudTypeLabel = (type: string) => {
    const labels: any = {
      amount_anomaly: 'Amount Anomaly',
      frequency_anomaly: 'Frequency Spike',
      duplicate_transaction: 'Duplicate Transaction',
      unusual_merchant: 'Unusual Merchant',
      time_pattern: 'Time Pattern',
      location_anomaly: 'Location Anomaly',
      category_anomaly: 'Category Anomaly'
    }
    return labels[type] || type
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filterRisk !== 'all' && alert.risk_level !== filterRisk) return false
    if (filterType !== 'all' && alert.fraud_type !== filterType) return false
    if (alert.is_false_positive) return false
    return true
  })

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#BFF549]" />
            Fraud Detection
          </h1>
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={runQuickScan}
              disabled={scanning}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold"
            >
              <Zap className={`w-4 h-4 ${scanning ? 'animate-pulse' : ''}`} />
              {scanning ? 'Scanning...' : 'Quick Scan'}
            </button>
          </div>
        </div>
        <p className="text-gray-400">
          AI-powered fraud detection across your transactions
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-[#BFF549]" />
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-[#151B2E] rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-[#BFF549]">{stats.total_alerts || 0}</div>
                <div className="text-sm text-gray-400">Total Alerts</div>
              </div>
              <div className="bg-[#151B2E] rounded-xl p-4 border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-400">{stats.by_risk_level?.low || 0}</div>
                <div className="text-sm text-gray-400">Low Risk</div>
              </div>
              <div className="bg-[#151B2E] rounded-xl p-4 border border-yellow-500/20">
                <div className="text-2xl font-bold text-yellow-400">{stats.by_risk_level?.medium || 0}</div>
                <div className="text-sm text-gray-400">Medium Risk</div>
              </div>
              <div className="bg-[#151B2E] rounded-xl p-4 border border-orange-500/20">
                <div className="text-2xl font-bold text-orange-400">{stats.by_risk_level?.high || 0}</div>
                <div className="text-sm text-gray-400">High Risk</div>
              </div>
              <div className="bg-[#151B2E] rounded-xl p-4 border border-red-500/20">
                <div className="text-2xl font-bold text-red-400">{stats.by_risk_level?.critical || 0}</div>
                <div className="text-sm text-gray-400">Critical</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-[#151B2E] rounded-xl p-4 border border-white/10 mb-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Risk Level</label>
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#BFF549]"
                >
                  <option value="all" className="bg-[#151B2E] text-white">All Risks</option>
                  <option value="critical" className="bg-[#151B2E] text-white">Critical</option>
                  <option value="high" className="bg-[#151B2E] text-white">High</option>
                  <option value="medium" className="bg-[#151B2E] text-white">Medium</option>
                  <option value="low" className="bg-[#151B2E] text-white">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Fraud Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#BFF549]"
                >
                  <option value="all" className="bg-[#151B2E] text-white">All Types</option>
                  <option value="amount_anomaly" className="bg-[#151B2E] text-white">Amount Anomaly</option>
                  <option value="frequency_anomaly" className="bg-[#151B2E] text-white">Frequency Spike</option>
                  <option value="duplicate_transaction" className="bg-[#151B2E] text-white">Duplicate</option>
                  <option value="unusual_merchant" className="bg-[#151B2E] text-white">Unusual Merchant</option>
                  <option value="time_pattern" className="bg-[#151B2E] text-white">Time Pattern</option>
                  <option value="category_anomaly" className="bg-[#151B2E] text-white">Category Anomaly</option>
                </select>
              </div>
              <div className="ml-auto flex items-end">
                <div className="text-sm text-gray-400">
                  Showing {filteredAlerts.length} of {alerts.filter(a => !a.is_false_positive).length} alerts
                </div>
              </div>
            </div>
          </div>

          {/* Alerts List */}
          <div className="bg-[#151B2E] rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Suspicious Transactions</h2>
            {filteredAlerts.length > 0 ? (
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.alert_id}
                    className={`p-4 rounded-lg border ${getRiskColor(alert.risk_level)} hover:bg-white/5 transition-colors`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${getRiskColor(alert.risk_level)}`}>
                            {getRiskIcon(alert.risk_level)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{alert.expense.description}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskColor(alert.risk_level)}`}>
                                {alert.risk_level.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                {getFraudTypeIcon(alert.fraud_type)}
                                {getFraudTypeLabel(alert.fraud_type)}
                              </span>
                              <span>{formatDate(alert.expense.date)}</span>
                              <span>{alert.expense.merchant}</span>
                              <span>{alert.expense.category_name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-14 mb-3">
                          <p className="text-sm text-gray-300">{alert.reason}</p>
                        </div>
                        <div className="ml-14 flex items-center gap-4">
                          <div className="text-sm text-gray-400">
                            Confidence: <span className="font-medium">{alert.confidence_score.toFixed(1)}%</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            Detected: {formatDate(alert.detected_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-xl font-bold">
                          {formatCurrency(alert.expense.amount, alert.expense.currency)}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => markFalsePositive(alert.alert_id)}
                            className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark Safe
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  {filterRisk !== 'all' || filterType !== 'all' 
                    ? 'No alerts match your filters' 
                    : 'No fraud alerts detected'}
                </p>
                <p className="text-sm">
                  {filterRisk !== 'all' || filterType !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Your transactions look secure!'}
                </p>
              </div>
            )}
          </div>

          {/* Fraud Type Breakdown */}
          {stats && Object.keys(stats.by_fraud_type).length > 0 && (
            <div className="mt-6 bg-[#151B2E] rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4">Fraud Type Breakdown</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(stats.by_fraud_type).map(([type, count]) => (
                  <div key={type} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getFraudTypeIcon(type)}
                      <span className="text-sm font-medium">{getFraudTypeLabel(type)}</span>
                    </div>
                    <div className="text-2xl font-bold text-[#BFF549]">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
