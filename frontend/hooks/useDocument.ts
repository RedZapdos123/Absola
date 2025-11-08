import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentApi, DocumentRecord } from '@/lib/api'
import { useDocumentStore } from '@/lib/store'

export function useDocuments() {
  const setDocuments = useDocumentStore((state) => state.setDocuments)

  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await documentApi.getAll()
      if (response.ok && response.data) {
        setDocuments(response.data.documents)
        return response.data.documents
      }
      throw new Error(response.error?.message || 'Failed to fetch documents')
    },
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const response = await documentApi.getById(id)
      if (response.ok && response.data) {
        return response.data.document
      }
      throw new Error(response.error?.message || 'Failed to fetch document')
    },
    enabled: !!id,
  })
}

export function useUpload() {
  const queryClient = useQueryClient()
  const addDocument = useDocumentStore((state) => state.addDocument)

  return useMutation({
    mutationFn: async (file: File) => {
      const response = await documentApi.upload(file)
      if (response.ok && response.data) {
        return response.data.documentId
      }
      throw new Error(response.error?.message || 'Upload failed')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  const removeDocument = useDocumentStore((state) => state.removeDocument)

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await documentApi.delete(id)
      if (!response.ok) {
        throw new Error(response.error?.message || 'Delete failed')
      }
    },
    onSuccess: (_, id) => {
      removeDocument(id)
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useSummary(documentId: string) {
  return useQuery({
    queryKey: ['summary', documentId],
    queryFn: async () => {
      const response = await documentApi.getSummary(documentId)
      if (response.ok && response.data) {
        return response.data.summary
      }
      throw new Error(response.error?.message || 'Failed to fetch summary')
    },
    enabled: !!documentId,
  })
}

export function useDocumentQuery(documentId: string) {
  return useMutation({
    mutationFn: async (query: string) => {
      const response = await documentApi.query(documentId, query)
      if (response.ok && response.data) {
        return response.data
      }
      throw new Error(response.error?.message || 'Query failed')
    },
  })
}

export function useContext(documentId: string) {
  return useMutation({
    mutationFn: async (term: string) => {
      const response = await documentApi.getContext(documentId, term)
      if (response.ok && response.data) {
        return response.data
      }
      throw new Error(response.error?.message || 'Failed to fetch context')
    },
  })
}
