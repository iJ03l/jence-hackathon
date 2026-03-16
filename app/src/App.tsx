import { Routes, Route, Navigate } from 'react-router-dom'
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
import LaunchNotesPage from './pages/LaunchNotesPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import SettingsPage from './pages/SettingsPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import AboutPage from './pages/AboutPage'
import OnboardingPage from './pages/OnboardingPage'
import './App.css'

/** Redirect first-time visitors to /welcome */
function HomeRedirect() {
  const isOnboarded = localStorage.getItem('jence_onboarded')
  if (!isOnboarded) return <Navigate to="/welcome" replace />
  return <LandingPage />
}

function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* Public pages with Layout (Nav + Footer) */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/verticals/:slug" element={<VerticalPage />} />
          <Route path="/verticals/:slug" element={<VerticalPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/post/:id" element={<CreatorPostDetail />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/post/:id" element={<PostDetail />} />
          <Route path="/guidelines" element={<CommunityGuidelinesPage />} />
          <Route path="/launches" element={<LaunchNotesPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/about" element={<AboutPage />} />
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
        <Route path="/welcome" element={<OnboardingPage />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
