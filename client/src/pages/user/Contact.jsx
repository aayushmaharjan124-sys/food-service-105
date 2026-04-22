import { useState, useEffect } from 'react'
import api from '../../services/api'
import { toast } from '../../components/common/Toast'
import { useAuth } from '../../context/AuthContext'

export default function Contact() {
  const { user, isLoggedIn } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    number: user?.number || '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [myMessages, setMyMessages] = useState([])

  // Load user's message history if logged in
  useEffect(() => {
    if (!isLoggedIn) return
    api.get('/messages/my')
      .then(({ data }) => setMyMessages(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [isLoggedIn])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/messages', form)
      toast.success('Message sent!')
      setForm({ ...form, message: '' })
      // Refresh message history
      if (isLoggedIn) {
        const { data } = await api.get('/messages/my')
        setMyMessages(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="text-gray-500 mt-1"><a href="/" className="hover:text-primary">Home</a> / Contact</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Info */}
        <div className="card p-6 h-fit">
          <h3 className="font-semibold text-lg mb-4">Get in Touch</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>📍 Dhobighat-04, Lalitpur, Nepal - 44600</p>
            <p>📞 +977-9804117033</p>
            <p>✉️ support@tapandgrab.com</p>
            <p>🕐 Open: 10:00 AM – 10:00 PM</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <h3 className="font-semibold text-lg">Send a Message</h3>
          <input className="input-field" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input-field" type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input-field" placeholder="Phone Number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} required />
          <textarea className="input-field" rows={4} placeholder="Your message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required maxLength={500} />
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      {/* Message history with replies — only for logged in users */}
      {isLoggedIn && myMessages.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Your Message History</h2>
          <div className="space-y-4">
            {myMessages.map((m) => (
              <div key={m.id} className="card p-5">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</p>
                  {m.reply
                    ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Replied ✓</span>
                    : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>
                  }
                </div>

                {/* User's message */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-400 mb-1">You wrote:</p>
                  <p className="text-sm text-gray-700">{m.message}</p>
                </div>

                {/* Admin reply */}
                {m.reply && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <p className="text-xs text-primary mb-1">
                      Admin replied · {m.repliedAt ? new Date(m.repliedAt).toLocaleDateString() : ''}
                    </p>
                    <p className="text-sm text-gray-700">{m.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
