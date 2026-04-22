import { createContext, useContext, useState, useEffect } from 'react'
import { login, register, adminLogin } from '../services/auth.service'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  const saveSession = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogin = async (credentials) => {
    setLoading(true)
    try {
      const { data } = await login(credentials)
      saveSession(data.user, data.token)
      return data
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async (credentials) => {
    setLoading(true)
    try {
      const { data } = await adminLogin(credentials)
      saveSession(data.user, data.token)
      return data
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (userData) => {
    setLoading(true)
    try {
      const { data } = await register(userData)
      saveSession(data.user, data.token)
      return data
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'
  const isLoggedIn = !!user

  return (
    <AuthContext.Provider value={{
      user, loading, isAdmin, isLoggedIn,
      login: handleLogin,
      adminLogin: handleAdminLogin,
      register: handleRegister,
      logout,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
