import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'

const INACTIVITY_MS = 10 * 60 * 1000
const WARNING_SECS = 60

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/documents', label: 'Documentos', icon: '📄' },
  { to: '/chat', label: 'Chat', icon: '💬' },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(WARNING_SECS)
  const inactivityTimer = useRef(null)
  const countdownTimer = useRef(null)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    navigate('/login')
  }, [navigate])

  const resetInactivity = useCallback(() => {
    if (showWarning) return
    clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(() => setShowWarning(true), INACTIVITY_MS)
  }, [showWarning])

  const handleContinue = () => {
    setShowWarning(false)
    setCountdown(WARNING_SECS)
    clearInterval(countdownTimer.current)
    resetInactivity()
  }

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach((e) => window.addEventListener(e, resetInactivity))
    resetInactivity()
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivity))
      clearTimeout(inactivityTimer.current)
    }
  }, [resetInactivity])

  useEffect(() => {
    if (!showWarning) return
    setCountdown(WARNING_SECS)
    countdownTimer.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer.current)
          logout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(countdownTimer.current)
  }, [showWarning, logout])

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-200">
          <h1 className="text-base font-semibold text-slate-800">ChatBot Demo</h1>
          <p className="text-xs text-slate-400 mt-0.5">Empresa Uno</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <button
            onClick={() => { localStorage.removeItem('token'); navigate('/login') }}
            className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-500 transition"
          >
            <span>🚪</span> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>

      {showWarning && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="text-4xl mb-4">⏱️</div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">¿Seguís ahí?</h2>
            <p className="text-sm text-slate-500 mb-6">
              Tu sesión se cerrará por inactividad en{' '}
              <span className="font-semibold text-indigo-600">{countdown}</span> segundos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={logout}
                className="flex-1 px-4 py-2 rounded-lg text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                Cerrar sesión
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 px-4 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Seguir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
