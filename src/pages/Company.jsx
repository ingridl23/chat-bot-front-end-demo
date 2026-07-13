import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { splitPrompt, joinPrompt } from '../utils/systemPrompt'
import {
  getOrganization,
  updateOrganization,
  getAllAISettings,
  createAISettings,
  getUsers,
  getUsersByArea,
  createUser,
  getAreas,
  createArea,
  getRoles,
  getErrorMessage,
} from '../services/api'

const field =
  'w-full rounded-[10px] px-3.5 py-2.5 text-sm outline-none border transition ' +
  'bg-[var(--field)] text-[var(--text)] border-[var(--border-strong)] ' +
  'placeholder:text-[var(--muted)] focus:border-[var(--accent)] ' +
  'focus:shadow-[0_0_0_3px_var(--focus-ring)]'

const label = 'block text-[13px] font-semibold text-[var(--text-2)] mb-1.5'

const saveButton =
  'rounded-[10px] px-[18px] py-2.5 text-[13.5px] font-semibold cursor-pointer transition hover:opacity-90 disabled:opacity-50'

const ADMIN_TABS = [
  { id: 'branding', label: 'Identidad del bot' },
  { id: 'ai', label: 'Tono del chat' },
  { id: 'members', label: 'Integrantes' },
]

// El tono del chat lo configura únicamente el ADMIN general (el backend rechaza con 403
// cualquier intento de un AREA_ADMIN de crear/editar AISettings), por eso no se le muestra
// esta pestaña.
const AREA_ADMIN_TABS = [
  { id: 'members', label: 'Integrantes de mi área' },
]

