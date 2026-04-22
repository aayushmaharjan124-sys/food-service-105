import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { updateProfile, updatePassword, updateAddress } from '../../services/user.service'
import { toast } from '../../components/common/Toast'
import { Link } from 'react-router-dom'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [tab, setTab] = useState('info')

  const [info, setInfo] = useState({ name: user?.name || '', email: user?.email || '', number: user?.number || '' })
  const [addr, setAddr] = useState({ area: user?.address?.area || '', city: user?.address?.city || '', country: user?.address?.country || '', pinCode: user?.address?.pinCode || '' })
  const [pass, setPass] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  const handleInfoSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await updateProfile(info)
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAddrSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await updateAddress(addr)
      // Update local user state so address auto-fills on checkout
      const updatedUser = { ...user, address: data.address }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      toast.success('Address saved')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address')
    } finally {
      setLoading(false)
    }
  }

  const handlePassSave = async (e) => {
    e.preventDefault()
    if (pass.newPassword !== pass.confirmPassword) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await updatePassword({ oldPassword: pass.oldPassword, newPassword: pass.newPassword })
      toast.success('Password updated')
      setPass({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'info', label: '👤 Info' },
    { id: 'address', label: '📍 Address' },
    { id: 'password', label: '🔒 Password' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="flex gap-2 mb-6 border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <form onSubmit={handleInfoSave} className="card p-6 space-y-4">
          <input className="input-field" placeholder="Name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
          <input className="input-field" placeholder="Email" type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} />
          <input className="input-field" placeholder="Phone Number" value={info.number} onChange={(e) => setInfo({ ...info, number: e.target.value })} />
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'address' && (
        <form onSubmit={handleAddrSave} className="card p-6 space-y-4">
          <input className="input-field" placeholder="Area / Street" value={addr.area} onChange={(e) => setAddr({ ...addr, area: e.target.value })} />
          <input className="input-field" placeholder="City" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
          <input className="input-field" placeholder="Country" value={addr.country} onChange={(e) => setAddr({ ...addr, country: e.target.value })} />
          <input className="input-field" placeholder="Pin Code" value={addr.pinCode} onChange={(e) => setAddr({ ...addr, pinCode: e.target.value })} />
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Saving...' : 'Save Address'}
          </button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={handlePassSave} className="card p-6 space-y-4">
          <input className="input-field" type="password" placeholder="Current Password" value={pass.oldPassword} onChange={(e) => setPass({ ...pass, oldPassword: e.target.value })} required />
          <input className="input-field" type="password" placeholder="New Password" value={pass.newPassword} onChange={(e) => setPass({ ...pass, newPassword: e.target.value })} required />
          <input className="input-field" type="password" placeholder="Confirm New Password" value={pass.confirmPassword} onChange={(e) => setPass({ ...pass, confirmPassword: e.target.value })} required />
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}

      <div className="mt-6 flex gap-4">
        <Link to="/orders" className="btn-outline text-sm">My Orders</Link>
        <Link to="/favorites" className="btn-outline text-sm">My Favorites</Link>
      </div>
    </div>
  )
}
