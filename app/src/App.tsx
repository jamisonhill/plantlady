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
import { CollectionPage } from './pages/CollectionPage'
import { PlantDetailPage } from './pages/PlantDetailPage'
import { AddPlantFlow } from './pages/AddPlantFlow'
import { BatchDetailPage } from './pages/BatchDetailPage'
import { AddBatchFlow } from './pages/AddBatchFlow'
import { PlantInfoPage } from './pages/PlantInfoPage'
import { PlantIdentifyResultPage } from './pages/PlantIdentifyResultPage'
import { FriendsPage } from './pages/FriendsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ActivityFeedPage } from './pages/ActivityFeedPage'
import { AddDistributionPage } from './pages/AddDistributionPage'
import { CostTrackerPage } from './pages/CostTrackerPage'
import { AddCostPage } from './pages/AddCostPage'
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
                <CollectionPage />
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

        {/* Plant Detail Route */}
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

        {/* Batch Detail Route */}
        <Route
          path="/batch/:id"
          element={
            <ProtectedRoute>
              <BatchDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-batch"
          element={
            <ProtectedRoute>
              <AddBatchFlow />
            </ProtectedRoute>
          }
        />
        <Route
          path="/batch/:id/distribute"
          element={
            <ProtectedRoute>
              <AddDistributionPage />
            </ProtectedRoute>
          }
        />

        {/* Cost Routes */}
        <Route
          path="/costs"
          element={
            <ProtectedRoute>
              <CostTrackerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-cost"
          element={
            <ProtectedRoute>
              <AddCostPage />
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
