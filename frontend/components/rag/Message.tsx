'use client'

import { ChatMessage } from '@/lib/api'
import { User, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface MessageProps {
  message: ChatMessage
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isUser
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {message.source_chunks && message.source_chunks.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-300">
            <p className="text-xs font-medium text-gray-600 mb-2">Sources:</p>
            <div className="space-y-2">
              {message.source_chunks.map((chunk, idx) => (
                <details key={idx} className="text-xs">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
                    Chunk {idx + 1}
                  </summary>
                  <p className="mt-1 pl-4 text-gray-700 italic">
                    {chunk.length > 200 ? chunk.slice(0, 200) + '...' : chunk}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-gray-600" />
        </div>
      )}
    </div>
  )
}
