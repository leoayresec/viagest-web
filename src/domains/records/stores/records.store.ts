import { create } from 'zustand'
import type { Record } from '../../../core/types/records'

const STORAGE_KEY = 'viagest_records'
const SEQ_KEY = 'viagest_record_seq'

interface RecordsState {
  records: Record[]
  add: (r: Omit<Record, 'id' | 'createdAt'>) => void
  update: (id: string, data: Partial<Record>) => void
  remove: (id: string) => void
  listByDate: (date: string) => Record[]
  listByDateRange: (start: string, end: string) => Record[]
  listByApontador: (apontador: string, date: string) => Record[]
}

function loadRecords(): Record[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveRecords(r: Record[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(r)) }

function nextId(): number {
  const seq = parseInt(localStorage.getItem(SEQ_KEY) || '0', 10) + 1
  localStorage.setItem(SEQ_KEY, String(seq))
  return seq
}

export const useRecordsStore = create<RecordsState>((set, get) => ({
  records: loadRecords(),

  add: (r) => {
    const record: Record = { ...r, id: String(nextId()), createdAt: new Date().toISOString() }
    const records = [...get().records, record]
    saveRecords(records)
    set({ records })
  },

  update: (id, data) => {
    const records = get().records.map((r) => (r.id === id ? { ...r, ...data } : r))
    saveRecords(records)
    set({ records })
  },

  remove: (id) => {
    const records = get().records.filter((r) => r.id !== id)
    saveRecords(records)
    set({ records })
  },

  listByDate: (date) => get().records.filter((r) => r.date === date),
  listByDateRange: (start, end) => get().records.filter((r) => r.date >= start && r.date <= end),
  listByApontador: (apontador, date) => get().records.filter((r) => r.apontador === apontador && r.date === date),
}))
