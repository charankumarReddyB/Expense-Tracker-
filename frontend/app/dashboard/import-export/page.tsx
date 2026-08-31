'use client'

import { useState, useRef } from 'react'
import { api } from '@/lib/api'
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Database,
  Loader2
} from 'lucide-react'

interface ImportResult {
  total_rows: number
  successful: number
  failed: number
  skipped_duplicates: number
  errors: Array<{ row: number; error: string }>
  imported_expense_ids: string[]
}

export default function ExportImportPage() {
  const [loading, setLoading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importType, setImportType] = useState<'standard' | 'bank'>('standard')
  const [showResult, setShowResult] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/export-import/template/download', {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'expense_import_template.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download template:', error)
      alert('Failed to download template')
    } finally {
      setLoading(false)
    }
  }

  const exportExpenses = async (includeMetadata: boolean = false) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('include_metadata', includeMetadata.toString())

      const response = await api.get(`/api/export-import/export/download?${params.toString()}`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `expenses_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export expenses:', error)
      alert('Failed to export expenses')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', file)

      const endpoint = importType === 'bank' 
        ? '/api/export-import/import/bank-statement'
        : '/api/export-import/import'

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setImportResult(response.data)
      setShowResult(true)
    } catch (error: any) {
      console.error('Failed to import file:', error)
      alert(error.response?.data?.detail || 'Failed to import file')
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Export & Import</h1>
        <p className="text-gray-400">
          Export your data or import expenses from CSV files and bank statements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-[#151B2E] rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Export Expenses</h2>
              <p className="text-sm text-gray-400">Download your data as CSV</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="font-medium mb-2">Standard Export</h3>
              <p className="text-sm text-gray-400 mb-4">
                Export essential expense data (Date, Amount, Description, Category)
              </p>
              <button
                onClick={() => exportExpenses(false)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-5 h-5" />
                    Export (Simple)
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="font-medium mb-2">Extended Export</h3>
              <p className="text-sm text-gray-400 mb-4">
                Export with metadata (IDs, timestamps, confidence scores)
              </p>
              <button
                onClick={() => exportExpenses(true)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5" />
                    Export (Extended)
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Export Tips</p>
                  <ul className="space-y-1 text-blue-200/80">
                    <li>• Use Simple export for spreadsheet analysis</li>
                    <li>• Use Extended export for complete backup</li>
                    <li>• All exports include your full expense history</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-[#151B2E] rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Import Expenses</h2>
              <p className="text-sm text-gray-400">Upload CSV files or bank statements</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Import Type Selector */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
              <button
                onClick={() => setImportType('standard')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  importType === 'standard'
                    ? 'bg-[#BFF549] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Standard CSV
              </button>
              <button
                onClick={() => setImportType('bank')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  importType === 'bank'
                    ? 'bg-[#BFF549] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Bank Statement
              </button>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-[#BFF549]/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={loading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-12 h-12 text-purple-500 mb-4 animate-spin" />
                    <p className="text-gray-400">Processing file...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-purple-500 mb-4" />
                    <p className="text-lg font-medium mb-2">Click to upload CSV file</p>
                    <p className="text-sm text-gray-400">or drag and drop</p>
                  </>
                )}
              </label>
            </div>

            {/* Download Template Button */}
            <button
              onClick={downloadTemplate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              Download CSV Template
            </button>

            {/* Import Info */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-300">
                  <p className="font-medium mb-1">
                    {importType === 'standard' ? 'Standard CSV Format' : 'Bank Statement Format'}
                  </p>
                  {importType === 'standard' ? (
                    <ul className="space-y-1 text-purple-200/80">
                      <li>• Required: Date, Amount, Description</li>
                      <li>• Optional: Merchant, Category</li>
                      <li>• Auto-categorization for missing categories</li>
                      <li>• Duplicate detection enabled</li>
                    </ul>
                  ) : (
                    <ul className="space-y-1 text-purple-200/80">
                      <li>• Supports HDFC, ICICI, SBI formats</li>
                      <li>• Auto-extracts merchant from descriptions</li>
                      <li>• Detects UPI, NEFT, IMPS transactions</li>
                      <li>• Smart categorization included</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Result Modal */}
      {showResult && importResult && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#151B2E] rounded-xl p-6 max-w-2xl w-full border border-white/10 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Import Results</h2>
              <button
                onClick={() => {
                  setShowResult(false)
                  setImportResult(null)
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-500/10 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{importResult.total_rows}</div>
                <div className="text-sm text-gray-400">Total Rows</div>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{importResult.successful}</div>
                <div className="text-sm text-gray-400">Successful</div>
              </div>
              <div className="p-4 bg-yellow-500/10 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{importResult.skipped_duplicates}</div>
                <div className="text-sm text-gray-400">Duplicates</div>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{importResult.failed}</div>
                <div className="text-sm text-gray-400">Failed</div>
              </div>
            </div>

            {/* Success Message */}
            {importResult.successful > 0 && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-green-500">
                  Successfully imported {importResult.successful} expense{importResult.successful !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Errors ({importResult.errors.length})
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {importResult.errors.map((error, idx) => (
                    <div key={idx} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-red-400 font-mono text-sm">Row {error.row}:</span>
                        <span className="text-sm text-gray-300">{error.error}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-6">
              <button
                onClick={() => {
                  setShowResult(false)
                  setImportResult(null)
                  window.location.href = '/dashboard/expenses'
                }}
                className="w-full px-4 py-3 bg-[#BFF549] text-black hover:bg-[#a8d93d] rounded-lg font-semibold transition-colors"
              >
                View Imported Expenses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