export default function Company() {
  const { organizationId, isAdmin, areaId, isLoading: authLoading, isError: authError } = useAuth()
  const [tab, setTab] = useState('branding')

  const tabs = isAdmin ? ADMIN_TABS : AREA_ADMIN_TABS
  const activeTab = tabs.some((t) => t.id === tab) ? tab : tabs[0].id

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-9 py-10">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-1.5 tracking-tight">
          {isAdmin ? 'Gestión de la empresa' : 'Mi área'}
        </h2>
        <p className="text-[14.5px] text-[var(--text-2)] mb-7">
          {isAdmin
            ? 'Personalizá el chatbot y administrá el acceso de tu organización.'
            : 'Consultá los integrantes de tu área.'}
        </p>

        <div
          className="inline-flex items-center rounded-[10px] p-[3px] gap-[2px] mb-6"
          style={{ background: 'var(--panel-2)' }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold cursor-pointer transition whitespace-nowrap"
              style={
                activeTab === t.id
                  ? { background: 'var(--tg-light-bg)', color: 'var(--tg-light-fg)', boxShadow: 'var(--tg-light-sh)' }
                  : { color: 'var(--muted)' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {authLoading ? (
          <p className="text-sm text-[var(--muted)]">Cargando...</p>
        ) : authError || !organizationId ? (
          <p className="text-sm" style={{ color: 'var(--danger)' }}>
            No se pudo determinar tu organización. Verificá tu sesión o intentá de nuevo más tarde.
          </p>
        ) : (
          <>
            {activeTab === 'branding' && isAdmin && <BrandingTab organizationId={organizationId} />}
            {activeTab === 'ai' && (
              <ChatToneTab organizationId={organizationId} isAdmin={isAdmin} fixedAreaId={isAdmin ? null : areaId} />
            )}
            {activeTab === 'members' && (
              <MembersTab organizationId={organizationId} isAdmin={isAdmin} myAreaId={areaId} />
            )}
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
      setError(`No se pudo guardar: ${getErrorMessage(err)}`)
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

function ChatToneTab({ organizationId, isAdmin, fixedAreaId }) {
  const queryClient = useQueryClient()
  const [scopeAreaId, setScopeAreaId] = useState('')
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const { data } = await getAreas()
      return data
    },
    enabled: !!isAdmin,
  })

  const effectiveAreaId = isAdmin ? (scopeAreaId ? Number(scopeAreaId) : null) : fixedAreaId

  const { data: settingsData, isLoading, isError: settingsError } = useQuery({
    queryKey: ['aisettings', organizationId],
    queryFn: async () => {
      const { data } = await getAllAISettings()
      return data
    },
    retry: false,
  })
  const allSettings = Array.isArray(settingsData) ? settingsData : []
  const activeSetting = allSettings.find((s) => (s.areaId ?? null) === effectiveAreaId && s.active) ?? null

  useEffect(() => {
    const { greeting, tone } = splitPrompt(activeSetting?.systemPrompt)
    setForm({
      modelName: activeSetting?.modelName || 'gpt-4o-mini',
      provider: activeSetting?.provider || 'openai',
      temperature: activeSetting?.temperature ?? 0.7,
      maxTokens: activeSetting?.maxTokens ?? 800,
      greeting,
      tone,
    })
    setSaved(false)
    // effectiveAreaId entra en las deps para recalcular el form al cambiar de área,
    // incluso si la nueva área todavía no tiene configuración propia (activeSetting null).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSetting, effectiveAreaId])

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => createAISettings({
      organizationId,
      areaId: effectiveAreaId,
      systemPrompt: joinPrompt(form.greeting, form.tone),
      modelName: form.modelName,
      provider: form.provider,
      temperature: Number(form.temperature),
      maxTokens: Number(form.maxTokens),
      active: true,
    }),
    onSuccess: () => {
      setSaved(true)
      setError('')
      queryClient.invalidateQueries({ queryKey: ['aisettings', organizationId] })
      setTimeout(() => setSaved(false), 2500)
    },
    onError: (err) => {
      setError(`No se pudo guardar: ${getErrorMessage(err)}`)
    },
  })

  if (isLoading || !form) {
    return <p className="text-sm text-[var(--muted)]">Cargando configuración del chat...</p>
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
      {isAdmin && (
        <div className="mb-4">
          <label className={label}>Configuración para</label>
          <select
            value={scopeAreaId}
            onChange={(e) => setScopeAreaId(e.target.value)}
            className={field}
          >
            <option value="">Toda la organización (predeterminado)</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>
      )}

      {settingsError ? (
        <p className="text-[12.5px] mb-4" style={{ color: 'var(--danger)' }}>
          No se pudo cargar la configuración existente. Podés igual crear una nueva al guardar.
        </p>
      ) : !activeSetting ? (
        <p className="text-[12.5px] mb-4" style={{ color: 'var(--muted)' }}>
          {effectiveAreaId
            ? 'Esta área todavía no tiene un tono propio: usa el de la organización hasta que guardes uno acá.'
            : 'Tu organización todavía no tiene un tono configurado. Al guardar se creará uno nuevo.'}
        </p>
      ) : null}

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
          <label className={label}>Saludo a los integrantes</label>
          <textarea
            value={form.greeting}
            onChange={set('greeting')}
            rows={2}
            className={`${field} resize-y`}
            placeholder="Ej: ¡Hola! Soy el asistente del área de Ventas, ¿en qué te puedo ayudar hoy?"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className={label}>Tono e instrucciones generales</label>
          <textarea
            value={form.tone}
            onChange={set('tone')}
            rows={5}
            className={`${field} resize-y`}
            placeholder="Ej: Respondé de forma clara y formal, solo sobre los documentos cargados de esta área."
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

function MembersTab({ organizationId, isAdmin, myAreaId }) {
  const queryClient = useQueryClient()
  const [selectedAreaId, setSelectedAreaId] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showCreateArea, setShowCreateArea] = useState(false)

  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const { data } = await getAreas()
      return data
    },
    enabled: !!isAdmin,
  })

  const effectiveAreaId = isAdmin ? selectedAreaId : myAreaId

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['members', organizationId, effectiveAreaId || 'all'],
    queryFn: async () => {
      const { data } = effectiveAreaId ? await getUsersByArea(effectiveAreaId) : await getUsers()
      return data
    },
    enabled: isAdmin || !!myAreaId,
  })

  const title = isAdmin ? 'Integrantes de la organización' : 'Integrantes de tu área'
  const showAreaColumn = isAdmin

  return (
    <div>
      <div
        className="rounded-[16px] overflow-hidden bg-[var(--panel)] border border-[var(--border-strong)]"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex items-center justify-between gap-3 px-[22px] py-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--text)] whitespace-nowrap">{title}</h3>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <select
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(e.target.value)}
                className="rounded-[9px] px-2.5 py-1.5 text-[12.5px] outline-none border bg-[var(--field)] text-[var(--text)] border-[var(--border-strong)]"
              >
                <option value="">Todas las áreas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowCreateArea(true)}
                className="rounded-[9px] px-3 py-1.5 text-[12.5px] font-semibold cursor-pointer transition border border-[var(--border-strong)] text-[var(--text-2)] hover:bg-[var(--panel-2)] whitespace-nowrap"
              >
                Crear área
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="rounded-[9px] px-3 py-1.5 text-[12.5px] font-semibold cursor-pointer transition hover:opacity-90 whitespace-nowrap"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
              >
                Crear usuario
              </button>
            )}
            <span className="text-[11px] text-[var(--muted)] font-mono whitespace-nowrap">
              {users.length} integrante{users.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {isError ? (
          <p className="text-sm p-6" style={{ color: 'var(--danger)' }}>{getErrorMessage(error)}</p>
        ) : isLoading ? (
          <p className="text-sm text-[var(--muted)] p-6">Cargando integrantes...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-[var(--muted)] p-6">No hay integrantes todavía.</p>
        ) : (
          <ul>
            {users.map((member) => {
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
                    {showAreaColumn && (
                      <span className="text-[11.5px] text-[var(--muted)]">
                        {member.area?.name ?? member.areaName ?? '—'}
                      </span>
                    )}
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

      {showCreate && (
        <CreateUserModal
          areas={areas}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['members', organizationId] })
            setShowCreate(false)
          }}
        />
      )}

      {showCreateArea && (
        <CreateAreaModal
          onClose={() => setShowCreateArea(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['areas'] })
            setShowCreateArea(false)
          }}
        />
      )}
    </div>
  )
}

function CreateAreaModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => createArea({ name }),
    onSuccess: onCreated,
    onError: (err) => setError(getErrorMessage(err)),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    save()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-[2px]">
      <form
        onSubmit={handleSubmit}
        className="rounded-[20px] p-7 max-w-md w-[90%] mx-4 bg-[var(--panel)] border border-[var(--border-strong)]"
        style={{ boxShadow: '0 30px 70px -20px rgba(0,0,0,0.5)' }}
      >
        <h2 className="text-lg font-bold text-[var(--text)] mb-5">Crear área</h2>

        <label className={label}>Nombre del área</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={field}
          placeholder="Ej: Ventas"
          required
          autoFocus
        />

        {error && <p className="text-sm mt-4" style={{ color: 'var(--danger)' }}>{error}</p>}

        <div className="flex gap-2.5 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[10px] py-2.5 text-[13.5px] font-semibold cursor-pointer transition border border-[var(--border-strong)] text-[var(--text-2)] hover:bg-[var(--panel-2)]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-[10px] py-2.5 text-[13.5px] font-semibold cursor-pointer transition hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            {isPending ? 'Creando...' : 'Crear área'}
          </button>
        </div>
      </form>
    </div>
  )
}

function CreateUserModal({ areas, onClose, onCreated }) {
  const [form, setForm] = useState({
    userName: '',
    lastName: '',
    email: '',
    password: '',
    enabled: true,
    areaId: '',
    roleId: '',
  })
  const [error, setError] = useState('')

  const { data: rolesData, isError: rolesError } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data } = await getRoles()
      return data
    },
    retry: false,
  })
  // El backend puede devolver un payload corrupto (200 con error serializado en el cuerpo)
  // si la relación Role/Permission tiene una referencia circular: nunca confiar en la forma.
  const roles = Array.isArray(rolesData) ? rolesData : []

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => createUser({
      userName: form.userName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      enabled: form.enabled,
      areaId: Number(form.areaId),
      rolesId: [Number(form.roleId)],
    }),
    onSuccess: onCreated,
    onError: (err) => setError(getErrorMessage(err)),
  })

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    save()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-[2px]">
      <form
        onSubmit={handleSubmit}
        className="rounded-[20px] p-7 max-w-md w-[90%] mx-4 bg-[var(--panel)] border border-[var(--border-strong)]"
        style={{ boxShadow: '0 30px 70px -20px rgba(0,0,0,0.5)' }}
      >
        <h2 className="text-lg font-bold text-[var(--text)] mb-5">Crear usuario</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Usuario</label>
            <input type="text" value={form.userName} onChange={set('userName')} className={field} required />
          </div>
          <div>
            <label className={label}>Apellido</label>
            <input type="text" value={form.lastName} onChange={set('lastName')} className={field} required />
          </div>
        </div>

        <label className={`${label} mt-3`}>Email</label>
        <input type="email" value={form.email} onChange={set('email')} className={field} required />

        <label className={`${label} mt-3`}>Contraseña</label>
        <input type="password" value={form.password} onChange={set('password')} className={field} minLength={8} required />

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className={label}>Área</label>
            <select value={form.areaId} onChange={set('areaId')} className={field} required>
              <option value="" disabled>Elegir área</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Rol</label>
            <select value={form.roleId} onChange={set('roleId')} className={field} required>
              <option value="" disabled>Elegir rol</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            {rolesError && (
              <p className="text-[11.5px] mt-1" style={{ color: 'var(--danger)' }}>
                No se pudieron cargar los roles disponibles.
              </p>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
          />
          <span className="text-[13px] text-[var(--text-2)]">Usuario activo</span>
        </label>

        {error && <p className="text-sm mt-4" style={{ color: 'var(--danger)' }}>{error}</p>}

        <div className="flex gap-2.5 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[10px] py-2.5 text-[13.5px] font-semibold cursor-pointer transition border border-[var(--border-strong)] text-[var(--text-2)] hover:bg-[var(--panel-2)]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-[10px] py-2.5 text-[13.5px] font-semibold cursor-pointer transition hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            {isPending ? 'Creando...' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </div>
  )
}
