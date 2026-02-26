import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { client } from '../api/client'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Card } from '../components/Card'

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
        navigate('/today')
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
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl font-bold text-[var(--color-text)] mb-2">
            🌿 PlantLady
          </h1>
          <p className="text-[var(--color-text-2)] text-sm">
            Plant care made simple
          </p>
        </div>

        {/* PIN Card */}
        <Card variant="elevated" className="p-8 mb-8">
          <p className="font-body text-sm text-[var(--color-text-2)] text-center mb-4">
            Enter your PIN
          </p>

          {/* PIN Display */}
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border-strong)] flex items-center justify-center transition-all"
              >
                {i < pin.length && (
                  <span className="text-xl font-bold text-brand-terracotta">●</span>
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-semantic-error text-center mb-4">
              {error}
            </p>
          )}

          {/* Number Pad */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigit(String(digit))}
                  disabled={pin.length >= 4}
                  className="h-14 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-lg font-body font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-2)] active:bg-brand-terracotta active:text-white disabled:opacity-40 transition"
                >
                  {digit}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleClear}
                className="h-14 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm font-body font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-2)] active:bg-semantic-error active:text-white transition"
              >
                Clear
              </button>
              <button
                onClick={() => handleDigit('0')}
                disabled={pin.length >= 4}
                className="h-14 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-lg font-body font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-2)] active:bg-brand-terracotta active:text-white disabled:opacity-40 transition"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-14 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm font-body font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-2)] active:bg-semantic-error active:text-white transition"
              >
                ← Back
              </button>
            </div>
          </div>
        </Card>

        {/* Help Text */}
        <p className="text-center text-xs text-[var(--color-text-muted)]">
          Your 4-digit PIN
        </p>
      </div>
    </div>
  )
}
