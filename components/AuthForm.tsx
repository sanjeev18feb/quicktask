'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLogin, setIsLogin] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isLogin) {
      // Sign in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      }
    } else {
      // Sign up
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        alert('Check your email for confirmation link!')
      }
    }
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        {isLogin ? 'Login' : 'Sign Up'}
      </h2>

      {error && (
        <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
      )}

      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-3 p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-3 p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
      </button>

      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        {isLogin ? 'New here?' : 'Already have an account?'}{' '}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isLogin ? 'Create an account' : 'Login'}
        </button>
      </p>
    </form>
  )
}
