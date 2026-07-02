import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { getDocuments, uploadDocument, deleteDocument } from '../services/api'
import { IconDoc, IconUpload, IconTrash } from '../components/icons'

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

  const [deleteError, setDeleteError] = useState('')

  const { mutate: removeDocument, isPending: isDeleting, variables: deletingId } = useMutation({
    mutationFn: ({ id }) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      setDeleteError('')
    },
    onError: (err, { title }) => {
      const status = err?.response?.status
      const msg = status >= 500
        ? `No se pudo eliminar "${title}" por un error en el servidor. Intentá de nuevo más tarde.`
        : `No se pudo eliminar "${title}": ${err?.response?.data?.message || err?.message || 'error desconocido'}`
      setDeleteError(msg)
    },
  })

  const [docToDelete, setDocToDelete] = useState(null)

  const confirmDelete = () => {
    setDeleteError('')
    removeDocument({ id: docToDelete.id, title: docToDelete.title })
    setDocToDelete(null)
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

          {deleteError && (
            <p className="text-sm px-[22px] pt-3" style={{ color: 'var(--danger)' }}>{deleteError}</p>
          )}

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
                  <div className="flex items-center gap-4">
                    <span className="text-[12.5px] text-[var(--muted)] font-mono">{formatSize(doc.fileSize)}</span>
                    <button
                      type="button"
                      onClick={() => setDocToDelete(doc)}
                      disabled={isDeleting && deletingId?.id === doc.id}
                      aria-label={`Eliminar ${doc.title}`}
                      className="w-8 h-8 rounded-[9px] flex items-center justify-center cursor-pointer transition text-[var(--muted)]
                        hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {docToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-[2px] animate-[gfade_.2s_ease]">
          <div
            className="rounded-[20px] p-8 max-w-sm w-[90%] mx-4 text-center bg-[var(--panel)] border border-[var(--border-strong)]"
            style={{ boxShadow: '0 30px 70px -20px rgba(0,0,0,0.5)' }}
          >
            <div
              className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
            >
              <IconTrash size={22} />
            </div>
            <h2 className="text-lg font-bold text-[var(--text)] mb-2">¿Eliminar documento?</h2>
            <p className="text-sm text-[var(--text-2)] mb-6 leading-relaxed">
              Esta acción no se puede deshacer. Se eliminará{' '}
              <span className="font-bold text-[var(--text)]">"{docToDelete.title}"</span> permanentemente.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setDocToDelete(null)}
                className="flex-1 rounded-[10px] py-2.5 text-[13.5px] font-semibold cursor-pointer transition border border-[var(--border-strong)] text-[var(--text-2)] hover:bg-[var(--panel-2)]"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-[10px] py-2.5 text-[13.5px] font-semibold cursor-pointer transition hover:opacity-90"
                style={{ background: 'var(--danger)', color: '#fff' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
