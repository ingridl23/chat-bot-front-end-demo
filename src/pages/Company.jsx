import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import {
  getOrganization,
  updateOrganization,
  getActiveAISettings,
  createAISettings,
  updateAISettings,
  getUsers,
  updateUser,
} from '../services/api'

const field =
  'w-full rounded-[10px] px-3.5 py-2.5 text-sm outline-none border transition ' +
  'bg-[var(--field)] text-[var(--text)] border-[var(--border-strong)] ' +
  'placeholder:text-[var(--muted)] focus:border-[var(--accent)] ' +
  'focus:shadow-[0_0_0_3px_var(--focus-ring)]'

const label = 'block text-[13px] font-semibold text-[var(--text-2)] mb-1.5'

const saveButton =
  'rounded-[10px] px-[18px] py-2.5 text-[13.5px] font-semibold cursor-pointer transition hover:opacity-90 disabled:opacity-50'

const TABS = [
  { id: 'branding', label: 'Identidad del bot' },
  { id: 'ai', label: 'Comportamiento de IA' },
  { id: 'members', label: 'Integrantes' },
]

export default function Company() {
  const { organizationId, isLoading: authLoading, isError: authError } = useAuth()
  const [tab, setTab] = useState('branding')

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-9 py-10">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-1.5 tracking-tight">Gestión de la empresa</h2>
        <p className="text-[14.5px] text-[var(--text-2)] mb-7">
          Personalizá el chatbot y administrá el acceso de tu organización.
        </p>

        <div
          className="inline-flex items-center rounded-[10px] p-[3px] gap-[2px] mb-6"
          style={{ background: 'var(--panel-2)' }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold cursor-pointer transition whitespace-nowrap"
              style={
                tab === t.id
                  ? { background: 'var(--tg-light-bg)', color: 'var(--tg-light-fg)', boxShadow: 'var(--tg-light-sh)' }
                  : { color: 'var(--muted)' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {authLoading ? (
          <p className="text-sm text-[var(--muted)]">Cargando organización...</p>
        ) : authError || !organizationId ? (
          <p className="text-sm" style={{ color: 'var(--danger)' }}>
            No se pudo determinar tu organización. Verificá tu sesión o intentá de nuevo más tarde.
          </p>
        ) : (
          <>
            {tab === 'branding' && <BrandingTab organizationId={organizationId} />}
            {tab === 'ai' && <AITab organizationId={organizationId} />}
            {tab === 'members' && <MembersTab organizationId={organizationId} />}
          </>
        )}
      </div>
    </Layout>
  )
}

function BrandingTab({ organizationId }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const { data: org, isLoading } = useQuery({
    queryKey: ['organization', organizationId],
    queryFn: async () => {
      const { data } = await getOrganization(organizationId)
      return data
    },
  })

  useEffect(() => {
    if (org) {
      setForm({
        name: org.name || '',
        logoUrl: org.logoUrl || '',
        primaryColor: org.primaryColor || '#2b2926',
        secondaryColor: org.secondaryColor || '#efece7',
        faviconUrl: org.faviconUrl || '',
        domain: org.domain || '',
        supportEmail: org.supportEmail || '',
      })
    }
  }, [org])

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => updateOrganization(organizationId, form),
    onSuccess: () => {
      setSaved(true)
      setError('')
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId] })
      setTimeout(() => setSaved(false), 2500)
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.response?.status || err?.message || 'Error desconocido'
      setError(`No se pudo guardar: ${msg}`)
    },
  })

  if (isLoading || !form) {
    return <p className="text-sm text-[var(--muted)]">Cargando datos de la organización...</p>
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setError('')
        save()
      }}
      className="rounded-[16px] p-[22px] bg-[var(--panel)] border border-[var(--border-strong)]"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={label}>Nombre de la organización</label>
          <input type="text" value={form.name} onChange={set('name')} className={field} required />
        </div>
        <div>
          <label className={label}>Dominio</label>
          <input type="text" value={form.domain} onChange={set('domain')} className={field} required />
        </div>
        <div>
          <label className={label}>URL del logo</label>
          <input type="text" value={form.logoUrl} onChange={set('logoUrl')} className={field} required />
        </div>
        <div>
          <label className={label}>URL del favicon</label>
          <input type="text" value={form.faviconUrl} onChange={set('faviconUrl')} className={field} required />
        </div>
        <div>
          <label className={label}>Color primario</label>
          <div className="flex items-center gap-2">
            <input type="color" value={form.primaryColor} onChange={set('primaryColor')} className="w-10 h-10 rounded-[8px] border border-[var(--border-strong)] cursor-pointer" />
            <input type="text" value={form.primaryColor} onChange={set('primaryColor')} className={field} required />
          </div>
        </div>
        <div>
          <label className={label}>Color secundario</label>
          <div className="flex items-center gap-2">
            <input type="color" value={form.secondaryColor} onChange={set('secondaryColor')} className="w-10 h-10 rounded-[8px] border border-[var(--border-strong)] cursor-pointer" />
            <input type="text" value={form.secondaryColor} onChange={set('secondaryColor')} className={field} required />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className={label}>Email de soporte</label>
          <input type="email" value={form.supportEmail} onChange={set('supportEmail')} className={field} required />
        </div>
      </div>

      {error && <p className="text-sm mt-4" style={{ color: 'var(--danger)' }}>{error}</p>}
      {saved && <p className="text-sm mt-4" style={{ color: 'var(--text-2)' }}>Cambios guardados.</p>}

      <button
        type="submit"
        disabled={isPending}
        className={`${saveButton} mt-5`}
        style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
      >
        {isPending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}

