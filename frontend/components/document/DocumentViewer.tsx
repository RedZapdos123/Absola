'use client'

import { DocumentRecord } from '@/lib/api'
import { FileText } from 'lucide-react'

interface DocumentViewerProps {
  document: DocumentRecord
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold text-gray-900">Document Viewer</h3>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 mb-2">Document Preview</p>
        <p className="text-sm text-gray-500">
          {document.filename}
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Full document viewer coming soon. For now, use the summary and chat features.
        </p>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Document viewing requires react-pdf configuration. 
          The document is stored securely at: <code className="text-xs bg-white px-2 py-1 rounded">{document.localFilepath}</code>
        </p>
      </div>
    </div>
  )
}
