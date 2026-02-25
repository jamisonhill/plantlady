import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { client } from '../api/client'
import { LoadingSpinner } from '../components/LoadingSpinner'

export default function PinLoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { selectUser } = useAuth()

  const handleDigit = async (digit: string) => {
    const newPin = pin + digit
    setPin(newPin)
    setError('')

    // Auto-submit on 4th digit
    if (newPin.length === 4) {
      setLoading(true)
      try {
        const user = await client.login(newPin)
        const seasons = await client.getSeasons()
        const currentSeason = seasons[0]
        selectUser(user, currentSeason)
        navigate('/home')
      } catch (err) {
        setError('Invalid PIN')
        setPin('')
        setLoading(false)
      }
    }
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
    setError('')
  }

  const handleClear = () => {
    setPin('')
    setError('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white flex items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-bold text-center text-sage-900 mb-2">🌱 PlantLady</h1>
        <p className="text-center text-sage-600 mb-8">Enter your PIN</p>

        {/* PIN Display */}
        <div className="bg-white rounded-xl border border-sage-100 p-6 mb-8 text-center">
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-lg bg-sage-100 flex items-center justify-center"
              >
                {i < pin.length && <span className="text-2xl font-bold text-sage-900">●</span>}
              </div>
            ))}
          </div>
          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(String(digit))}
              disabled={pin.length >= 4}
              className="min-h-[64px] bg-white rounded-xl border border-sage-100 text-lg font-semibold text-sage-900 active:bg-sage-50 disabled:opacity-40 transition"
            >
              {digit}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={handleClear}
            className="min-h-[64px] bg-white rounded-xl border border-sage-100 text-sm font-semibold text-sage-900 active:bg-sage-50 transition"
          >
            Clear
          </button>
          <button
            onClick={() => handleDigit('0')}
            disabled={pin.length >= 4}
            className="min-h-[64px] bg-white rounded-xl border border-sage-100 text-lg font-semibold text-sage-900 active:bg-sage-50 disabled:opacity-40 transition"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="min-h-[64px] bg-white rounded-xl border border-sage-100 text-sm font-semibold text-sage-900 active:bg-sage-50 transition"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}
