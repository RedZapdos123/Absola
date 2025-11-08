'use client'

import { useParams } from 'next/navigation'
import { useDocument } from '@/hooks/useDocument'
import { SummaryView } from '@/components/analysis/SummaryView'
import { ChatInterface } from '@/components/rag/ChatInterface'
import { DocumentViewer } from '@/components/document/DocumentViewer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ArrowLeft, FileText, MessageSquare, Eye } from 'lucide-react'
import Link from 'next/link'

export default function DocumentPage() {
  const params = useParams()
  const documentId = params?.id as string
  const { document, isLoading, error } = useDocument(documentId)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load document</p>
          <Link href="/" className="text-primary hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to documents
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{document.filename}</h1>
          <p className="text-gray-600 mt-1">
            Status: <span className="font-medium">{document.status}</span>
          </p>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Ask Questions
            </TabsTrigger>
            <TabsTrigger value="viewer" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              View Document
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <SummaryView documentId={documentId} />
          </TabsContent>

          <TabsContent value="chat">
            <ChatInterface documentId={documentId} />
          </TabsContent>

          <TabsContent value="viewer">
            <DocumentViewer document={document} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
