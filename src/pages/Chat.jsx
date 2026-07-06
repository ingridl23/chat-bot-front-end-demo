import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { askChat, getActiveAISettings } from '../services/api'
import { IconSend } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { splitPrompt } from '../utils/systemPrompt'

const DEFAULT_GREETING = 'Hola. Puedo responder preguntas sobre los documentos cargados. ¿En qué te ayudo?'

export default function Chat() {
  const { user, organizationId, areaId } = useAuth()
  // Solo se persiste la conversación real (preguntas/respuestas), nunca el saludo: así el
  // saludo siempre refleja la config vigente en vez de quedar "congelado" desde la primera
  // vez que este usuario abrió el chat. Se guarda por usuario para no mezclar conversaciones
  // si dos personas comparten el navegador.
  const storageKey = `chat_messages_${user?.id ?? 'anon'}`

  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  // Saludo configurado por el admin (o area-admin) para la organización/área del usuario
  // logueado, con fallback al de organización si el área no tiene uno propio activo.
  const { data: settingsData } = useQuery({
    queryKey: ['aisettings-active', organizationId, areaId],
    queryFn: async () => {
      const { data } = await getActiveAISettings(organizationId, areaId)
      return data
    },
    enabled: !!organizationId,
    retry: false,
  })
  const greeting = splitPrompt(settingsData?.systemPrompt).greeting || DEFAULT_GREETING
  const messages = [{ role: 'bot', text: greeting }, ...history]

  // Recarga el historial guardado cada vez que se conoce el usuario logueado (storageKey
  // pasa de 'chat_messages_anon' al id real apenas resuelve el /me).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      setHistory(saved ? JSON.parse(saved) : [])
    } catch {
      setHistory([])
    }
  }, [storageKey])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(history))
  }, [history, storageKey])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const clearChat = () => {
    setHistory([])
    localStorage.removeItem(storageKey)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const question = input.trim()
    if (!question || loading) return

    setHistory((prev) => [...prev, { role: 'user', text: question }])
    setInput('')
    setLoading(true)

    try {
      const { data } = await askChat(question, organizationId)
      setHistory((prev) => [...prev, { role: 'bot', text: data.answer, source: data.source }])
    } catch {
      setHistory((prev) => [...prev, { role: 'bot', text: 'Ocurrió un error. Intentá de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  const Avatar = () => (
    <div
      className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-bold"
      style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
    >
      AI
    </div>
  )

  return (
    <Layout>
      <div className="max-w-[720px] mx-auto px-9 py-7 h-screen flex flex-col">
        <div className="flex items-center justify-between mb-[18px]">
          <div>
            <h2 className="text-xl font-bold text-[var(--text)] tracking-tight">Chat con el agente</h2>
            <p className="text-[12.5px] text-[var(--muted)] mt-0.5">Responde según tus documentos cargados</p>
          </div>
          <button
            onClick={clearChat}
            className="rounded-[9px] px-3 py-[7px] text-[12.5px] cursor-pointer transition whitespace-nowrap
              bg-[var(--panel)] text-[var(--text-2)] border border-[var(--border-strong)] hover:bg-[var(--panel-2)]"
          >
            Limpiar historial
          </button>
        </div>

        {/* Mensajes */}
        <div
          className="flex-1 min-h-0 overflow-y-auto rounded-[16px] p-5 flex flex-col gap-3.5
            bg-[var(--panel)] border border-[var(--border-strong)]"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user'
            return (
              <div
                key={i}
                className={`flex gap-2.5 animate-[gfade_.25s_ease] ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && <Avatar />}
                <div className="flex flex-col gap-2 max-w-[82%]">
                  <div
                    className="text-[13.5px] leading-relaxed px-3.5 py-2.5 whitespace-pre-wrap"
                    style={{
                      background: isUser ? 'var(--accent)' : 'var(--panel-2)',
                      color: isUser ? 'var(--accent-text)' : 'var(--text)',
                      fontWeight: isUser ? 500 : 400,
                      borderRadius: '14px',
                      borderTopRightRadius: isUser ? '4px' : '14px',
                      borderTopLeftRadius: isUser ? '14px' : '4px',
                    }}
                  >
                    {msg.text}
                  </div>
                  {msg.source && (
                    <div
                      className="inline-flex items-center gap-1.5 self-start rounded-[9px] px-2.5 py-1.5 text-[11.5px]
                        bg-[var(--panel-2)] text-[var(--text-2)] border border-[var(--border)]"
                    >
                      {msg.source}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {loading && (
            <div className="flex gap-2.5 items-center">
              <Avatar />
              <div
                className="px-3.5 py-3 flex gap-1.5"
                style={{ background: 'var(--panel-2)', borderRadius: '14px', borderTopLeftRadius: '4px' }}
              >
                <span className="w-[7px] h-[7px] rounded-full animate-[gblink_1.2s_infinite]" style={{ background: 'var(--muted)' }} />
                <span className="w-[7px] h-[7px] rounded-full animate-[gblink_1.2s_infinite_0.2s]" style={{ background: 'var(--muted)' }} />
                <span className="w-[7px] h-[7px] rounded-full animate-[gblink_1.2s_infinite_0.4s]" style={{ background: 'var(--muted)' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2.5 mt-3.5 rounded-[14px] pl-4 pr-[7px] py-[7px]
            bg-[var(--panel)] border border-[var(--border-strong)] focus-within:border-[var(--accent)]
            focus-within:shadow-[0_0_0_3px_var(--focus-ring)] transition"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hacé una pregunta sobre los documentos…"
            className="flex-1 bg-transparent outline-none text-sm text-[var(--text)] placeholder:text-[var(--muted)]"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-[10px] shrink-0 flex items-center justify-center cursor-pointer transition hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <IconSend />
          </button>
        </form>
      </div>
    </Layout>
  )
}
