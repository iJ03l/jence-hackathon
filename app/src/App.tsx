import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ExplorePage from './pages/ExplorePage'
import VerticalPage from './pages/VerticalPage'
import CreatorProfilePage from './pages/CreatorProfilePage'
import CreatorOnboardingPage from './pages/CreatorOnboardingPage'
import CommunityPage from './pages/CommunityPage'
import CommunityGuidelinesPage from './pages/CommunityGuidelinesPage'
import PostDetail from './pages/PostDetail'
import CreatorPostDetail from './pages/CreatorPostDetail'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import SettingsPage from './pages/SettingsPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* Public pages with Layout (Nav + Footer) */}
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/verticals/:slug" element={<VerticalPage />} />
          <Route path="/verticals/:slug" element={<VerticalPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/post/:id" element={<CreatorPostDetail />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/post/:id" element={<PostDetail />} />
          <Route path="/guidelines" element={<CommunityGuidelinesPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/creator-onboarding" element={<CreatorOnboardingPage />} />
          {/* Catch-all for creator profiles (e.g. jence.xyz/username) */}
          <Route path="/:username" element={<CreatorProfilePage />} />
        </Route>

        {/* Auth pages — no layout (clean, focused) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
