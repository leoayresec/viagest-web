import { create } from 'zustand'
import type { Via, TeamMember } from '../../../core/types/records'

const VIAS_KEY = 'viagest_vias'
const TEAM_KEY = 'viagest_team'

interface SettingsState {
  vias: Via[]
  team: TeamMember[]
  load: () => void
  salvarVia: (bairro: string, nome: string, extensaoM?: number, larguraM?: number) => void
  atualizarDimensoes: (bairro: string, nome: string, extensaoM: number, larguraM: number) => void
  atualizarStatus: (bairro: string, nome: string, status: Via['status']) => void
  excluirVia: (bairro: string, nome: string) => void
  excluirBairro: (bairro: string) => void
  salvarMembro: (nome: string, funcao: TeamMember['funcao']) => void
  excluirMembro: (nome: string, funcao: TeamMember['funcao']) => void
  listarBairros: () => string[]
  listarVias: (bairro?: string) => string[]
  listarViasAtivas: (bairro?: string) => string[]
  listarEquipe: (funcao?: TeamMember['funcao']) => string[]
}

function loadVias(): Via[] {
  try { return JSON.parse(localStorage.getItem(VIAS_KEY) || '[]') } catch { return [] }
}
function saveVias(v: Via[]) { localStorage.setItem(VIAS_KEY, JSON.stringify(v)) }
function loadTeam(): TeamMember[] {
  try { return JSON.parse(localStorage.getItem(TEAM_KEY) || '[]') } catch { return [] }
}
function saveTeam(t: TeamMember[]) { localStorage.setItem(TEAM_KEY, JSON.stringify(t)) }

export const useSettingsStore = create<SettingsState>((set, get) => ({
  vias: loadVias(),
  team: loadTeam(),

  load: () => set({ vias: loadVias(), team: loadTeam() }),

  salvarVia: (bairro, nome, extensaoM, larguraM) => {
    const vias = get().vias
    const exists = vias.find((v) => v.bairro === bairro && v.nome === nome)
    if (!exists) {
      vias.push({ bairro, nome, extensaoM, larguraM, status: 'ativa' })
      saveVias(vias)
      set({ vias: [...vias] })
    }
  },

  atualizarDimensoes: (bairro, nome, extensaoM, larguraM) => {
    const vias = get().vias.map((v) =>
      v.bairro === bairro && v.nome === nome ? { ...v, extensaoM, larguraM } : v
    )
    saveVias(vias)
    set({ vias })
  },

  atualizarStatus: (bairro, nome, status) => {
    const vias = get().vias.map((v) =>
      v.bairro === bairro && v.nome === nome ? { ...v, status } : v
    )
    saveVias(vias)
    set({ vias })
  },

  excluirVia: (bairro, nome) => {
    const vias = get().vias.filter((v) => !(v.bairro === bairro && v.nome === nome))
    saveVias(vias)
    set({ vias })
  },

  excluirBairro: (bairro) => {
    const vias = get().vias.filter((v) => v.bairro !== bairro)
    saveVias(vias)
    set({ vias })
  },

  salvarMembro: (nome, funcao) => {
    const team = get().team
    const exists = team.find((m) => m.nome === nome && m.funcao === funcao)
    if (!exists) {
      team.push({ nome, funcao })
      saveTeam(team)
      set({ team: [...team] })
    }
  },

  excluirMembro: (nome, funcao) => {
    const team = get().team.filter((m) => !(m.nome === nome && m.funcao === funcao))
    saveTeam(team)
    set({ team })
  },

  listarBairros: () => {
    return [...new Set(get().vias.map((v) => v.bairro))].sort()
  },

  listarVias: (bairro) => {
    let lista = get().vias
    if (bairro) lista = lista.filter((v) => v.bairro === bairro)
    return [...new Set(lista.map((v) => v.nome))].sort()
  },

  listarViasAtivas: (bairro) => {
    let lista = get().vias.filter((v) => v.status === 'ativa')
    if (bairro) lista = lista.filter((v) => v.bairro === bairro)
    return [...new Set(lista.map((v) => v.nome))].sort()
  },

  listarEquipe: (funcao) => {
    let lista = get().team
    if (funcao) lista = lista.filter((m) => m.funcao === funcao)
    return lista.map((m) => m.nome).sort()
  },
}))
