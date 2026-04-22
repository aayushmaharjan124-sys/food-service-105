import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from '../../components/common/Toast'

export default function AdminLogin() {
  const { adminLogin, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await adminLogin(form)
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid admin credentials')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src="/tap-grab-logo.png" alt="Tap & Grab" className="h-16 w-16 object-contain mb-3" />
          <h2 className="text-2xl font-bold">Tap & Grab</h2>
          <p className="text-gray-500 text-sm">Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input-field" type="email" placeholder="Admin Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input-field" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Logging in...' : 'Login to Admin'}
          </button>
        </form>
      </div>
    </div>
  )
}
