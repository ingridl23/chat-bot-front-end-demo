import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { getDocuments, uploadDocument } from '../services/api'
import { IconDoc, IconUpload } from '../components/icons'

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
    if (!bytes) return '—'
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-9 py-10">
        <h2 className="text-2xl font-bold text-[var(--text)] mb-6 tracking-tight">Documentos</h2>

        {/* Subir */}
        <div
          className="rounded-[16px] p-[22px] mb-[22px] bg-[var(--panel)] border border-[var(--border-strong)]"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Subir nuevo documento</h3>

          <input
            type="text"
            placeholder="Título del documento"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-[10px] px-3.5 py-2.5 text-sm outline-none border transition mb-3
              bg-[var(--field)] text-[var(--text)] border-[var(--border-strong)]
              placeholder:text-[var(--muted)] focus:border-[var(--accent)]
              focus:shadow-[0_0_0_3px_var(--focus-ring)]"
            required
          />

          <label className="flex items-center gap-3 mb-1 cursor-pointer">
            <span
              className="inline-flex items-center gap-1.5 rounded-[9px] px-3.5 py-2.5 text-[13px] font-semibold whitespace-nowrap"
              style={{ background: 'var(--panel-2)', color: 'var(--text)' }}
            >
              <IconUpload /> Elegir archivo
            </span>
            <span className="text-[13px] text-[var(--muted)] truncate">
              {file ? file.name : 'Ningún archivo seleccionado'}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="hidden"
            />
          </label>

          {uploadError && <p className="text-sm mt-2" style={{ color: 'var(--danger)' }}>{uploadError}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="mt-4 rounded-[10px] px-[18px] py-2.5 text-[13.5px] font-semibold cursor-pointer transition hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            {isPending ? 'Subiendo...' : 'Subir PDF'}
          </button>
        </div>

        {/* Listado */}
        <div
          className="rounded-[16px] overflow-hidden bg-[var(--panel)] border border-[var(--border-strong)]"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center justify-between px-[22px] py-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--text)] whitespace-nowrap">Documentos cargados</h3>
            <span className="text-[11px] text-[var(--muted)] font-mono whitespace-nowrap">
              {documents.length} archivo{documents.length === 1 ? '' : 's'}
            </span>
          </div>

          {isLoading ? (
            <p className="text-sm text-[var(--muted)] p-6">Cargando...</p>
          ) : documents.length === 0 ? (
            <p className="text-sm text-[var(--muted)] p-6">No hay documentos todavía.</p>
          ) : (
            <ul>
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between px-[22px] py-[15px] border-t border-[var(--border)]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center"
                      style={{ background: 'var(--panel-2)', color: 'var(--text-2)' }}
                    >
                      <IconDoc />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">{doc.title}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5 font-mono">{doc.fileName}</p>
                    </div>
                  </div>
                  <span className="text-[12.5px] text-[var(--muted)] font-mono">{formatSize(doc.fileSize)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  )
}
