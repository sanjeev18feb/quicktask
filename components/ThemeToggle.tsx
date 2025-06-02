'use client'

interface ThemeToggleProps {
  isDark: boolean
  toggleTheme: () => void
}

export default function ThemeToggle({ isDark, toggleTheme }: ThemeToggleProps) {
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Dark Mode"
      className={`px-4 py-2 rounded 
        ${isDark ? 'bg-sky-200 text-white' : 'bg-red-900 text-white'}
        hover:brightness-90 transition`}
    >
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  )
}
