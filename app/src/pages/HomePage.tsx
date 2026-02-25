import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { client } from '../api/client'
import { Batch } from '../types'
import { LoadingSpinner } from '../components/LoadingSpinner'
import PlantCard from '../components/PlantCard'

export default function HomePage() {
  const navigate = useNavigate()
  const { currentUser, currentSeason, logout } = useAuth()
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!currentUser || !currentSeason) {
      navigate('/login')
      return
    }

    const loadData = async () => {
      try {
        // Load batches and varieties in parallel
        const [batchesData, varietiesData] = await Promise.all([
          client.getBatches(currentSeason.id),
          client.getVarieties()
        ])

        // Create a map of variety_id -> variety for fast lookup
        const varietyMap = new Map(varietiesData.map((v) => [v.id, v]))

        // Enrich batches with variety_name
        const enrichedBatches = batchesData.map((batch) => ({
          ...batch,
          variety_name: varietyMap.get(batch.variety_id)?.common_name
        }))

        setBatches(enrichedBatches)
      } catch (err) {
        setError('Failed to load plants')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentUser, currentSeason, navigate])

  const handleLogEvent = (batch: Batch) => {
    navigate(`/log-event/${batch.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-sage-100 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sage-900">🌱 PlantLady</h1>
          <p className="text-xs text-sage-600">{currentUser?.name}</p>
        </div>
        <button
          onClick={logout}
          className="text-sm text-sage-600 active:text-sage-900"
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {batches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sage-600 mb-4">No plants yet</p>
            <button
              onClick={() => navigate('/add-plant')}
              className="bg-sage-600 text-white rounded-xl px-6 py-3 font-semibold active:bg-sage-700"
            >
              Add your first plant
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {batches.map((batch) => (
              <PlantCard
                key={batch.id}
                batch={batch}
                onTap={handleLogEvent}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/add-plant')}
        className="fixed bottom-6 right-6 z-10 min-h-[56px] min-w-[56px] bg-sage-600 rounded-full text-white shadow-lg text-2xl active:bg-sage-700"
      >
        +
      </button>
    </div>
  )
}
