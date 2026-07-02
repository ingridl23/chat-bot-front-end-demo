import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { updateUser } from '../services/api'

export default function Profile() {
  const { user, isLoading, isError, refetchUser } = useAuth()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({ userName: '', email: '' })
  const [password, setPassword] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setForm({ userName: user.userName || '', email: user.email || '' })
    }
  }, [user])

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      // UserService.updateUser solo acepta userName, email y password
      const payload = { userName: form.userName, email: form.email }
      if (password.trim()) payload.password = password.trim()
      return updateUser(user.id, payload)
    },
    onSuccess: () => {
      setSaved(true)
      setError('')
      setPassword('')
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      setTimeout(() => setSaved(false), 2500)
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.response?.status || err?.message || 'Error desconocido'
      setError(`No se pudieron guardar los cambios: ${msg}`)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    save()
  }

  const field =
    'w-full rounded-[10px] px-3.5 py-2.5 text-sm outline-none border transition ' +
    'bg-[var(--field)] text-[var(--text)] border-[var(--border-strong)] ' +
    'placeholder:text-[var(--muted)] focus:border-[var(--accent)] ' +
    'focus:shadow-[0_0_0_3px_var(--focus-ring)]'

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-9 py-10">
          <p className="text-sm text-[var(--muted)]">Cargando perfil...</p>
        </div>
      </Layout>
    )
  }

  if (isError || !user) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-9 py-10">
          <p className="text-sm mb-3" style={{ color: 'var(--danger)' }}>
            No se pudo cargar tu perfil. Puede que el servidor no esté disponible o tu sesión haya expirado.
          </p>
          <button
            type="button"
            onClick={() => refetchUser()}
            className="rounded-[10px] px-[18px] py-2.5 text-[13.5px] font-semibold cursor-pointer transition hover:opacity-90"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            Reintentar
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-9 py-10">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-1.5 tracking-tight">Mi perfil</h2>
        <p className="text-[14.5px] text-[var(--text-2)] mb-7">Vé y editá tus datos personales.</p>

        <form
          onSubmit={handleSubmit}
          className="rounded-[16px] p-[22px] bg-[var(--panel)] border border-[var(--border-strong)]"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <label className="block text-[13px] font-semibold text-[var(--text-2)] mb-1.5">Usuario</label>
          <input
            type="text"
            value={form.userName}
            onChange={(e) => setForm({ ...form, userName: e.target.value })}
            className={`${field} mb-4`}
            required
          />

          <label className="block text-[13px] font-semibold text-[var(--text-2)] mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`${field} mb-4`}
            required
          />

          <label className="block text-[13px] font-semibold text-[var(--text-2)] mb-1.5">Nueva contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Dejar en blanco para no cambiarla"
            className={`${field} mb-1`}
          />
          <p className="text-[12px] text-[var(--muted)] mb-4">Completá este campo solo si querés cambiar tu contraseña.</p>

          {error && <p className="text-sm mb-3" style={{ color: 'var(--danger)' }}>{error}</p>}
          {saved && <p className="text-sm mb-3" style={{ color: 'var(--text-2)' }}>Cambios guardados.</p>}

          <button
            type="submit"
            disabled={isPending}
            className="rounded-[10px] px-[18px] py-2.5 text-[13.5px] font-semibold cursor-pointer transition hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        <div
          className="mt-[22px] rounded-[16px] p-[22px] bg-[var(--panel)] border border-[var(--border-strong)]"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Información de la cuenta</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[13px]">
            <dt className="text-[var(--muted)]">Apellido</dt>
            <dd className="text-[var(--text)] font-medium">{user?.lastName || '—'}</dd>
            <dt className="text-[var(--muted)]">Organización</dt>
            <dd className="text-[var(--text)] font-medium">{user?.organization?.name || '—'}</dd>
            <dt className="text-[var(--muted)]">Rol</dt>
            <dd className="text-[var(--text)] font-medium">
              {(user?.roles || []).map((r) => (typeof r === 'object' ? r.name : r)).join(', ') || '—'}
            </dd>
            <dt className="text-[var(--muted)]">Estado</dt>
            <dd className="text-[var(--text)] font-medium">{user?.enabled ? 'Activo' : 'Inactivo'}</dd>
          </dl>
        </div>
      </div>
    </Layout>
  )
}
