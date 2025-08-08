'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabase } from '@/utils/supabase/provider'
import { toast } from 'sonner'
import { Building, Mail, Lock, Loader2, User, Phone } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase, user } = useSupabase()

  // Check for error messages in URL
  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'auth_callback_error') {
      toast.error('Ett fel uppstod vid inloggning. Försök igen.')
    }
  }, [searchParams])

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message || 'Felaktiga inloggningsuppgifter')
      } else if (data?.user) {
        toast.success('Inloggning lyckades!')
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      toast.error('Ett fel uppstod vid inloggning')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Lösenorden matchar inte')
      return
    }

    if (password.length < 6) {
      toast.error('Lösenordet måste vara minst 6 tecken')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          }
        }
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Konto skapat! Kontrollera din e-post för att bekräfta kontot.')
        // Switch to login tab after successful registration
        setActiveTab('login')
        // Clear registration form
        setFullName('')
        setPhone('')
        setConfirmPassword('')
      }
    } catch (error) {
      toast.error('Ett fel uppstod vid registrering')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
      }
    } catch (error) {
      toast.error('Ett fel uppstod vid Google-inloggning')
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Återställningslänk skickad! Kontrollera din e-post.')
        setShowResetPassword(false)
        setResetEmail('')
      }
    } catch (error) {
      toast.error('Ett fel uppstod vid lösenordsåterställning')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Building className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Mäklarsystem
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Logga in eller skapa ett nytt konto
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {showResetPassword ? (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Återställ lösenord</h3>
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                    E-postadress
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="reset-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="din@email.se"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        Skickar...
                      </>
                    ) : (
                      'Skicka återställningslänk'
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPassword(false)
                      setResetEmail('')
                    }}
                    className="text-sm text-gray-600 hover:text-gray-500"
                  >
                    Tillbaka till inloggning
                  </button>
                </div>
              </form>
            </div>
          ) : (
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="grid w-full grid-cols-2 mb-8">
              <Tabs.Trigger
                value="login"
                className="px-4 py-2 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-500 hover:text-gray-700"
              >
                Logga in
              </Tabs.Trigger>
              <Tabs.Trigger
                value="register"
                className="px-4 py-2 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-500 hover:text-gray-700"
              >
                Skapa konto
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="login">
              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
                    E-postadress
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="din@email.se"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                    Lösenord
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="login-password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Kom ihåg mig
                    </label>
                  </div>

                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetPassword(true)
                        setResetEmail(email)
                      }}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Glömt lösenord?
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        Loggar in...
                      </>
                    ) : (
                      'Logga in'
                    )}
                  </button>
                </div>
              </form>
            </Tabs.Content>

            <Tabs.Content value="register">
              <form className="space-y-6" onSubmit={handleRegister}>
                <div>
                  <label htmlFor="register-name" className="block text-sm font-medium text-gray-700">
                    Fullständigt namn
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="register-name"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Ditt fullständiga namn"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
                    E-postadress
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="din@email.se"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-phone" className="block text-sm font-medium text-gray-700">
                    Telefonnummer
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="register-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="070-123 45 67"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
                    Lösenord
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="register-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                    Bekräfta lösenord
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        Skapar konto...
                      </>
                    ) : (
                      'Skapa konto'
                    )}
                  </button>
                </div>
              </form>
            </Tabs.Content>
          </Tabs.Root>
          )}

          {!showResetPassword && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Eller fortsätt med</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  )
} 