function AITab({ organizationId }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['aisettings-active', organizationId],
    queryFn: async () => {
      try {
        const { data } = await getActiveAISettings(organizationId)
        return data
      } catch (err) {
        if (err?.response?.status === 404) return null
        throw err
      }
    },
  })

  useEffect(() => {
    setForm({
      modelName: settings?.modelName || 'gpt-4o-mini',
      provider: settings?.provider || 'openai',
      temperature: settings?.temperature ?? 0.7,
      maxTokens: settings?.maxTokens ?? 800,
      systemPrompt: settings?.systemPrompt || '',
      active: settings?.active ?? true,
    })
  }, [settings])

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      const payload = { ...form, organizationId, temperature: Number(form.temperature), maxTokens: Number(form.maxTokens) }
      return settings?.id ? updateAISettings(settings.id, payload) : createAISettings(payload)
    },
    onSuccess: () => {
      setSaved(true)
      setError('')
      queryClient.invalidateQueries({ queryKey: ['aisettings-active', organizationId] })
      setTimeout(() => setSaved(false), 2500)
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.response?.status || err?.message || 'Error desconocido'
      setError(`No se pudo guardar: ${msg}`)
    },
  })

  if (isLoading || !form) {
    return <p className="text-sm text-[var(--muted)]">Cargando configuración de IA...</p>
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setError('')
        save()
      }}
      className="rounded-[16px] p-[22px] bg-[var(--panel)] border border-[var(--border-strong)]"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {!settings && (
        <p className="text-[12.5px] mb-4" style={{ color: 'var(--muted)' }}>
          Tu organización todavía no tiene una configuración de IA activa. Al guardar se creará una nueva.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={label}>Proveedor</label>
          <input type="text" value={form.provider} onChange={set('provider')} className={field} placeholder="openai" required />
        </div>
        <div>
          <label className={label}>Modelo</label>
          <input type="text" value={form.modelName} onChange={set('modelName')} className={field} placeholder="gpt-4o-mini" required />
        </div>
        <div>
          <label className={label}>Temperatura (0 a 1)</label>
          <input type="number" min="0" max="1" step="0.1" value={form.temperature} onChange={set('temperature')} className={field} required />
        </div>
        <div>
          <label className={label}>Máximo de tokens por respuesta</label>
          <input type="number" min="1" value={form.maxTokens} onChange={set('maxTokens')} className={field} required />
        </div>
        <div className="md:col-span-2">
          <label className={label}>Instrucciones del sistema (tono, reglas, alcance)</label>
          <textarea
            value={form.systemPrompt}
            onChange={set('systemPrompt')}
            rows={5}
            className={`${field} resize-y`}
            placeholder="Ej: Sos el asistente de Empresa Uno. Respondé de forma clara y formal, solo sobre los documentos cargados."
            required
          />
        </div>
      </div>

      {error && <p className="text-sm mt-4" style={{ color: 'var(--danger)' }}>{error}</p>}
      {saved && <p className="text-sm mt-4" style={{ color: 'var(--text-2)' }}>Cambios guardados.</p>}

      <button
        type="submit"
        disabled={isPending}
        className={`${saveButton} mt-5`}
        style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
      >
        {isPending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}

function MembersTab({ organizationId }) {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['org-users', organizationId],
    queryFn: async () => {
      const { data } = await getUsers()
      return data
    },
  })

  const members = users.filter((u) => (u.organization?.id ?? u.organizationId) === organizationId)

  if (isLoading) {
    return <p className="text-sm text-[var(--muted)]">Cargando integrantes...</p>
  }

  return (
    <div
      className="rounded-[16px] overflow-hidden bg-[var(--panel)] border border-[var(--border-strong)]"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center justify-between px-[22px] py-4 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text)] whitespace-nowrap">Integrantes de la organización</h3>
        <span className="text-[11px] text-[var(--muted)] font-mono whitespace-nowrap">
          {members.length} integrante{members.length === 1 ? '' : 's'}
        </span>
      </div>

      <p className="text-[12.5px] px-[22px] pt-3" style={{ color: 'var(--muted)' }}>
        Cambiar el rol o el estado de un integrante todavía no está disponible: el backend no tiene un método para actualizarlos.
      </p>

      {members.length === 0 ? (
        <p className="text-sm text-[var(--muted)] p-6">No hay integrantes todavía.</p>
      ) : (
        <ul>
          {members.map((member) => {
            const roleNames = (member.roles || []).map((r) => (typeof r === 'object' ? r.name : r)).join(', ')
            return (
              <li
                key={member.id}
                className="flex items-center justify-between gap-3 px-[22px] py-[15px] border-t border-[var(--border)]"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text)] truncate">
                    {member.userName} {member.lastName}
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{member.email}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11.5px] font-mono text-[var(--muted)]">{roleNames || '—'}</span>
                  <span
                    className="px-2.5 py-1.5 rounded-[9px] text-[11.5px] font-semibold whitespace-nowrap"
                    style={
                      member.enabled
                        ? { background: 'var(--panel-2)', color: 'var(--text)' }
                        : { background: 'var(--danger-bg)', color: 'var(--danger)' }
                    }
                  >
                    {member.enabled ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
