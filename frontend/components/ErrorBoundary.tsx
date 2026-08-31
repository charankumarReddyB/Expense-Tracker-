'use client'

import React, { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg">
          <div className="glass-card p-8 max-w-2xl w-full">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6 mx-auto">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2">Something went wrong</h1>
            <p className="text-gray-400 text-center mb-6">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 bg-dark-elevated rounded-lg">
                <h2 className="text-sm font-semibold mb-2 text-red-400">Error Details:</h2>
                <pre className="text-xs text-gray-400 overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <>
                    <h2 className="text-sm font-semibold mb-2 text-red-400 mt-4">Stack Trace:</h2>
                    <pre className="text-xs text-gray-400 overflow-auto max-h-48">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-dark-bg font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
              
              <Link href="/dashboard" className="flex-1">
                <button className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-dark-elevated border border-gray-700 rounded-lg hover:bg-dark-elevated/70 transition-colors">
                  <Home className="w-5 h-5" />
                  <span>Go to Dashboard</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
