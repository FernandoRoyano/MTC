'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Documento, Paciente, TipoDocumento } from '@/types'
import Link from 'next/link'
import {
  ArrowLeft,
  Upload,
  FileText,
  Image,
  Trash2,
  Download,
  Filter,
  Eye,
  X,
} from 'lucide-react'

const TIPOS: { value: TipoDocumento; label: string }[] = [
  { value: 'analitica', label: 'Analítica' },
  { value: 'informe', label: 'Informe' },
  { value: 'imagen', label: 'Imagen' },
  { value: 'cuestionario', label: 'Cuestionario' },
  { value: 'otro', label: 'Otro' },
]

export default function DocumentosPage() {
  const params = useParams()
  const pacienteId = params.id as string
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<string>('')
  const [preview, setPreview] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Form de subida
  const [showUpload, setShowUpload] = useState(false)
  const [uploadNombre, setUploadNombre] = useState('')
  const [uploadTipo, setUploadTipo] = useState<TipoDocumento>('otro')
  const [uploadNotas, setUploadNotas] = useState('')
  const [uploadFecha, setUploadFecha] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const supabase = createClient()

  useEffect(() => {
    cargar()
  }, [pacienteId])

  async function cargar() {
    setLoading(true)
    const [pacRes, docsRes] = await Promise.all([
      supabase.from('pacientes').select('*').eq('id', pacienteId).single(),
      supabase
        .from('documentos')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false }),
    ])
    if (pacRes.data) setPaciente(pacRes.data)
    if (docsRes.data) setDocumentos(docsRes.data)
    setLoading(false)
  }

  async function subirDocumento() {
    if (!selectedFile) return
    setUploading(true)

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { setUploading(false); return }

    const ext = selectedFile.name.split('.').pop()
    const filePath = `${pacienteId}/${Date.now()}.${ext}`

    const { error: storageError } = await supabase.storage
      .from('documentos-pacientes')
      .upload(filePath, selectedFile)

    if (storageError) {
      console.error('Error subiendo archivo:', storageError)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('documentos-pacientes')
      .getPublicUrl(filePath)

    const { error: dbError } = await supabase.from('documentos').insert({
      paciente_id: pacienteId,
      terapeuta_id: userData.user.id,
      nombre: uploadNombre || selectedFile.name,
      tipo: uploadTipo,
      archivo_url: filePath,
      notas: uploadNotas || null,
      fecha_documento: uploadFecha || null,
    })

    if (!dbError) {
      resetUpload()
      cargar()
    }
    setUploading(false)
  }

  async function eliminarDocumento(doc: Documento) {
    await supabase.storage.from('documentos-pacientes').remove([doc.archivo_url])
    await supabase.from('documentos').delete().eq('id', doc.id)
    setConfirmDelete(null)
    cargar()
  }

  async function descargar(doc: Documento) {
    const { data } = await supabase.storage
      .from('documentos-pacientes')
      .createSignedUrl(doc.archivo_url, 60)
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  async function verPreview(doc: Documento) {
    const { data } = await supabase.storage
      .from('documentos-pacientes')
      .createSignedUrl(doc.archivo_url, 60)
    if (data?.signedUrl) {
      setPreview(data.signedUrl)
    }
  }

  function resetUpload() {
    setShowUpload(false)
    setUploadNombre('')
    setUploadTipo('otro')
    setUploadNotas('')
    setUploadFecha('')
    setSelectedFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function tipoLabel(tipo: string | null): string {
    return TIPOS.find((t) => t.value === tipo)?.label || 'Otro'
  }

  const docsFiltrados = filtroTipo
    ? documentos.filter((d) => d.tipo === filtroTipo)
    : documentos

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salvia-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/pacientes/${pacienteId}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-arena-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Documentos</h1>
            {paciente && (
              <p className="text-sm text-gray-500">
                {paciente.nombre} {paciente.apellidos}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 bg-salvia-500 hover:bg-salvia-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Upload className="w-4 h-4" />
          Subir documento
        </button>
      </div>

      {/* Form de subida */}
      {showUpload && (
        <div className="bg-white border border-arena-200 rounded-xl p-6 space-y-4">
          <h3 className="font-medium text-gray-800">Subir documento</h3>

          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setSelectedFile(file)
                  if (!uploadNombre) setUploadNombre(file.name)
                }
              }}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-salvia-50 file:text-salvia-700 hover:file:bg-salvia-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                value={uploadNombre}
                onChange={(e) => setUploadNombre(e.target.value)}
                className="w-full px-3 py-2 border border-arena-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salvia-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={uploadTipo}
                onChange={(e) => setUploadTipo(e.target.value as TipoDocumento)}
                className="w-full px-3 py-2 border border-arena-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salvia-300"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={uploadFecha}
                onChange={(e) => setUploadFecha(e.target.value)}
                className="w-full px-3 py-2 border border-arena-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salvia-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <input
              value={uploadNotas}
              onChange={(e) => setUploadNotas(e.target.value)}
              className="w-full px-3 py-2 border border-arena-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salvia-300"
              placeholder="Notas opcionales sobre el documento"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={subirDocumento}
              disabled={!selectedFile || uploading}
              className="flex items-center gap-2 bg-salvia-500 hover:bg-salvia-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Subiendo...' : 'Subir'}
            </button>
            <button
              onClick={resetUpload}
              className="px-4 py-2 border border-arena-200 rounded-lg text-sm hover:bg-arena-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Filtro */}
      {documentos.length > 0 && (
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-3 py-1.5 border border-arena-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-salvia-300"
          >
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <span className="text-xs text-gray-400">{docsFiltrados.length} documentos</span>
        </div>
      )}

      {/* Lista */}
      {docsFiltrados.length === 0 ? (
        <div className="bg-white border border-arena-200 rounded-xl p-8 text-center">
          <p className="text-gray-400">No hay documentos</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docsFiltrados.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-arena-200 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-arena-100 rounded-lg flex items-center justify-center">
                  {doc.tipo === 'imagen' ? (
                    <Image className="w-5 h-5 text-salvia-500" />
                  ) : (
                    <FileText className="w-5 h-5 text-salvia-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{doc.nombre}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="bg-arena-100 px-1.5 py-0.5 rounded">{tipoLabel(doc.tipo)}</span>
                    {doc.fecha_documento && (
                      <span>{new Date(doc.fecha_documento).toLocaleDateString('es-ES')}</span>
                    )}
                    {doc.notas && <span className="truncate max-w-[200px]">{doc.notas}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {doc.tipo === 'imagen' && (
                  <button
                    onClick={() => verPreview(doc)}
                    className="p-2 rounded-lg hover:bg-arena-50 text-gray-400 hover:text-salvia-500 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => descargar(doc)}
                  className="p-2 rounded-lg hover:bg-arena-50 text-gray-400 hover:text-salvia-500 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                {confirmDelete === doc.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => eliminarDocumento(doc)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                    >
                      Sí
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-2 py-1 border border-arena-200 rounded text-xs"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(doc.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal preview imagen */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-w-3xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-[80vh] rounded-xl shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
