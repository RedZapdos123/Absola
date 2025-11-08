'use client'

import { useState } from 'react'
import { useDocumentQuery as useQueryHook, useContext } from '@/hooks/useDocument'
import { Message } from './Message'
import { ChatMessage } from '@/lib/api'
import { Send, Loader2, Sparkles } from 'lucide-react'

interface ChatInterfaceProps {
  documentId: string
}

export function ChatInterface({ documentId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [showContextLookup, setShowContextLookup] = useState(false)
  const [contextTerm, setContextTerm] = useState('')
  
  const queryMutation = useQueryHook(documentId)
  const contextMutation = useContext(documentId)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    try {
      const result = await queryMutation.mutateAsync(input)
      
      const aiMessage: ChatMessage = {
        role: 'ai',
        content: result.answer,
        source_chunks: result.sources,
      }
      
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'ai',
        content: 'Sorry, I encountered an error processing your question. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleContextLookup = async () => {
    if (!contextTerm.trim()) return

    try {
      const result = await contextMutation.mutateAsync(contextTerm)
      
      const contextMessage: ChatMessage = {
        role: 'ai',
        content: `**Definition of "${contextTerm}"** (via ${result.provider}):\n\n${result.explanation}`,
      }
      
      setMessages((prev) => [...prev, contextMessage])
      setContextTerm('')
      setShowContextLookup(false)
    } catch (error) {
      console.error('Context lookup error:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Ask Questions</h3>
        <p className="text-sm text-gray-600">
          Ask questions about your document using RAG-powered AI
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Start by asking a question about your document
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <Message key={idx} message={msg} />
          ))
        )}
        
        {queryMutation.isPending && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}
      </div>

      {/* Context Lookup */}
      {showContextLookup && (
        <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={contextTerm}
              onChange={(e) => setContextTerm(e.target.value)}
              placeholder="Enter legal term to look up..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleContextLookup()}
            />
            <button
              onClick={handleContextLookup}
              disabled={contextMutation.isPending}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
            >
              {contextMutation.isPending ? 'Looking up...' : 'Lookup'}
            </button>
            <button
              onClick={() => setShowContextLookup(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setShowContextLookup(!showContextLookup)}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
            title="Look up legal term definition"
          >
            📚 Context
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about this document..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={queryMutation.isPending}
          />
          <button
            onClick={handleSend}
            disabled={queryMutation.isPending || !input.trim()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send • Powered by Gemini AI with RAG
        </p>
      </div>
    </div>
  )
}
