'use client'

import { useSummary } from '@/hooks/useDocument'
import { FileText, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface SummaryViewProps {
  documentId: string
}

export function SummaryView({ documentId }: SummaryViewProps) {
  const { data: summary, isLoading, error } = useSummary(documentId)

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-gray-600">Generating summary...</p>
        <p className="text-sm text-gray-500 mt-2">
          This may take a moment for large documents
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-red-600 mb-2">Failed to generate summary</p>
        <p className="text-sm text-gray-600">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold text-gray-900">Document Summary</h3>
      </div>

      {summary ? (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No summary available yet</p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <strong>Powered by:</strong> T5 Legal Summarization Model
        </p>
        <p className="text-xs text-gray-500 mt-1">
          This summary highlights key legal points, parties, obligations, and risks.
        </p>
      </div>
    </div>
  )
}
