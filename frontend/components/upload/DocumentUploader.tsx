'use client'

import { useUpload } from '@/hooks/useDocument'
import { useState, useCallback } from 'react'
import { Upload, FileText, AlertCircle } from 'lucide-react'

export function DocumentUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const uploadMutation = useUpload()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (validateFile(droppedFile)) {
        setFile(droppedFile)
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (validateFile(selectedFile)) {
        setFile(selectedFile)
      }
    }
  }

  const validateFile = (file: File): boolean => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF, DOCX, or TXT file')
      return false
    }

    if (file.size > maxSize) {
      alert('File size must be less than 5MB')
      return false
    }

    return true
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      await uploadMutation.mutateAsync(file)
      setFile(null)
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-wood-light">
      {/* Drag and Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragActive
            ? 'border-wood-medium bg-wood-lightest'
            : 'border-wood-light hover:border-wood-medium'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-16 h-16 mx-auto mb-6 text-wood-medium" />
        <p className="text-wood-dark text-lg mb-4">
          Drag and drop your document here, or
        </p>
        <label className="inline-block px-6 py-3 bg-wood-medium text-cream rounded-lg hover:bg-wood-dark cursor-pointer transition-all shadow-md hover:shadow-lg font-semibold">
          Browse Files
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt"
            onChange={handleChange}
          />
        </label>
        <p className="text-sm text-wood-light mt-6">
          Supported formats: PDF, DOCX, TXT (Max 5MB)
        </p>
      </div>

      {/* Selected File */}
      {file && (
        <div className="mt-6 p-6 bg-wood-lightest rounded-lg border border-wood-light">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-wood-medium p-3 rounded-lg">
                <FileText className="w-6 h-6 text-cream" />
              </div>
              <div>
                <p className="font-semibold text-wood-darkest text-lg">{file.name}</p>
                <p className="text-sm text-wood-medium">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-red-700 hover:text-red-800 text-sm font-semibold px-4 py-2 rounded hover:bg-red-50 transition-colors"
            >
              Remove
            </button>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="w-full px-6 py-3 bg-wood-medium text-cream rounded-lg hover:bg-wood-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-semibold text-lg"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload & Analyze'}
          </button>
        </div>
      )}

      {/* Error Display */}
      {uploadMutation.isError && (
        <div className="mt-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 text-lg">Upload Failed</p>
            <p className="text-red-700">
              {uploadMutation.error?.message || 'An error occurred'}
            </p>
          </div>
        </div>
      )}

      {/* Success Display */}
      {uploadMutation.isSuccess && (
        <div className="mt-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
          <p className="text-green-900 font-semibold text-lg">
            ✓ Document uploaded successfully! Processing...
          </p>
        </div>
      )}
    </div>
  )
}
