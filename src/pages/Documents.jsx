import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { getDocuments, uploadDocument } from '../services/api'

const ORG_ID = 1
const AREA_ID = 1
const STATUS_ID = 1
const UPLOADED_BY = 1

export default function Documents() {
  const queryClient = useQueryClient()
  const fileRef = useRef()
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [uploadError, setUploadError] = useState('')

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data } = await getDocuments()
      return data
    },
  })

  const { mutate: upload, isPending } = useMutation({
    mutationFn: async () => {
      const form = new FormData()
      form.append('filePath', file)
      form.append('title', title)
      form.append('organizationId', ORG_ID)
      form.append('areaId', AREA_ID)
      form.append('statusId', STATUS_ID)
      form.append('uploadedById', UPLOADED_BY)
      return uploadDocument(form)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      setTitle('')
      setFile(null)
      fileRef.current.value = ''
      setUploadError('')
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.response?.status || err?.message || 'Error desconocido'
      setUploadError(`Error al subir: ${msg}`)
    },
  })

  const handleSubmit = () => {
    if (!file || !title.trim()) {
      setUploadError(`Faltan datos: ${!title.trim() ? 'título ' : ''}${!file ? 'archivo' : ''}`.trim())
      return
    }
    setUploadError('')
    upload()
  }

  const formatSize = (bytes) => {
    if (!bytes) return '-'
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">Documentos</h2>

        {/* Upload form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Subir nuevo documento</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Título del documento"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {file && (
              <p className="text-xs text-green-600">✓ {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>
            )}
            {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {isPending ? 'Subiendo...' : 'Subir PDF'}
            </button>
          </div>
        </div>

        {/* Document list */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-medium text-slate-700">Documentos cargados</h3>
          </div>

          {isLoading ? (
            <p className="text-sm text-slate-400 p-6">Cargando...</p>
          ) : documents.length === 0 ? (
            <p className="text-sm text-slate-400 p-6">No hay documentos todavía.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{doc.title}</p>
                      <p className="text-xs text-slate-400">{doc.fileName}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{formatSize(doc.fileSize)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  )
}
