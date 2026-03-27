import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/BottomNav'
import InstallBanner from './components/InstallBanner'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProviderDetailPage from './pages/ProviderDetailPage'
import ProviderDashboard from './pages/ProviderDashboard'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/"             element={<HomePage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/provider/:id" element={<ProviderDetailPage />} />

          {/* Customer-only */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute role="customer">
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          {/* Profile — public route, shows login prompt if not signed in */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Provider-only */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="provider">
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>

        {/* Global mobile UI */}
        <BottomNav />
        <InstallBanner />
      </Router>
    </AuthProvider>
  )
}

export default App
