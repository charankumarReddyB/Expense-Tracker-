'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Target,
  PieChart,
  FileSpreadsheet,
  Loader2,
  CheckCircle2
} from 'lucide-react'

interface ReportConfig {
  report_type: string
  start_date?: string
  end_date?: string
  category_ids?: string[]
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState<string>('')
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  const reportTypes = [
    {
      id: 'monthly_expenses',
      name: 'Monthly Expenses Report',
      description: 'Detailed breakdown of expenses for a specific month',
      icon: Calendar,
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      id: 'yearly_expenses',
      name: 'Yearly Expenses Report',
      description: 'Annual summary with month-by-month comparison',
      icon: TrendingUp,
      color: 'bg-green-500/10 text-green-500'
    },
    {
      id: 'budget_performance',
      name: 'Budget Performance',
      description: 'Track budget adherence and spending patterns',
      icon: Target,
      color: 'bg-purple-500/10 text-purple-500'
    },
    {
      id: 'goal_progress',
      name: 'Financial Goals Progress',
      description: 'Monitor progress towards your financial goals',
      icon: CheckCircle2,
      color: 'bg-yellow-500/10 text-yellow-500'
    },
    {
      id: 'category_breakdown',
      name: 'Category Breakdown',
      description: 'Analyze spending by category with pie charts',
      icon: PieChart,
      color: 'bg-pink-500/10 text-pink-500'
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Report',
      description: 'All-in-one report with expenses, budgets, and goals',
      icon: FileSpreadsheet,
      color: 'bg-orange-500/10 text-orange-500'
    }
  ]

  const downloadReport = async (reportType: string) => {
    try {
      setLoading(true)
      setSelectedReport(reportType)
      setDownloadSuccess(false)

      let url = ''
      const params = new URLSearchParams()

      if (reportType === 'monthly_expenses') {
        const date = new Date(dateRange.start)
        url = `/api/reports/monthly/${date.getFullYear()}/${date.getMonth() + 1}`
        params.append('download', 'true')
      } else if (reportType === 'yearly_expenses') {
        const date = new Date(dateRange.start)
        url = `/api/reports/yearly/${date.getFullYear()}`
        params.append('download', 'true')
      } else if (reportType === 'budget_performance') {
        url = '/api/reports/budgets/performance'
        params.append('start_date', dateRange.start)
        params.append('end_date', dateRange.end)
        params.append('download', 'true')
      } else if (reportType === 'goal_progress') {
        url = '/api/reports/goals/progress'
        params.append('download', 'true')
      } else {
        // For category_breakdown and comprehensive, use the generate endpoint
        const response = await api.post('/api/reports/generate/download', {
          report_type: reportType,
          start_date: dateRange.start,
          end_date: dateRange.end
        }, {
          responseType: 'blob'
        })

        // Create download link
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(downloadUrl)

        setDownloadSuccess(true)
        setTimeout(() => setDownloadSuccess(false), 3000)
        return
      }

      // For simple GET requests
      const fullUrl = `${url}?${params.toString()}`
      const response = await api.get(fullUrl, {
        responseType: 'blob'
      })

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)

      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to download report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setLoading(false)
      setSelectedReport('')
    }
  }

  const quickDownloads = [
    {
      label: 'This Month',
      action: () => {
        const date = new Date()
        const start = new Date(date.getFullYear(), date.getMonth(), 1)
        const end = new Date()
        setDateRange({
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        })
      }
    },
    {
      label: 'Last Month',
      action: () => {
        const date = new Date()
        const start = new Date(date.getFullYear(), date.getMonth() - 1, 1)
        const end = new Date(date.getFullYear(), date.getMonth(), 0)
        setDateRange({
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        })
      }
    },
    {
      label: 'This Year',
      action: () => {
        const date = new Date()
        const start = new Date(date.getFullYear(), 0, 1)
        const end = new Date()
        setDateRange({
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        })
      }
    },
    {
      label: 'Last Year',
      action: () => {
        const date = new Date()
        const start = new Date(date.getFullYear() - 1, 0, 1)
        const end = new Date(date.getFullYear() - 1, 11, 31)
        setDateRange({
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        })
      }
    }
  ]

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reports</h1>
        <p className="text-gray-400">
          Download detailed PDF reports of your financial data
        </p>
      </div>

      {/* Success Message */}
      {downloadSuccess && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-green-500">Report downloaded successfully!</span>
        </div>
      )}

      {/* Date Range Selector */}
      <div className="bg-[#151B2E] rounded-xl p-6 border border-white/10 mb-6">
        <h2 className="text-lg font-semibold mb-4">Report Period</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#BFF549]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#BFF549]"
            />
          </div>
          <div className="flex gap-2 ml-auto">
            {quickDownloads.map((quick, idx) => (
              <button
                key={idx}
                onClick={quick.action}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"
              >
                {quick.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon
          const isLoading = loading && selectedReport === report.id

          return (
            <div
              key={report.id}
              className="bg-[#151B2E] rounded-xl p-6 border border-white/10 hover:border-[#BFF549]/30 transition-all"
            >
              <div className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{report.name}</h3>
              <p className="text-gray-400 text-sm mb-4 min-h-[40px]">
                {report.description}
              </p>
              <button
                onClick={() => downloadReport(report.id)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#BFF549] text-black hover:bg-[#a8d93d] rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-[#151B2E] rounded-xl p-6 border border-white/10">
        <div className="flex items-start gap-4">
          <FileText className="w-6 h-6 text-[#BFF549] flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold mb-2">About Reports</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• Reports are generated in PDF format with professional formatting</li>
              <li>• All reports include your expense data, charts, and summaries</li>
              <li>• Monthly and yearly reports show detailed transaction history</li>
              <li>• Budget and goal reports include progress indicators and recommendations</li>
              <li>• Reports are not stored on the server and are generated on-demand</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
