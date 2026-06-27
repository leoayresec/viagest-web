import { create } from 'zustand'
import { api } from '../../../core/api/client'

export interface ApiRecord {
  id: string
  date: string
  serviceType: string
  data: Record<string, any>
  createdAt: string
  roadId: string | null
  supervisorId: string | null
  recorderId: string | null
  userId?: string | null
  road?: {
    id: string; name: string
    neighborhood?: { id: string; name: string; city?: { id: string; name: string; state?: { id: string; name: string; code: string } } }
  } | null
  supervisor?: { id: string; name: string; role: string } | null
  recorder?: { id: string; name: string; role: string } | null
  user?: { id: string; name: string } | null
}

export type NewRecord = {
  date: string
  roadId: string
  serviceType: string
  supervisorId?: string
  recorderId?: string
  recorderName?: string
  data: Record<string, any>
}

interface RecordsState {
  records: ApiRecord[]
  loading: boolean
  error: string | null
  fetchRecords: (params?: { date?: string; start?: string; end?: string; roadId?: string; recorderId?: string }) => Promise<void>
  addBatch: (records: NewRecord[]) => Promise<boolean>
  remove: (id: string) => Promise<void>
}

export const useRecordsStore = create<RecordsState>((set, get) => ({
  records: [],
  loading: false,
  error: null,

  fetchRecords: async (params) => {
    set({ loading: true, error: null })
    try {
      const query = new URLSearchParams()
      if (params?.date) query.set('date', params.date)
      if (params?.start) query.set('start', params.start)
      if (params?.end) query.set('end', params.end)
      if (params?.roadId) query.set('roadId', params.roadId)
      if (params?.recorderId) query.set('recorderId', params.recorderId)

      const qs = query.toString()
      const data = await api.get<ApiRecord[]>(`/records${qs ? `?${qs}` : ''}`)
      set({ records: data, loading: false })
    } catch (err: any) {
      set({ error: err.message || 'Erro ao carregar registros.', loading: false })
    }
  },

  addBatch: async (records) => {
    set({ error: null })
    try {
      await api.post('/records/batch', { records })
      return true
    } catch (err: any) {
      set({ error: err.message || 'Erro ao salvar registros.' })
      return false
    }
  },

  remove: async (id) => {
    try {
      await api.delete(`/records/${id}`)
      set({ records: get().records.filter((r) => r.id !== id) })
    } catch (err: any) {
      set({ error: err.message || 'Erro ao excluir registro.' })
    }
  },
}))
