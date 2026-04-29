import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.me().then(r => { setUser(r.user || null); setLoading(false) })
  }, [])

  const login = async (email, password) => {
    const r = await api.login(email, password)
    if (r.error) return r
    setUser(r.user); return r
  }
  const signup = async (email, password) => {
    const r = await api.signup(email, password)
    if (r.error) return r
    setUser(r.user); return r
  }
  const logout = async () => { await api.logout(); setUser(null) }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)