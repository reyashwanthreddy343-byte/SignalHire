import axios from 'axios'
import type { HealthResponse, HiddenGemsResponse, RankRequest, RankResponse } from '@/types'

export const api = axios.create({
  baseURL: '/api/v1',
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
})

export const rankCandidates = async (req: RankRequest): Promise<RankResponse> => {
  const { data } = await api.post<RankResponse>('/rank', req)
  return data
}

export const rankWithFile = async (file: File, params: Omit<RankRequest, 'jd_text'>): Promise<RankResponse> => {
  const form = new FormData()
  form.append('jd_file', file)
  form.append('top_n', String(params.top_n))
  form.append('weight_semantic', String(params.weight_semantic))
  form.append('weight_career', String(params.weight_career))
  form.append('weight_skill', String(params.weight_skill))
  form.append('weight_activity', String(params.weight_activity))
  form.append('weight_intent', String(params.weight_intent))
  form.append('weight_education', String(params.weight_education))
  form.append('role_filters', params.role_filters.join(','))
  form.append('min_experience_years', String(params.min_experience_years))
  const { data } = await api.post<RankResponse>('/rank/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const ingestFiles = async (files: File[]): Promise<{ job_id: string; status: string }> => {
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  const { data } = await api.post('/ingest', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 0,
  })
  return data
}

export const pollIngestionStatus = async (jobId: string) => {
  const { data } = await api.get(`/ingest/${jobId}/status`)
  return data
}

export const getHealth = async (): Promise<HealthResponse> => {
  const { data } = await api.get<HealthResponse>('/health')
  return data
}

export async function getGalaxyPoints() {
  const r = await api.get('/candidates/galaxy')
  return r.data.points
}

export const getHiddenGems = async (minExperience = 0, limit = 20): Promise<HiddenGemsResponse> => {
  const { data } = await api.get<HiddenGemsResponse>('/hidden-gems', {
    params: { min_experience: minExperience, limit },
  })
  return data
}

export const autocompleteRoles = async (q: string): Promise<string[]> => {
  if (!q.trim()) return []
  const { data } = await api.get('/autocomplete/roles', { params: { q, limit: 8 } })
  return data.suggestions
}

export const autocompleteSkills = async (q: string): Promise<string[]> => {
  if (!q.trim()) return []
  const { data } = await api.get('/autocomplete/skills', { params: { q, limit: 8 } })
  return data.suggestions
}

export const exportResults = async (req: RankRequest, format: string): Promise<Blob> => {
  const { data } = await api.post(
    `/export/direct?format=${format}`,
    req,
    { responseType: 'blob' },
  )
  return data
}

export const getOpenPool = async (role?: string) => {
  const { data } = await api.get('/candidates/pool', { params: { role, top_n: 50 } })
  return data
}

export const createCandidate = async (profile: Record<string, unknown>) => {
  const { data } = await api.post('/candidates/submit', profile)
  return data
}
