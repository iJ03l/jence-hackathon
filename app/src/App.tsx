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
import SettingsPage from './pages/SettingsPage'
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
          <Route path="/creator/:id" element={<CreatorProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/creator-onboarding" element={<CreatorOnboardingPage />} />
        </Route>

        {/* Auth pages — no layout (clean, focused) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
