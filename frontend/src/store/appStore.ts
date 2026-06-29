import { create } from 'zustand'
import type { RankedCandidate, RankRequest, RankResponse, ScoreWeights } from '@/types'

export const DEFAULT_WEIGHTS: ScoreWeights = {
  semantic: 0.40,
  career: 0.20,
  skill: 0.20,
  activity: 0.10,
  intent: 0.05,
  education: 0.05,
}

function normalizeWeights(weights: ScoreWeights): ScoreWeights {
  const total =
    weights.semantic + weights.career + weights.skill +
    weights.activity + weights.intent + weights.education
  if (total <= 0) return DEFAULT_WEIGHTS
  if (Math.abs(total - 1) < 0.001) return weights
  return {
    semantic: +(weights.semantic / total).toFixed(4),
    career: +(weights.career / total).toFixed(4),
    skill: +(weights.skill / total).toFixed(4),
    activity: +(weights.activity / total).toFixed(4),
    intent: +(weights.intent / total).toFixed(4),
    education: +(weights.education / total).toFixed(4),
  }
}

interface AppState {
  jdText: string
  setJdText: (text: string) => void
  jdLocked: boolean
  setJdLocked: (v: boolean) => void
  roleLocked: boolean
  setRoleLocked: (v: boolean) => void

  roleFilters: string[]
  addRoleFilter: () => void
  updateRoleFilter: (idx: number, val: string) => void
  removeRoleFilter: (idx: number) => void

  weights: ScoreWeights
  setWeights: (w: Partial<ScoreWeights>) => void
  showWeights: boolean
  setShowWeights: (v: boolean) => void

  topN: number
  setTopN: (n: number) => void
  minExp: number
  setMinExp: (n: number) => void

  candidatesIndexed: number
  setCandidatesIndexed: (n: number) => void
  ingestMessage: string
  setIngestMessage: (m: string) => void
  isIngesting: boolean
  setIsIngesting: (v: boolean) => void
  ingestStream: string[]
  addIngestStreamLog: (log: string) => void
  clearIngestStream: () => void

  rankResponse: RankResponse | null
  setRankResponse: (r: RankResponse | null) => void
  selectedCandidate: RankedCandidate | null
  setSelectedCandidate: (c: RankedCandidate | null) => void
  isRanking: boolean
  setIsRanking: (v: boolean) => void

  activeTab: 'recruiter' | 'candidate'
  setActiveTab: (t: 'recruiter' | 'candidate') => void
  theme: 'light' | 'dark'
  toggleTheme: () => void

  blindMode: boolean
  toggleBlindMode: () => void

  buildRankRequest: () => RankRequest
  unlockJdAndRole: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  jdText: '',
  setJdText: (text) => set({ jdText: text }),
  jdLocked: false,
  setJdLocked: (v) => set({ jdLocked: v }),
  roleLocked: false,
  setRoleLocked: (v) => set({ roleLocked: v }),

  roleFilters: [''],
  addRoleFilter: () => set((s) => ({ roleFilters: [...s.roleFilters, ''] })),
  updateRoleFilter: (idx, val) =>
    set((s) => { const f = [...s.roleFilters]; f[idx] = val; return { roleFilters: f } }),
  removeRoleFilter: (idx) =>
    set((s) => ({ roleFilters: s.roleFilters.filter((_, i) => i !== idx) })),

  weights: DEFAULT_WEIGHTS,
  setWeights: (w) => set((s) => ({ weights: normalizeWeights({ ...s.weights, ...w }) })),
  showWeights: false,
  setShowWeights: (v) => set({ showWeights: v }),

  topN: 20,
  setTopN: (n) => set({ topN: n }),
  minExp: 0,
  setMinExp: (n) => set({ minExp: n }),

  candidatesIndexed: 0,
  setCandidatesIndexed: (n) => set({ candidatesIndexed: n }),
  ingestMessage: '',
  setIngestMessage: (m) => set({ ingestMessage: m }),
  isIngesting: false,
  setIsIngesting: (v) => set({ isIngesting: v }),
  ingestStream: [],
  addIngestStreamLog: (log) => set((s) => ({ ingestStream: [...s.ingestStream, log].slice(-50) })),
  clearIngestStream: () => set({ ingestStream: [] }),

  rankResponse: null,
  setRankResponse: (r) => set({ rankResponse: r }),
  selectedCandidate: null,
  setSelectedCandidate: (c) => set({ selectedCandidate: c }),
  isRanking: false,
  setIsRanking: (v) => set({ isRanking: v }),

  activeTab: 'recruiter',
  setActiveTab: (t) => set({ activeTab: t }),
  theme: 'light',
  toggleTheme: () =>
    set((s) => {
      const nextTheme = s.theme === 'light' ? 'dark' : 'light'
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.setAttribute('data-theme', 'light')
      }
      return { theme: nextTheme }
    }),

  blindMode: false,
  toggleBlindMode: () => set((s) => ({ blindMode: !s.blindMode })),

  unlockJdAndRole: () => set({ jdLocked: false, roleLocked: false }),

  buildRankRequest: () => {
    const s = get()
    const w = s.weights
    return {
      jd_text: s.jdText,
      top_n: s.topN,
      weight_semantic: w.semantic,
      weight_career: w.career,
      weight_skill: w.skill,
      weight_activity: w.activity,
      weight_intent: w.intent,
      weight_education: w.education,
      role_filters: s.roleFilters.filter(Boolean),
      min_experience_years: s.minExp,
      required_skills: [],
    }
  },
}))
