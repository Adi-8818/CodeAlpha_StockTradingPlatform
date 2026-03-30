import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('bullrun_user')
    const token  = localStorage.getItem('bullrun_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('bullrun_user',  JSON.stringify(userData))
    localStorage.setItem('bullrun_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('bullrun_user')
    localStorage.removeItem('bullrun_token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const updateBalance = (balance) => {
    if (!user) return
    const updated = { ...user, balance }
    setUser(updated)
    localStorage.setItem('bullrun_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateBalance, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
