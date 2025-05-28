// components/TaskList.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Task = {
  id: number
  title: string
  description: string | null
  is_complete: boolean
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

  const toggleComplete = async (task: Task) => {
    await supabase
      .from('tasks')
      .update({ is_complete: !task.is_complete })
      .eq('id', task.id)

    fetchTasks()
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
                task.is_complete ? 'line-through text-gray-400' : ''
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
            )}

            {/* Due date */}
            {task.due_date && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Due: {new Date(task.due_date).toLocaleDateString()}
              </p>
            )}

            {/* Priority */}
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
          <div className="space-x-2 flex flex-col items-end">
            <button
              onClick={() => toggleComplete(task)}
              className={`px-3 py-1 rounded text-sm ${
                task.is_complete ? 'bg-yellow-500' : 'bg-green-600'
              } text-white hover:opacity-90`}
            >
              {task.is_complete ? 'Undo' : 'Complete'}
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:opacity-90 mt-2"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
