'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useToast } from '@/lib/hooks/useToast'
import { api } from '@/lib/api'
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  X, 
  Loader2,
  TrendingUp,
  DollarSign,
  Target,
  Lightbulb,
  BarChart3,
  AlertCircle
} from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  data?: any
  suggestions?: string[]
  intent?: string
}

interface QuickQuery {
  id: string
  label: string
  query: string
  icon: string
}

export default function AIAssistantWidget() {
  const { user } = useAuth()
  const toast = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [quickQueries, setQuickQueries] = useState<QuickQuery[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && quickQueries.length === 0) {
      fetchQuickQueries()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchQuickQueries = async () => {
    try {
      const response = await api.get('/api/ai/quick-queries')
      setQuickQueries(response.data.queries)
    } catch (error) {
      console.error('Failed to fetch quick queries:', error)
    }
  }

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Get context (last 5 messages)
      const context = messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp
      }))

      const response = await api.post('/api/ai/chat', {
        message: messageText,
        context: context.length > 0 ? context : null
      })

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: response.data.timestamp,
        data: response.data.data,
        suggestions: response.data.suggestions,
        intent: response.data.intent
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to get response')
      
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickQuery = (query: string) => {
    sendMessage(query)
  }

  const getIconForIntent = (intent?: string) => {
    switch (intent) {
      case 'query_expenses':
        return <DollarSign className="w-4 h-4" />
      case 'budget_check':
        return <Target className="w-4 h-4" />
      case 'goal_progress':
        return <TrendingUp className="w-4 h-4" />
      case 'category_insights':
        return <BarChart3 className="w-4 h-4" />
      case 'get_recommendations':
        return <Lightbulb className="w-4 h-4" />
      default:
        return <Sparkles className="w-4 h-4" />
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-primary to-accent-blue rounded-full shadow-2xl hover:scale-110 transition-transform duration-300"
      >
        <MessageCircle className="w-6 h-6 text-dark-bg" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] glass-card flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs text-gray-400">Ask me anything about your finances</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-dark-elevated rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h4 className="font-semibold mb-2">Hi {user?.profile?.name || 'there'}! 👋</h4>
            <p className="text-sm text-gray-400 mb-6">
              I'm your AI financial assistant. Ask me anything about your spending, budgets, or goals.
            </p>

            {/* Quick Queries */}
            {quickQueries.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-3">Try these:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickQueries.map((query) => (
                    <button
                      key={query.id}
                      onClick={() => handleQuickQuery(query.query)}
                      className="p-3 bg-dark-elevated/50 hover:bg-dark-elevated rounded-lg text-left transition-colors text-sm"
                    >
                      <div className="text-lg mb-1">{query.icon}</div>
                      <div className="font-medium text-xs">{query.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary text-dark-bg rounded-2xl rounded-tr-sm'
                      : 'bg-dark-elevated rounded-2xl rounded-tl-sm'
                  } p-3`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="p-1 bg-primary/20 rounded">
                        {getIconForIntent(message.intent)}
                      </div>
                      <span className="text-xs text-gray-400">
                        {message.intent?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-line">{message.content}</p>

                  {/* Data Display */}
                  {message.data && (
                    <div className="mt-3 p-2 bg-dark-bg/50 rounded-lg text-xs">
                      {Object.entries(message.data).map(([key, value]) => (
                        <div key={key} className="flex justify-between mb-1">
                          <span className="text-gray-400">{key}:</span>
                          <span className="font-medium">
                            {typeof value === 'number' 
                              ? `₹${value.toLocaleString()}` 
                              : String(value)
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-gray-400 mb-1">Quick actions:</p>
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(suggestion)}
                          className="block w-full text-left text-xs p-2 bg-primary/10 hover:bg-primary/20 rounded transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-dark-elevated rounded-2xl rounded-tl-sm p-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700/30">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={loading}
            className="flex-1 px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 bg-primary text-dark-bg rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Powered by Google Gemini AI
        </p>
      </div>
    </div>
  )
}
