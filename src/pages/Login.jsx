import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import ThemeToggle from '../components/ThemeToggle'

export default function Login() {
  const [form, setForm] = useState({ userName: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data: token } = await login(form.userName, form.password)
      localStorage.setItem('token', token)
      navigate('/dashboard')
    } catch {
      setError('Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  const field =
    'w-full rounded-[10px] px-3.5 py-2.5 text-sm outline-none border transition ' +
    'bg-[var(--field)] text-[var(--text)] border-[var(--border-strong)] ' +
    'placeholder:text-[var(--muted)] focus:border-[var(--accent)] ' +
    'focus:shadow-[0_0_0_3px_var(--focus-ring)]'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6 relative">
      <div className="absolute top-5 right-6">
        <ThemeToggle />
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[18px] p-9 bg-[var(--panel)] border border-[var(--border-strong)]"
        style={{ boxShadow: 'var(--shadow)' }}
      >
        <div className="flex items-center gap-3 mb-7">
          <div
            className="w-10 h-10 rounded-[11px] flex items-center justify-center font-bold text-lg"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            C
          </div>
          <div>
            <div className="text-lg font-bold text-[var(--text)] leading-none whitespace-nowrap">ChatBot Demo</div>
            <div className="text-[13px] text-[var(--muted)] mt-1">Ingresá a tu cuenta</div>
          </div>
        </div>

        <label className="block text-[13px] font-semibold text-[var(--text-2)] mb-1.5">Usuario</label>
        <input
          type="text"
          value={form.userName}
          onChange={(e) => setForm({ ...form, userName: e.target.value })}
          className={`${field} mb-4`}
          placeholder="admin"
          required
        />

        <label className="block text-[13px] font-semibold text-[var(--text-2)] mb-1.5">Contraseña</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className={field}
          placeholder="••••••"
          required
        />

        {error && <p className="text-sm mt-3" style={{ color: 'var(--danger)' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-5 rounded-[10px] py-3 text-sm font-semibold cursor-pointer transition hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}
