'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AuthForm from '../../components/AuthForm'
import TaskList from '../../components/TaskList'
import TaskForm from '../../components/TaskForm'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const triggerRefresh = () => setRefresh((prev) => !prev)

  if (!user) {
    return <AuthForm />
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">📝 QuickTask Dashboard</h1>

        <button
          onClick={() => supabase.auth.signOut()}
          className="mb-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>

        <div className="bg-white dark:bg-gray-800 shadow rounded p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create a New Task</h2>
          <TaskForm onTaskCreated={triggerRefresh} />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
          <TaskList refresh={refresh} />
        </div>
      </div>
    </main>
  )
}
