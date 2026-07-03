import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { updateCurrentUser, updateCurrentUserPassword, getErrorMessage } from '../services/api'

const field =
  'w-full rounded-[10px] px-3.5 py-2.5 text-sm outline-none border transition ' +
  'bg-[var(--field)] text-[var(--text)] border-[var(--border-strong)] ' +
  'placeholder:text-[var(--muted)] focus:border-[var(--accent)] ' +
  'focus:shadow-[0_0_0_3px_var(--focus-ring)]'

const label = 'block text-[13px] font-semibold text-[var(--text-2)] mb-1.5'

const saveButton =
  'rounded-[10px] px-[18px] py-2.5 text-[13.5px] font-semibold cursor-pointer transition hover:opacity-90 disabled:opacity-50'

export default function Profile() {
  const { user, isLoading, isError, refetchUser } = useAuth()

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

        <PersonalDataForm user={user} />
        <PasswordForm />

        <div
          className="mt-[22px] rounded-[16px] p-[22px] bg-[var(--panel)] border border-[var(--border-strong)]"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Información de la cuenta</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[13px]">
            <dt className="text-[var(--muted)]">Organización</dt>
            <dd className="text-[var(--text)] font-medium">{user?.organization?.name ?? user?.organizationName ?? '—'}</dd>
            <dt className="text-[var(--muted)]">Área</dt>
            <dd className="text-[var(--text)] font-medium">{user?.area?.name ?? user?.areaName ?? '—'}</dd>
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

function PersonalDataForm({ user }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ userName: '', lastName: '', email: '' })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm({
      userName: user.userName || '',
      lastName: user.lastName || '',
      email: user.email || '',
    })
  }, [user])

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => updateCurrentUser(form),
    onSuccess: () => {
      setSaved(true)
      setError('')
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      setTimeout(() => setSaved(false), 2500)
    },
    onError: (err) => {
      setError(`No se pudieron guardar los cambios: ${getErrorMessage(err)}`)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    save()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[16px] p-[22px] bg-[var(--panel)] border border-[var(--border-strong)]"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Datos personales</h3>

      <label className={label}>Usuario</label>
      <input
        type="text"
        value={form.userName}
        onChange={(e) => setForm({ ...form, userName: e.target.value })}
        className={`${field} mb-4`}
        required
      />

      <label className={label}>Apellido</label>
      <input
        type="text"
        value={form.lastName}
        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        className={`${field} mb-4`}
        required
      />

      <label className={label}>Email</label>
      <input
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className={`${field} mb-4`}
        required
      />

      {error && <p className="text-sm mb-3" style={{ color: 'var(--danger)' }}>{error}</p>}
      {saved && <p className="text-sm mb-3" style={{ color: 'var(--text-2)' }}>Cambios guardados.</p>}

      <button
        type="submit"
        disabled={isPending}
        className={saveButton}
        style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
      >
        {isPending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}

function PasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => updateCurrentUserPassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    }),
    onSuccess: () => {
      setSaved(true)
      setError('')
      setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
      setTimeout(() => setSaved(false), 2500)
    },
    onError: (err) => {
      setError(getErrorMessage(err))
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (form.newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (form.newPassword !== form.confirmNewPassword) {
      setError('Las contraseñas nuevas no coinciden.')
      return
    }
    save()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-[22px] rounded-[16px] p-[22px] bg-[var(--panel)] border border-[var(--border-strong)]"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Cambiar contraseña</h3>

      <label className={label}>Contraseña actual</label>
      <input
        type="password"
        value={form.currentPassword}
        onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
        className={`${field} mb-4`}
        required
      />

      <label className={label}>Nueva contraseña</label>
      <input
        type="password"
        value={form.newPassword}
        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        className={`${field} mb-4`}
        minLength={8}
        required
      />

      <label className={label}>Confirmar nueva contraseña</label>
      <input
        type="password"
        value={form.confirmNewPassword}
        onChange={(e) => setForm({ ...form, confirmNewPassword: e.target.value })}
        className={`${field} mb-1`}
        minLength={8}
        required
      />
      <p className="text-[12px] text-[var(--muted)] mb-4">Mínimo 8 caracteres.</p>

      {error && <p className="text-sm mb-3" style={{ color: 'var(--danger)' }}>{error}</p>}
      {saved && <p className="text-sm mb-3" style={{ color: 'var(--text-2)' }}>Contraseña actualizada.</p>}

      <button
        type="submit"
        disabled={isPending}
        className={saveButton}
        style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
      >
        {isPending ? 'Guardando...' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}
