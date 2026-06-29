import { Routes, Route, Navigate } from 'react-router-dom'
import RecruiterDashboard from '@/pages/RecruiterDashboard'
import CandidatePortal from '@/pages/CandidatePortal'
import LandingPage from '@/pages/LandingPage'
import RankingsPage from '@/pages/RankingsPage'
import ComparePage from '@/pages/ComparePage'
import EvaluatePage from '@/pages/EvaluatePage'
import ConfigPage from '@/pages/ConfigPage'
import HoneypotsPage from '@/pages/HoneypotsPage'
import HiddenGemsPage from '@/pages/HiddenGemsPage'
import ProfilePage from '@/pages/ProfilePage'
import MarketAnalytics from '@/pages/MarketAnalytics'
import TalentGlobe from '@/pages/TalentGlobe'
import Layout from '@/components/shared/Layout'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<Layout />}>
        <Route path="/recruiter" element={<RecruiterDashboard />} />
        <Route path="/candidate" element={<CandidatePortal />} />
        <Route path="/rank" element={<RankingsPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/evaluate" element={<EvaluatePage />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/honeypots" element={<HoneypotsPage />} />
        <Route path="/hidden-gems" element={<HiddenGemsPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/analytics" element={<MarketAnalytics />} />
        <Route path="/globe" element={<TalentGlobe />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
