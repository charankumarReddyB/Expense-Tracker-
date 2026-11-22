'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useToast } from '@/lib/hooks/useToast'
import { api } from '@/lib/api'
import { User, Mail, Lock, Bell, Globe, Palette, Save, Loader2, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    date_format: 'DD/MM/YYYY',
    items_per_page: '20'
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    budget_alerts: true,
    large_transactions: true,
    weekly_summary: false,
    bill_reminders: true,
    savings_goals: false,
    fraud_alerts: true
  })

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.profile?.name || '',
        currency: user.profile?.currency || 'INR',
        timezone: user.profile?.timezone || 'Asia/Kolkata',
        date_format: user.profile?.preferences?.date_format || 'DD/MM/YYYY',
        items_per_page: (user.profile?.preferences?.items_per_page || '20').toString()
      })
      setNotifications(user.profile?.notifications || notifications)
    }
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await api.put('/api/auth/profile', {
        name: profileForm.name,
        currency: profileForm.currency,
        timezone: profileForm.timezone,
        preferences: {
          date_format: profileForm.date_format,
          items_per_page: parseInt(profileForm.items_per_page)
        }
      })
      
      toast.success('Profile updated successfully')
      // Refresh user data
      setTimeout(() => window.location.reload(), 1000)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match')
      return
    }
    
    if (passwordForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    
    setLoading(true)
    
    try {
      await api.post('/api/auth/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      })
      
      toast.success('Password changed successfully')
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = async () => {
    setLoading(true)
    
    try {
      await api.put('/api/auth/notifications', notifications)
      toast.success('Notification preferences updated')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const password = prompt('Enter your password to confirm account deletion:')
    if (!password) return
    
    if (!confirm('Are you sure? This action cannot be undone!')) return
    
    setLoading(true)
    
    try {
      await api.delete('/api/auth/account', { data: { password } })
      toast.success('Account deleted successfully')
      setTimeout(() => logout(), 2000)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
  ]

  return (
    <div className="max-w-4xl space-y-6">

      {/* Tabs */}
      <div className="glass-card p-2">
        <div className="flex space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-gray-400 hover:text-white hover:bg-dark-elevated'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg opacity-50 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select 
                  value={profileForm.currency}
                  onChange={(e) => setProfileForm({ ...profileForm, currency: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                >
                  <option value="INR">₹ INR - Indian Rupee</option>
                  <option value="USD">$ USD - US Dollar</option>
                  <option value="EUR">€ EUR - Euro</option>
                  <option value="GBP">£ GBP - British Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <select 
                  value={profileForm.timezone}
                  onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-primary text-dark-bg font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>Save Changes</span>
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <input 
                type="password" 
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input 
                type="password" 
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                minLength={8}
                required
              />
              <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <input 
                type="password" 
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
                minLength={8}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-primary text-dark-bg font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
              <span>Update Password</span>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-700/30">
            <h3 className="font-semibold mb-4">Account Security</h3>
            <p className="text-gray-400 text-sm mb-4">
              Your account is secured with industry-standard encryption. We recommend using a strong, unique password.
            </p>
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-gray-400">Password Protected</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-gray-400">JWT Authentication</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
          <div className="space-y-6">
            {[
              {
                key: 'budget_alerts',
                title: 'Budget Alerts',
                description: 'Get notified when you reach 80% of your budget',
              },
              {
                key: 'large_transactions',
                title: 'Large Transactions',
                description: 'Alert for transactions above ₹5,000',
              },
              {
                key: 'weekly_summary',
                title: 'Weekly Summary',
                description: 'Receive a weekly spending summary every Monday',
              },
              {
                key: 'bill_reminders',
                title: 'Bill Reminders',
                description: 'Remind me 3 days before bills are due',
              },
              {
                key: 'savings_goals',
                title: 'Savings Goals',
                description: 'Updates on your savings goal progress',
              },
              {
                key: 'fraud_alerts',
                title: 'Fraud Alerts',
                description: 'Immediate notification of suspicious activity',
              },
            ].map((notification) => (
              <div
                key={notification.key}
                className="flex items-center justify-between p-4 bg-dark-elevated/30 rounded-xl"
              >
                <div>
                  <h3 className="font-semibold mb-1">{notification.title}</h3>
                  <p className="text-sm text-gray-400">{notification.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications[notification.key as keyof typeof notifications]}
                    onChange={(e) => setNotifications({ ...notifications, [notification.key]: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-dark-elevated peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}

            <button 
              onClick={handleNotificationUpdate}
              disabled={loading}
              className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-primary text-dark-bg font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-6">Application Preferences</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Date Format</label>
              <select 
                value={profileForm.date_format}
                onChange={(e) => setProfileForm({ ...profileForm, date_format: e.target.value })}
                className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (UK/IN)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Items Per Page</label>
              <select 
                value={profileForm.items_per_page}
                onChange={(e) => setProfileForm({ ...profileForm, items_per_page: e.target.value })}
                className="w-full px-4 py-2 bg-dark-elevated border border-gray-700 rounded-lg focus:border-primary focus:outline-none"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            <button 
              onClick={handleProfileUpdate}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-primary text-dark-bg font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>Save Preferences</span>
            </button>

            <div className="pt-6 border-t border-gray-700/30">
              <h3 className="font-semibold mb-4 text-red-400">Danger Zone</h3>
              <p className="text-sm text-gray-400 mb-4">
                Once you delete your account, there is no going back. All your data will be permanently removed.
              </p>
              <button 
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
