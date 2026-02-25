import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { client } from '../api/client'
import { LoadingSpinner } from '../components/LoadingSpinner'

export default function UserSelectPage() {
  const navigate = useNavigate()
  const { availableUsers, selectUser } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSelectUser = async (userId: number) => {
    setLoading(true)
    try {
      const seasons = await client.getSeasons()
      const user = availableUsers.find((u) => u.id === userId)
      if (!user || !seasons.length) {
        throw new Error('Could not load user or seasons')
      }
      // Select the first season (current season)
      selectUser(user, seasons[0])
      navigate('/home')
    } catch (error) {
      console.error('Error selecting user:', error)
      setLoading(false)
    }
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
        <h1 className="text-3xl font-bold text-center text-sage-900 mb-8">Who are you?</h1>

        <div className="space-y-4">
          {availableUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelectUser(user.id)}
              className="w-full min-h-[120px] bg-white rounded-xl border border-sage-100 p-6 text-center active:bg-sage-50 transition"
            >
              <p className="text-2xl font-bold text-sage-900">{user.name}</p>
            </button>
          ))}
        </div>

        {availableUsers.length === 0 && (
          <p className="text-center text-sage-600">No users available. Please log in again.</p>
        )}
      </div>
    </div>
  )
}
