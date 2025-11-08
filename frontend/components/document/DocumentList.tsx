'use client'

import { useDocuments, useDeleteDocument } from '@/hooks/useDocument'
import { FileText, Trash2, Clock } from 'lucide-react'

interface DocumentListProps {
  onDocumentSelect?: (documentId: string) => void
}

export function DocumentList({ onDocumentSelect }: DocumentListProps = {}) {
  const { data: documents, isLoading, error } = useDocuments()
  const deleteMutation = useDeleteDocument()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-12 text-center border-2 border-wood-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-wood-medium mx-auto mb-4" />
        <p className="text-wood-dark text-lg">Loading documents...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-12 text-center border-2 border-red-300">
        <p className="text-red-700 text-lg font-semibold">Failed to load documents</p>
      </div>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950 rounded-none shadow-xl p-12 text-center border-4 border-amber-800 dark:border-amber-700" style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)' }}>
        <FileText className="w-20 h-20 mx-auto mb-4 text-amber-900 dark:text-amber-100" />
        <p className="text-amber-900 dark:text-amber-100 text-xl font-black mb-4" style={{ fontFamily: 'Georgia, serif' }}>Welcome to Absola</p>
        <p className="text-amber-800 dark:text-amber-200 mt-2 font-semibold leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
          To begin your legal document analysis journey, upload your first document above. 
          Absola uses advanced AI-powered Retrieval-Augmented Generation (RAG) to provide detailed, 
          context-aware answers to your legal questions. Our system analyzes your documents with deep 
          understanding of Indian law, including IPC, CrPC, constitutional provisions, and case law.
          Simply upload a PDF or scanned document, and start asking questions in natural language.
        </p>
      </div>
    )
  }

  const handleDelete = async (id: string, filename: string) => {
    if (confirm(`Delete "${filename}"?`)) {
      await deleteMutation.mutateAsync(id)
    }
  }

  return (
    <div className="grid gap-4 grid-cols-1 w-full">
      {documents.map((doc) => (
        <div
          key={doc._id}
          className="bg-amber-50 dark:bg-amber-950 rounded-none shadow-lg p-4 border-4 border-amber-800 dark:border-amber-700 w-full"
          style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)' }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-amber-900 dark:text-amber-100 truncate mb-2 text-lg" style={{ fontFamily: 'Georgia, serif' }}>
                {doc.filename}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <StatusBadge status={doc.status} />
              </div>
            </div>
            <div className="bg-amber-800 dark:bg-amber-700 p-2 rounded-none">
              <FileText className="w-5 h-5 text-amber-50 flex-shrink-0" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 mb-3">
            <Clock className="w-4 h-4" />
            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex gap-2">
            {onDocumentSelect && doc.status === 'ready' && (
              <button
                onClick={() => onDocumentSelect(doc._id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-800 dark:bg-amber-700 text-amber-50 rounded-none hover:bg-amber-700 dark:hover:bg-amber-600 transition-all shadow-md font-semibold text-sm"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                <FileText className="w-4 h-4" />
                Ask Questions
              </button>
            )}
            <button
              onClick={() => handleDelete(doc._id, doc.filename)}
              disabled={deleteMutation.isPending}
              className="px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-none hover:bg-red-200 dark:hover:bg-red-800 transition-all disabled:opacity-50 shadow-md text-sm"
              title="Delete document"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: 'processing' | 'ready' | 'error' }) {
  const styles = {
    processing: 'bg-amber-100 text-amber-900 border-amber-300',
    ready: 'bg-green-100 text-green-900 border-green-300',
    error: 'bg-red-100 text-red-900 border-red-300',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
