import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { client } from '../api/client'
import { EventType } from '../types'
import { LoadingSpinner } from '../components/LoadingSpinner'
import EventTypeGrid from '../components/EventTypeGrid'

type Step = 'select-event' | 'add-details' | 'saving' | 'done'

export default function LogEventPage() {
  const navigate = useNavigate()
  const { batchId } = useParams<{ batchId: string }>()
  const { currentUser } = useAuth()
  const [step, setStep] = useState<Step>('select-event')
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null)
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [error, setError] = useState('')

  if (!batchId || !currentUser) {
    return null
  }

  const handleSelectEventType = (eventType: EventType) => {
    setSelectedEventType(eventType)
    setStep('add-details')
  }

  const handleSubmit = async () => {
    if (!selectedEventType) return

    setStep('saving')
    try {
      const eventDate = new Date()
      const dateString = eventDate.toISOString().split('T')[0]

      await client.createEvent(currentUser.id, {
        batch_id: parseInt(batchId),
        event_type: selectedEventType,
        event_date: new Date(dateString + 'T12:00:00').toISOString(),
        notes: notes || undefined
      })

      // Upload photo if provided
      if (photo) {
        await client.uploadPhoto(currentUser.id, parseInt(batchId), photo)
      }

      setStep('done')
    } catch (err) {
      setError('Failed to log event')
      setStep('add-details')
      console.error(err)
    }
  }

  const handleLogAnother = () => {
    setSelectedEventType(null)
    setNotes('')
    setPhoto(null)
    setStep('select-event')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Step 1: Select Event Type */}
        {step === 'select-event' && (
          <div>
            <h1 className="text-2xl font-bold text-center text-sage-900 mb-8">What happened?</h1>
            <EventTypeGrid onSelect={handleSelectEventType} />
            <button
              onClick={() => navigate('/home')}
              className="w-full mt-6 bg-sage-100 text-sage-800 rounded-xl px-6 py-3 font-semibold active:bg-sage-200"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Step 2: Add Details */}
        {step === 'add-details' && (
          <div>
            <h1 className="text-2xl font-bold text-center text-sage-900 mb-8">Add details</h1>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sage-900 mb-2">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any observations..."
                  rows={4}
                  className="w-full border border-sage-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-900 mb-2">Photo (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  className="w-full border border-sage-200 rounded-xl px-4 py-3"
                />
                {photo && <p className="text-xs text-sage-600 mt-2">✓ {photo.name}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('select-event')}
                  className="flex-1 bg-sage-100 text-sage-800 rounded-xl px-6 py-3 font-semibold active:bg-sage-200"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-sage-600 text-white rounded-xl px-6 py-3 font-semibold active:bg-sage-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Saving */}
        {step === 'saving' && (
          <div>
            <h1 className="text-2xl font-bold text-center text-sage-900 mb-8">Saving...</h1>
            <LoadingSpinner />
          </div>
        )}

        {/* Step 4: Done */}
        {step === 'done' && (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-sage-900 mb-8">Event logged!</h1>
            <div className="space-y-3">
              <button
                onClick={handleLogAnother}
                className="w-full bg-sage-600 text-white rounded-xl px-6 py-3 font-semibold active:bg-sage-700"
              >
                Log another
              </button>
              <button
                onClick={() => navigate('/home')}
                className="w-full bg-sage-100 text-sage-800 rounded-xl px-6 py-3 font-semibold active:bg-sage-200"
              >
                Go home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
