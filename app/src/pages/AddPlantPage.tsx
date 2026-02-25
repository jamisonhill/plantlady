import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { client } from '../api/client'
import { Variety } from '../types'
import { LoadingSpinner } from '../components/LoadingSpinner'
import VarietyPicker from '../components/VarietyPicker'

export default function AddPlantPage() {
  const navigate = useNavigate()
  const { currentUser, currentSeason } = useAuth()
  const [varieties, setVarieties] = useState<Variety[]>([])
  const [selectedVariety, setSelectedVariety] = useState<Variety | null>(null)
  const [seededDate, setSeededDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!currentUser || !currentSeason) {
      navigate('/login')
      return
    }

    const loadVarieties = async () => {
      try {
        const data = await client.getVarieties()
        setVarieties(data)
      } catch (err) {
        setError('Failed to load varieties')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadVarieties()
  }, [currentUser, currentSeason, navigate])

  const handleSubmit = async () => {
    if (!selectedVariety) {
      setError('Please select a variety')
      return
    }

    setSaving(true)
    try {
      await client.createBatch(currentUser!.id, {
        variety_id: selectedVariety.id,
        season_id: currentSeason!.id,
        seeded_date: seededDate || undefined
      })
      navigate('/home')
    } catch (err) {
      setError('Failed to create batch')
      console.error(err)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white p-4 pb-24">
      <div className="w-full max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-sage-900 mb-8">Add a plant</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Variety Picker */}
          <div>
            <label className="block text-sm font-medium text-sage-900 mb-3">Variety *</label>
            <VarietyPicker
              varieties={varieties}
              onSelect={setSelectedVariety}
            />
            {selectedVariety && (
              <div className="mt-3 p-3 bg-sage-50 rounded-xl border border-sage-200">
                <p className="font-medium text-sage-900">{selectedVariety.common_name}</p>
                <p className="text-xs text-sage-600">{selectedVariety.scientific_name}</p>
              </div>
            )}
          </div>

          {/* Seeded Date */}
          <div>
            <label className="block text-sm font-medium text-sage-900 mb-2">Seeded date (optional)</label>
            <input
              type="date"
              value={seededDate}
              onChange={(e) => setSeededDate(e.target.value)}
              className="w-full border border-sage-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => navigate('/home')}
              className="flex-1 bg-sage-100 text-sage-800 rounded-xl px-6 py-3 font-semibold active:bg-sage-200 disabled:opacity-40"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-sage-600 text-white rounded-xl px-6 py-3 font-semibold active:bg-sage-700 disabled:opacity-40"
              disabled={saving || !selectedVariety}
            >
              {saving ? 'Saving...' : 'Add plant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
