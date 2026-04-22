import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5001/uploads'

export { UPLOADS_URL }

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15s timeout — was missing
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Don't redirect if already on login pages
      const path = window.location.pathname
      if (!path.includes('/login')) {
        window.location.href = path.includes('/admin') ? '/admin/login' : '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
