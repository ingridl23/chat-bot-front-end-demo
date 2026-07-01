import { useState, useRef, useEffect } from 'react'
import Layout from '../components/Layout'
import { askChat } from '../services/api'
import { IconSend } from '../components/icons'

const ORG_ID = 1
const INITIAL_MESSAGE = { role: 'bot', text: 'Hola. Puedo responder preguntas sobre los documentos cargados. ¿En qué te ayudo?' }
const STORAGE_KEY = 'chat_messages'

export default function Chat() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : [INITIAL_MESSAGE]
    } catch {
      return [INITIAL_MESSAGE]
    }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE])
    localStorage.removeItem(STORAGE_KEY)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const question = input.trim()
    if (!question || loading) return

    setMessages((prev) => [...prev, { role: 'user', text: question }])
    setInput('')
    setLoading(true)

    try {
      const { data } = await askChat(question, ORG_ID)
      setMessages((prev) => [...prev, { role: 'bot', text: data.answer, source: data.source }])
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Ocurrió un error. Intentá de nuevo.' }])
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
