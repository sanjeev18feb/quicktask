'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AuthForm from '../../components/AuthForm'
import TaskList from '../../components/TaskList'
import TaskForm from '../../components/TaskForm'
import ThemeToggle from '../../components/ThemeToggle'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [refresh, setRefresh] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }
  }, [])

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const currentUser = data.session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', currentUser.id)
          .single()

        if (!error) setProfile(profileData)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const loggedInUser = session?.user ?? null
      setUser(loggedInUser)

      if (loggedInUser) {
        supabase
          .from('profiles')
          .select('name')
          .eq('id', loggedInUser.id)
          .single()
          .then(({ data: profileData, error }) => {
            if (!error) setProfile(profileData)
          })
      }
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
    <main className={`min-h-screen ${isDark ? 'bg-red-900' : 'bg-sky-200'} text-gray-900 dark:text-white p-4 sm:p-6`}>
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center flex-grow">DASHBOARD</h1>
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </div>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
          <div className="text-lg font-bold sm:text-base text-gray-800 dark:text-gray-200 text-right">
            <p>Name: <span className="font-medium">{profile?.name ?? 'Loading...'}</span></p>
            <p>Email: <span className="font-medium">{user.email}</span></p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded p-4 sm:p-6 mb-8">
          <h2 className="text-lg sm:text-xl text-center font-semibold mb-4">TASK</h2>
          <TaskForm onTaskCreated={triggerRefresh} />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded p-4 sm:p-6">
          <TaskList refresh={refresh} />
        </div>
      </div>
    </main>
  )
}
