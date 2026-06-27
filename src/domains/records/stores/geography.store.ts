import { create } from 'zustand'
import { api } from '../../../core/api/client'

export interface ApiState {
  id: string
  code: string
  name: string
}

export interface ApiCity {
  id: string
  stateId: string
  name: string
  ibgeCode: string
}

export interface ApiNeighborhood {
  id: string
  cityId: string
  name: string
}

export interface ApiRoad {
  id: string
  neighborhoodId: string
  name: string
  lengthM: number
  widthM: number
  status: string
}

export interface ApiTeamMember {
  id: string
  name: string
  role: { name: string }
}

interface GeographyState {
  states: ApiState[]
  cities: ApiCity[]
  neighborhoods: ApiNeighborhood[]
  roads: ApiRoad[]
  teamMembers: ApiTeamMember[]

  loading: boolean
  error: string | null

  fetchStates: () => Promise<void>
  fetchCities: (stateId: string) => Promise<void>
  fetchNeighborhoods: (cityId: string) => Promise<void>
  createNeighborhood: (cityId: string, name: string) => Promise<ApiNeighborhood | null>
  deleteNeighborhood: (id: string) => Promise<void>

  fetchRoads: (neighborhoodId: string) => Promise<void>
  createRoad: (neighborhoodId: string, name: string) => Promise<ApiRoad | null>
  deleteRoad: (id: string) => Promise<void>

  fetchTeamMembers: (role?: string) => Promise<void>

  reset: () => void
}

export const useGeographyStore = create<GeographyState>((set, get) => ({
  states: [],
  cities: [],
  neighborhoods: [],
  roads: [],
  teamMembers: [],
  loading: false,
  error: null,

  fetchStates: async () => {
    set({ loading: true, error: null })
    try {
      const data = await api.get<ApiState[]>('/geography/states')
      set({ states: data, loading: false })
    } catch (err: any) {
      set({ error: err.message || 'Erro ao carregar estados.', loading: false })
    }
  },

  fetchCities: async (stateId) => {
    set({ loading: true, error: null })
    try {
      const data = await api.get<ApiCity[]>(`/geography/cities?stateId=${stateId}`)
      set({ cities: data, loading: false })
    } catch (err: any) {
      set({ error: err.message || 'Erro ao carregar cidades.', loading: false })
    }
  },

  fetchNeighborhoods: async (cityId) => {
    set({ loading: true, error: null })
    try {
      const data = await api.get<ApiNeighborhood[]>(`/geography/neighborhoods?cityId=${cityId}`)
      set({ neighborhoods: data, loading: false })
    } catch (err: any) {
      set({ error: err.message || 'Erro ao carregar bairros.', loading: false })
    }
  },

  createNeighborhood: async (cityId, name) => {
    set({ error: null })
    try {
      const result = await api.post<ApiNeighborhood>('/geography/neighborhoods', { cityId, name })
      set({ neighborhoods: [...get().neighborhoods, result] })
      return result
    } catch (err: any) {
      set({ error: err.message || 'Erro ao criar bairro.' })
      return null
    }
  },

  deleteNeighborhood: async (id) => {
    try {
      await api.delete(`/geography/neighborhoods/${id}`)
      set({ neighborhoods: get().neighborhoods.filter((n) => n.id !== id) })
    } catch (err: any) {
      set({ error: err.message || 'Erro ao excluir bairro.' })
    }
  },

  fetchRoads: async (neighborhoodId) => {
    set({ loading: true, error: null })
    try {
      const data = await api.get<ApiRoad[]>(`/geography/roads?neighborhoodId=${neighborhoodId}`)
      set({ roads: data, loading: false })
    } catch (err: any) {
      set({ error: err.message || 'Erro ao carregar vias.', loading: false })
    }
  },

  createRoad: async (neighborhoodId, name) => {
    set({ error: null })
    try {
      const result = await api.post<ApiRoad>('/geography/roads', { neighborhoodId, name })
      set({ roads: [...get().roads, result] })
      return result
    } catch (err: any) {
      set({ error: err.message || 'Erro ao criar via.' })
      return null
    }
  },

  deleteRoad: async (id) => {
    try {
      await api.delete(`/geography/roads/${id}`)
      set({ roads: get().roads.filter((r) => r.id !== id) })
    } catch (err: any) {
      set({ error: err.message || 'Erro ao excluir via.' })
    }
  },

  fetchTeamMembers: async (role) => {
    set({ loading: true, error: null })
    try {
      const qs = role ? `?role=${role}` : ''
      const data = await api.get<ApiTeamMember[]>(`/geography/team${qs}`)
      set({ teamMembers: data, loading: false })
    } catch (err: any) {
      set({ error: err.message || 'Erro ao carregar equipe.', loading: false })
    }
  },

  reset: () => set({ states: [], cities: [], neighborhoods: [], roads: [], teamMembers: [] }),
}))
