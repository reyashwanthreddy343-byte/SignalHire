export interface Education {
  degree?: string
  field_of_study?: string
  institution?: string
  start_year?: number
  end_year?: number
  cgpa?: number
}

export interface WorkExperience {
  company?: string
  title?: string
  start_date?: string
  end_date?: string
  description?: string
  duration_months?: number
  is_current: boolean
}

export interface PlatformActivity {
  profile_views: number
  applications_sent: number
  response_rate: number
  last_active_days_ago: number
  login_frequency_per_week: number
  messages_sent: number
  job_saves: number
  skill_assessments_taken: number
  skill_assessment_avg_score: number
  profile_completeness: number
}

export interface Candidate {
  candidate_id: string
  name?: string
  email?: string
  headline?: string
  current_title?: string
  current_company?: string
  years_of_experience: number
  skills: string[]
  implied_skills: string[]
  career_level?: string
  ai_role_label?: string
  linkedin_url?: string
  github_url?: string
  location?: string
  education?: Education[]
  work_experience?: WorkExperience[]
  platform_activity?: PlatformActivity
}

export interface RankedCandidate {
  rank: number
  candidate_id: string
  name?: string
  current_title?: string
  current_company?: string
  final_score: number
  semantic_score: number
  career_score: number
  skill_score: number
  activity_score: number
  intent_score: number
  education_score: number
  intent_label: string
  top_matching_skills: string[]
  missing_skills: string[]
  career_trajectory?: string
  experience_match: string
  activity_percentile: number
  explanation: string
  ai_role_label?: string
}

export interface RankResponse {
  jd_id: string
  total_candidates: number
  returned: number
  processing_time_ms: number
  ranked_candidates: RankedCandidate[]
}

export interface ScoreWeights {
  semantic: number
  career: number
  skill: number
  activity: number
  intent: number
  education: number
}

export interface RankRequest {
  jd_text: string
  top_n: number
  weight_semantic: number
  weight_career: number
  weight_skill: number
  weight_activity: number
  weight_intent: number
  weight_education: number
  role_filters: string[]
  min_experience_years: number
  max_experience_years?: number
  required_skills: string[]
}

export interface HealthResponse {
  status: string
  app: string
  env: string
  models_loaded: boolean
  faiss_index_size: number
  candidates_indexed: number
}

export interface HiddenGemCandidate {
  candidate_id: string
  name: string
  current_title: string
  years_of_experience: number
  gem_score: number
  reason: string
  suggested_roles: string[]
}

export interface HiddenGemsResponse {
  total_scanned: number
  gems_found: number
  candidates: HiddenGemCandidate[]
}

export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'pdf'
