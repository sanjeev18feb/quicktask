'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function TaskForm({ onTaskCreated }: { onTaskCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    setLoading(true)

    const { error } = await supabase.from('tasks').insert([
      {
        title,
        description,
        is_complete: false,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        priority,
        status: 'new',
      },
    ])

    if (error) {
      console.error('Error creating task:', error.message)
    } else {
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('Medium')
      onTaskCreated()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4 space-y-4">
      <h2 className="text-lg font-semibold">Create a New Task</h2>

      <input
        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-700"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-700"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
        <div className="flex flex-col flex-1">
          <label htmlFor="dueDate" className="mb-1 text-sm font-medium">Due Date</label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-700"
          />
        </div>

        <div className="flex flex-col flex-1">
          <label htmlFor="priority" className="mb-1 text-sm font-medium">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-700"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Add Task'}
      </button>
    </form>
  )
}
