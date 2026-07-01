import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { IconDoc, IconChat } from '../components/icons'

export default function Dashboard() {
  const navigate = useNavigate()

  const card =
    'text-left rounded-[16px] p-6 cursor-pointer transition-[transform,box-shadow] duration-200 ' +
    'bg-[var(--panel)] border border-[var(--border-strong)] hover:-translate-y-0.5'

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-9 py-10">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-1.5 tracking-tight">Bienvenido</h2>
        <p className="text-[14.5px] text-[var(--text-2)] mb-7">Seleccioná una sección para comenzar.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/documents')}
            className={card}
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <div
              className="w-11 h-11 rounded-[11px] flex items-center justify-center mb-4"
              style={{ background: 'var(--panel-2)', color: 'var(--text)' }}
            >
              <IconDoc size={22} />
            </div>
            <div className="text-base font-bold text-[var(--text)]">Documentos</div>
            <p className="text-[13.5px] text-[var(--text-2)] mt-1.5 leading-relaxed">
              Subí y gestioná los PDFs de la organización
            </p>
          </button>

          <button
            onClick={() => navigate('/chat')}
            className={card}
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <div
              className="w-11 h-11 rounded-[11px] flex items-center justify-center mb-4"
              style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              <IconChat size={22} />
            </div>
            <div className="text-base font-bold text-[var(--text)]">Chat</div>
            <p className="text-[13.5px] text-[var(--text-2)] mt-1.5 leading-relaxed">
              Consultá al agente sobre los documentos
            </p>
          </button>
        </div>
      </div>
    </Layout>
  )
}
