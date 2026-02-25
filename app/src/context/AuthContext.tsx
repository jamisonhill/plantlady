import { createContext, useContext, useState, useEffect } from 'react'
import { User, Season, AuthContextType } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface SessionData {
  currentUser: User | null
  currentSeason: Season | null
  availableUsers: User[]
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])

  // Restore from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('plantlady-session')
    if (saved) {
      try {
        const data: SessionData = JSON.parse(saved)
        setCurrentUser(data.currentUser)
        setCurrentSeason(data.currentSeason)
        setAvailableUsers(data.availableUsers)
      } catch (error) {
        console.error('Failed to restore session:', error)
      }
    }
  }, [])

  // Persist to sessionStorage on change
  useEffect(() => {
    if (currentUser) {
      const sessionData: SessionData = {
        currentUser,
        currentSeason,
        availableUsers
      }
      sessionStorage.setItem('plantlady-session', JSON.stringify(sessionData))
    } else {
      sessionStorage.removeItem('plantlady-session')
    }
  }, [currentUser, currentSeason, availableUsers])

  const handleSetAvailableUsers = (users: User[]) => {
    setAvailableUsers(users)
  }

  const selectUser = (user: User, season: Season) => {
    setCurrentUser(user)
    setCurrentSeason(season)
  }

  const logout = () => {
    setCurrentUser(null)
    setCurrentSeason(null)
    sessionStorage.removeItem('plantlady-session')
  }

  const value: AuthContextType = {
    currentUser,
    currentSeason,
    availableUsers,
    setAvailableUsers: handleSetAvailableUsers,
    selectUser,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
