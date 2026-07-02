import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { IconHome, IconDoc, IconChat, IconUser, IconBuilding, IconLogout, IconClock } from './icons'

const INACTIVITY_MS = 10 * 60 * 1000
const WARNING_SECS = 60

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: IconHome },
  { to: '/documents', label: 'Documentos', Icon: IconDoc },
  { to: '/chat', label: 'Chat', Icon: IconChat },
  { to: '/profile', label: 'Mi perfil', Icon: IconUser },
]

const adminNavItems = [
  { to: '/company', label: 'Empresa', Icon: IconBuilding },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAdmin, user } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(WARNING_SECS)
  const inactivityTimer = useRef(null)
  const countdownTimer = useRef(null)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    queryClient.removeQueries({ queryKey: ['currentUser'] })
    navigate('/login')
  }, [navigate, queryClient])

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

  const navClass = ({ isActive }) =>
    'flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13.5px] w-full transition ' +
    (isActive
      ? 'font-semibold bg-[var(--accent)] text-[var(--accent-text)]'
      : 'font-medium text-[var(--text-2)] hover:bg-[var(--panel-2)]')

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <aside className="w-[212px] shrink-0 flex flex-col px-3.5 py-4 bg-[var(--panel)] border-r border-[var(--border)]">
        <div className="flex items-center gap-2.5 px-2 pt-1 pb-4">
          <div
            className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center font-bold text-[15px]"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            C
          </div>
          <div>
            <div className="text-[15px] font-bold text-[var(--text)] leading-none whitespace-nowrap">ChatBot</div>
            <div className="text-[11.5px] text-[var(--muted)] mt-0.5 whitespace-nowrap h-[14px] leading-[14px]">{user?.organization?.name}</div>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 mt-1">
          {[...navItems, ...(isAdmin ? adminNavItems : [])].map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={navClass}>
              <Icon /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2.5">
          <ThemeToggle />
          <button
            onClick={logout}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13.5px] text-[var(--muted)] w-full text-left transition hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]"
          >
            <IconLogout /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen">
        {children}
      </main>

      {showWarning && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-[2px] animate-[gfade_.2s_ease]">
          <div
            className="rounded-[20px] p-8 max-w-sm w-[90%] mx-4 text-center bg-[var(--panel)] border border-[var(--border-strong)]"
            style={{ boxShadow: '0 30px 70px -20px rgba(0,0,0,0.5)' }}
          >
            <div
              className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--panel-2)', color: 'var(--text)' }}
            >
              <IconClock />
            </div>
            <h2 className="text-lg font-bold text-[var(--text)] mb-2">¿Seguís ahí?</h2>
            <p className="text-sm text-[var(--text-2)] mb-6 leading-relaxed">
              Tu sesión se cerrará por inactividad en{' '}
              <span className="font-bold text-[var(--text)]">{countdown}</span> segundos.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={logout}
                className="flex-1 rounded-[10px] py-2.5 text-[13.5px] font-semibold cursor-pointer transition border border-[var(--border-strong)] text-[var(--text-2)] hover:bg-[var(--panel-2)]"
              >
                Cerrar sesión
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 rounded-[10px] py-2.5 text-[13.5px] font-semibold cursor-pointer transition hover:opacity-90"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
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
