'use client'

import { useState } from 'react'
import { Send, FileText, Sparkles, Loader2, Download } from 'lucide-react'
import { documentApi } from '@/lib/api'
import jsPDF from 'jspdf'

interface RAGQueryBoxProps {
  documentId: string
  onResponse?: (answer: string, sources: string[]) => void
}

export function RAGQueryBox({ documentId, onResponse }: RAGQueryBoxProps) {
  const [query, setQuery] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!query.trim()) {
      setError('Please enter a question')
      return
    }

    setLoading(true)
    setError('')
    setAnswer('')
    setSources([])

    try {
      const response = await documentApi.query(documentId, query, userPrompt || undefined)
      
      if (response.ok && response.data) {
        setAnswer(response.data.answer)
        setSources(response.data.sources)
        if (onResponse) {
          onResponse(response.data.answer, response.data.sources)
        }
      } else {
        setError(response.error?.message || 'Failed to get answer')
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit()
    }
  }

  const exportToPDF = () => {
    if (!answer) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - 2 * margin
    let y = 20

    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('ABSOLA - Legal Document Analysis', margin, y)
    y += 15

    // Separator line
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
    y += 10

    // Question
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Question:', margin, y)
    y += 7
    doc.setFont('helvetica', 'normal')
    const questionLines = doc.splitTextToSize(query, maxWidth)
    doc.text(questionLines, margin, y)
    y += questionLines.length * 7 + 5

    // User Prompt if exists
    if (userPrompt) {
      doc.setFont('helvetica', 'bold')
      doc.text('Additional Instructions:', margin, y)
      y += 7
      doc.setFont('helvetica', 'normal')
      const promptLines = doc.splitTextToSize(userPrompt, maxWidth)
      doc.text(promptLines, margin, y)
      y += promptLines.length * 7 + 5
    }

    // Answer
    doc.setFont('helvetica', 'bold')
    doc.text('Answer:', margin, y)
    y += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    
    const answerLines = doc.splitTextToSize(answer, maxWidth)
    for (let i = 0; i < answerLines.length; i++) {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(answerLines[i], margin, y)
      y += 6
    }

    // Sources
    if (sources.length > 0) {
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
      
      sources.forEach((source, idx) => {
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

    // Save PDF
    doc.save(`absola-analysis-${Date.now()}.pdf`)
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950 rounded-none border-4 border-amber-800 dark:border-amber-700 shadow-lg p-6" style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.2)' }}>
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-6 h-6 text-amber-900 dark:text-amber-100" />
        <h3 className="text-2xl font-black text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif' }}>
          Ask a Question
        </h3>
      </div>

      <div className="space-y-4">
        {/* Question Input */}
        <div>
          <label className="block text-sm font-bold text-amber-900 dark:text-amber-100 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Your Question
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What would you like to know about this document? (e.g., 'Explain Section 498A IPC in detail')"
            className="w-full px-4 py-3 bg-white dark:bg-amber-900 border-2 border-amber-800 dark:border-amber-700 text-amber-900 dark:text-amber-100 placeholder-amber-600 dark:placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none font-semibold"
            style={{ fontFamily: 'Georgia, serif' }}
            rows={3}
            disabled={loading}
          />
        </div>

        {/* User Prompt Input */}
        <div>
          <label className="block text-sm font-bold text-amber-900 dark:text-amber-100 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Additional Instructions (Optional)
          </label>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Any specific instructions? (e.g., 'Provide examples', 'Focus on implications', 'Explain in simple terms', 'Include case law')"
            className="w-full px-4 py-3 bg-white dark:bg-amber-900 border-2 border-amber-800 dark:border-amber-700 text-amber-900 dark:text-amber-100 placeholder-amber-600 dark:placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none font-semibold"
            style={{ fontFamily: 'Georgia, serif' }}
            rows={2}
            disabled={loading}
          />
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1" style={{ fontFamily: 'Georgia, serif' }}>
            Tip: Use this to get more detailed, customized responses tailored to your needs
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !query.trim()}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-amber-800 dark:bg-amber-700 text-amber-50 font-bold text-lg hover:bg-amber-700 dark:hover:bg-amber-600 transition border-4 border-amber-900 dark:border-amber-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
              Get Answer (Ctrl+Enter)
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900 border-2 border-red-600 text-red-900 dark:text-red-100 font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
            {error}
          </div>
        )}

        {/* Answer Display */}
        {answer && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b-4 border-amber-800 dark:border-amber-700">
              <FileText className="w-5 h-5 text-amber-900 dark:text-amber-100" />
              <h4 className="text-xl font-black text-amber-900 dark:text-amber-100" style={{ fontFamily: 'Georgia, serif' }}>
                Answer
              </h4>
            </div>
            
            <div className="p-6 bg-white dark:bg-amber-900 border-2 border-amber-800 dark:border-amber-700">
              <p className="text-amber-900 dark:text-amber-100 whitespace-pre-wrap leading-relaxed font-semibold" style={{ fontFamily: 'Georgia, serif' }}>
                {answer}
              </p>
            </div>

            {sources.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-black text-amber-900 dark:text-amber-100 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                  Sources Referenced
                </h5>
                <div className="space-y-2">
                  {sources.map((source, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-amber-100 dark:bg-amber-800 border-l-4 border-amber-800 dark:border-amber-600 text-sm text-amber-900 dark:text-amber-100 font-semibold"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {source}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-bold transition border-4 border-green-900 shadow-lg"
                style={{ fontFamily: 'Georgia, serif', boxShadow: '6px 6px 0px rgba(0,0,0,0.3)' }}
              >
                <Download className="w-5 h-5" />
                Export to PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
