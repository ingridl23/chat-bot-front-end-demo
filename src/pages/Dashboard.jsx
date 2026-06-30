import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Bienvenido</h2>
        <p className="text-sm text-slate-500 mb-8">Seleccioná una sección para comenzar.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => navigate('/documents')}
            className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer hover:shadow-md hover:border-indigo-200 border border-transparent transition"
          >
            <div className="text-3xl mb-3">📄</div>
            <h3 className="font-semibold text-slate-800">Documentos</h3>
            <p className="text-sm text-slate-500 mt-1">Subí y gestioná los PDFs de la organización</p>
          </div>

          <div
            onClick={() => navigate('/chat')}
            className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer hover:shadow-md hover:border-indigo-200 border border-transparent transition"
          >
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold text-slate-800">Chat</h3>
            <p className="text-sm text-slate-500 mt-1">Consultá al agente sobre los documentos</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
