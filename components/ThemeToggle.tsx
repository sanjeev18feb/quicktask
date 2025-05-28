'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
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

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
            className={`px-4 py-2 rounded 
    ${isDark ? 'bg-sky-600 text-white' : 'bg-red-900 text-white'}
    hover:brightness-90 transition`}
        >
            {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>


    )
}
