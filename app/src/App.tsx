import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import PinLoginPage from './pages/PinLoginPage'
import HomePage from './pages/HomePage'
import LogEventPage from './pages/LogEventPage'
import AddPlantPage from './pages/AddPlantPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth()
  return currentUser ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PinLoginPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/log-event/:batchId"
          element={
            <ProtectedRoute>
              <LogEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-plant"
          element={
            <ProtectedRoute>
              <AddPlantPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
