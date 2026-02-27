import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import PinLoginPage from './pages/PinLoginPage'
import HomePage from './pages/HomePage'
import LogEventPage from './pages/LogEventPage'
import AddPlantPage from './pages/AddPlantPage'
import { DesignSystemPage } from './pages/DesignSystemPage'
import { TodayPage } from './pages/TodayPage'
import { DiscoverPage } from './pages/DiscoverPage'
import { ProfilePage } from './pages/ProfilePage'
import { MyPlantsPage } from './pages/MyPlantsPage'
import { PlantDetailPage } from './pages/PlantDetailPage'
import { AddPlantFlow } from './pages/AddPlantFlow'
import { MyGardenPage } from './pages/MyGardenPage'
import { BatchDetailPage } from './pages/BatchDetailPage'
import { PlantInfoPage } from './pages/PlantInfoPage'
import { PlantIdentifyResultPage } from './pages/PlantIdentifyResultPage'
import { FriendsPage } from './pages/FriendsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ActivityFeedPage } from './pages/ActivityFeedPage'
import { AppLayout } from './components/AppLayout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth()
  return currentUser ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="/login" element={<PinLoginPage />} />

        {/* Main app routes with bottom tab navigation */}
        <Route
          path="/today"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TodayPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/collection"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MyPlantsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DiscoverPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* My Plants Routes */}
        <Route
          path="/my-plants"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MyPlantsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/plant/:id"
          element={
            <ProtectedRoute>
              <PlantDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-plant-flow"
          element={
            <ProtectedRoute>
              <AddPlantFlow />
            </ProtectedRoute>
          }
        />

        {/* My Garden Routes */}
        <Route
          path="/my-garden"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MyGardenPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/batch/:id"
          element={
            <ProtectedRoute>
              <BatchDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Discover Routes */}
        <Route
          path="/plant-info/:id"
          element={
            <ProtectedRoute>
              <PlantInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plant-identify-result/:id"
          element={
            <ProtectedRoute>
              <PlantIdentifyResultPage />
            </ProtectedRoute>
          }
        />

        {/* Profile Routes */}
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <FriendsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity-feed"
          element={
            <ProtectedRoute>
              <ActivityFeedPage />
            </ProtectedRoute>
          }
        />

        {/* Legacy routes (kept for backward compatibility) */}
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

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
