'use client'

import { useState } from 'react'
import { Send, Trash2, Loader2, Download } from 'lucide-react'
import { documentApi } from '@/lib/api'
import jsPDF from 'jspdf'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}

interface RAGChatProps {
  documentId?: string
}

export function RAGChat({ documentId }: RAGChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [query, setQuery] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!query.trim()) {
      setError('Please enter a question')
      return
    }

    if (!documentId) {
      setError('Please upload a document first')
      return
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
    }

    setMessages(prev => [...prev, userMessage])
    setLoading(true)
    setError('')
    setQuery('')

    try {
      const response = await documentApi.query(documentId, query, userPrompt || undefined)

      if (response.ok && response.data) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.answer,
          sources: response.data.sources,
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        setError(response.error?.message || 'Failed to get answer')
        // Remove the user message if there was an error
        setMessages(prev => prev.slice(0, -1))
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Network error. Please try again.')
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setMessages([])
    setQuery('')
    setUserPrompt('')
    setError('')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSend()
    }
  }

  const exportToPDF = (message: ChatMessage) => {
    if (message.role !== 'assistant') return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - 2 * margin
    let y = 20

    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('ABSOLA - Legal Analysis Response', margin, y)
    y += 15

    // Separator line
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
    y += 10

    // Response
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const responseLines = doc.splitTextToSize(message.content, maxWidth)
    for (let i = 0; i < responseLines.length; i++) {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(responseLines[i], margin, y)
      y += 6
    }

    // Sources
    if (message.sources && message.sources.length > 0) {
      y += 10
      if (y > 250) {
        doc.addPage()
        y = 20
      }
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Sources Referenced:', margin, y)
      y += 7
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      message.sources.forEach((source, idx) => {
        if (y > 270) {
          doc.addPage()
          y = 20
        }
        const sourceLines = doc.splitTextToSize(`${idx + 1}. ${source}`, maxWidth)
        doc.text(sourceLines, margin, y)
        y += sourceLines.length * 6 + 3
      })
    }

    // Footer
    if (y > 260) {
      doc.addPage()
      y = 20
    }
    y += 10
    doc.setFontSize(9)
    doc.setTextColor(128, 128, 128)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, y)
    doc.text('Powered by Absola - Azure Division', margin, y + 5)

    doc.save(`absola-response-${Date.now()}.pdf`)
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950 rounded-none border-4 border-amber-800 dark:border-amber-700 shadow-lg p-6 w-full" style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)' }}>
      {/* Chat Messages Display */}
      <div className="mb-6 max-h-96 overflow-y-auto space-y-4 bg-white dark:bg-amber-900 p-4 rounded-none border-2 border-amber-800 dark:border-amber-700">
        {messages.length === 0 ? (
          <div className="text-center text-amber-700 dark:text-amber-300 italic font-semibold min-h-64 flex items-center justify-center" style={{ fontFamily: 'Georgia, serif' }}>
            {!documentId ? (
              <div>
                <p className="mb-4">Upload a document to begin asking questions</p>
                <p className="text-sm opacity-75">Your AI-powered legal assistant is ready to help analyze your documents with natural language Q&A, summaries, and insights.</p>
              </div>
            ) : (
              <div>
                <p>Start asking questions about your document...</p>
              </div>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-none border-2 ${
                  message.role === 'user'
                    ? 'bg-amber-800 dark:bg-amber-700 text-amber-50 border-amber-900'
                    : 'bg-amber-100 dark:bg-amber-800 text-amber-900 dark:text-amber-100 border-amber-800 dark:border-amber-700'
                }`}
                style={{ fontFamily: 'Georgia, serif' }}
              >
                <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">{message.content}</p>

                {/* Sources for assistant messages */}
                {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-current border-opacity-30 space-y-2">
                    <p className="text-xs font-bold opacity-75">Sources:</p>
                    {message.sources.map((source, idx) => (
                      <div key={idx} className="text-xs opacity-80 italic">
                        • {source.substring(0, 100)}...
                      </div>
                    ))}
                  </div>
                )}

                {/* Export button for assistant messages */}
                {message.role === 'assistant' && (
                  <button
                    onClick={() => exportToPDF(message)}
                    className="mt-2 flex items-center gap-1 px-2 py-1 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded transition"
                  >
                    <Download className="w-3 h-3" />
                    PDF
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start gap-3">
            <div className="flex items-center gap-2 px-4 py-3 bg-amber-100 dark:bg-amber-800 text-amber-900 dark:text-amber-100 rounded-none border-2 border-amber-800">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                Generating response...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border-2 border-red-600 text-red-900 dark:text-red-100 font-semibold rounded-none" style={{ fontFamily: 'Georgia, serif' }}>
          {error}
        </div>
      )}

      {/* Additional Instructions Input */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-amber-900 dark:text-amber-100 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
          Additional Instructions (Optional)
        </label>
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="like: Provide examples, Focus on implications, Explain simply, Include case law"
          className="w-full px-4 py-2 bg-white dark:bg-amber-900 border-2 border-amber-800 dark:border-amber-700 text-amber-900 dark:text-amber-100 placeholder-amber-600 dark:placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none font-semibold"
          style={{ fontFamily: 'Georgia, serif' }}
          rows={2}
          disabled={loading}
        />
      </div>

      {/* Query Input Box */}
      <div className="mb-4">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about your legal document... (Ctrl+Enter to send)"
          className="w-full px-4 py-3 bg-white dark:bg-amber-900 border-2 border-amber-800 dark:border-amber-700 text-amber-900 dark:text-amber-100 placeholder-amber-600 dark:placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none font-semibold"
          style={{ fontFamily: 'Georgia, serif' }}
          rows={3}
          disabled={loading}
        />
      </div>

      {/* Send and Clear Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSend}
          disabled={loading || !query.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-800 dark:bg-amber-700 text-amber-50 font-bold text-lg hover:bg-amber-700 dark:hover:bg-amber-600 transition border-4 border-amber-900 dark:border-amber-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: 'Georgia, serif', boxShadow: '6px 6px 0px rgba(0,0,0,0.3)' }}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send
            </>
          )}
        </button>

        <button
          onClick={handleClear}
          disabled={loading || messages.length === 0}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 dark:bg-red-700 text-red-50 font-bold text-lg hover:bg-red-700 dark:hover:bg-red-800 transition border-4 border-red-800 dark:border-red-900 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: 'Georgia, serif', boxShadow: '6px 6px 0px rgba(0,0,0,0.3)' }}
        >
          <Trash2 className="w-5 h-5" />
          Clear
        </button>
      </div>
    </div>
  )
}
