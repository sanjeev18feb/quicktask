'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Task = {
  id: number
  title: string
  description: string | null
  status: 'new' | 'in_progress' | 'complete'
  created_at: string
  due_date: string | null
  priority: string | null
}

export default function TaskList({ refresh }: { refresh: boolean }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error.message)
    } else {
      setTasks(data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [refresh])

  const updateStatus = async (taskId: number, newStatus: Task['status']) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (error) {
      console.error('Error updating status:', error.message)
    } else {
      fetchTasks()
    }
  }

  const deleteTask = async (id: number) => {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
  }

  if (loading) return <p className="text-center">Loading tasks...</p>
  if (!tasks.length) return <p className="text-center">No tasks found.</p>

  return (
    <ul className="space-y-4">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-between items-start"
        >
          <div>
            <h3
              className={`text-lg font-semibold ${
                task.status === 'complete' ? 'line-through text-gray-400' : ''
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
            )}

            {task.due_date && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Due: {new Date(task.due_date).toLocaleDateString()}
              </p>
            )}

            {task.priority && (
              <p className="text-sm mt-1">
                Priority:{' '}
                <span
                  className={
                    task.priority === 'High'
                      ? 'text-red-600 font-semibold'
                      : task.priority === 'Medium'
                      ? 'text-yellow-500 font-semibold'
                      : 'text-green-600 font-semibold'
                  }
                >
                  {task.priority}
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-col items-end space-y-2">
            <select
              value={task.status}
              onChange={(e) => updateStatus(task.id, e.target.value as Task['status'])}
              className={`px-3 py-1 rounded text-sm text-white ${
                task.status === 'new'
                  ? 'bg-blue-600'
                  : task.status === 'in_progress'
                  ? 'bg-yellow-500'
                  : 'bg-green-600'
              } cursor-pointer`}
              aria-label={`Change status for task ${task.title}`}
            >
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="complete">Complete</option>
            </select>

            <button
              onClick={() => deleteTask(task.id)}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:opacity-90"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
