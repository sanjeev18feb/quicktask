'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    fetchTasks()
  }

  const deleteTask = async (id: number) => {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
  }

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = tasks.findIndex((task) => task.id === active.id)
    const newIndex = tasks.findIndex((task) => task.id === over.id)

    const newTasks = arrayMove(tasks, oldIndex, newIndex)
    setTasks(newTasks)
  }

  const SortableItem = ({ task, index }: { task: Task; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: task.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <li
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
      >

        <div className="text-gray-500 font-semibold mb-2">Task {index + 1}</div>

        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1 inline">Name: </h3>
          <p className={`text-xl font-normal inline ${task.status === 'complete' ? 'line-through text-gray-300' : 'text-gray-600 dark:text-gray-100'}`}>
            {task.title}
          </p>
        </div>

        {task.description && (
          <div className="mb-2">
            <span className="text-lg font-semibold text-gray-800 dark:text-white">
              Description:{' '}
              <span className="font-normal text-gray-700 dark:text-gray-300">
                {task.description}
              </span>
            </span>
          </div>
        )}

        {task.due_date && (
          <div className="mb-2">
            <span className="text-lg font-semibold text-gray-800 dark:text-white">
              Due:{' '}
              <span className="font-normal text-gray-700 dark:text-gray-300">
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            </span>
          </div>
        )}

        {task.priority && (
          <div className="mb-2">
            <span className="text-lg text-gray-800 dark:text-white mb-4">
              <strong>Priority:</strong>{' '}
              <span
                className={
                  task.priority === 'High'
                    ? 'text-red-600'
                    : task.priority === 'Medium'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                }
              >
                {task.priority}
              </span>
            </span>
          </div>
        )}

        <div className="mb-2">
          <span className="text-lg font-semibold text-gray-800 dark:text-white">
            Status:{' '}
            <select
              value={task.status}
              onChange={(e) => updateStatus(task.id, e.target.value as Task['status'])}
              className={`ml-1 px-2 py-1 border rounded bg-white dark:bg-gray-800 font-normal ${task.status === 'new'
                  ? 'text-blue-600'
                  : task.status === 'in_progress'
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}
            >
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="complete">Completed</option>
            </select>
          </span>
        </div>

        <div className="flex gap-4 mt-4">
          {task.status !== 'complete' && (
            <button
              onClick={() => deleteTask(task.id)}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:opacity-90"
            >
              Delete
            </button>
          )}
        </div>
      </li>
    )
  }

  if (loading) return <p className="text-center">Loading tasks...</p>
  if (!tasks.length) return <p className="text-center">No tasks found.</p>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">Task List</h2>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-6">
            {tasks.map((task, index) => (
              <SortableItem key={task.id} task={task} index={index} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}
