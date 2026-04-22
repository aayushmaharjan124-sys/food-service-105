import { useState, useEffect } from 'react'
import { getMessages, markMessageRead } from '../../services/admin.service'
import api from '../../services/api'
import AdminLayout from '../../components/admin/AdminLayout'
import { toast } from '../../components/common/Toast'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState({}) // { [id]: string }
  const [replying, setReplying] = useState(null)

  const load = () => {
    getMessages()
      .then(({ data }) => setMessages(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRead = async (id) => {
    await markMessageRead(id)
    load()
  }

  const handleReply = async (id) => {
    const text = replyText[id]?.trim()
    if (!text) return toast.error('Reply cannot be empty')
    setReplying(id)
    try {
      await api.post(`/admin/messages/${id}/reply`, { reply: text })
      toast.success('Reply sent!')
      setReplyText((prev) => ({ ...prev, [id]: '' }))
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply')
    } finally {
      setReplying(null)
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Messages ({messages.length})</h1>

      {loading ? (
        <div className="text-center py-16">Loading...</div>
      ) : messages.length === 0 ? (
        <p className="text-center text-gray-500 py-16">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`bg-white rounded-xl shadow p-6 border-l-4 ${m.reply ? 'border-green-400' : m.isRead ? 'border-gray-200' : 'border-primary'}`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm text-gray-400">{m.email} · {m.number}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</p>
                  <div className="flex gap-2 mt-1 justify-end">
                    {m.reply && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Replied</span>
                    )}
                    {!m.isRead && (
                      <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">New</span>
                    )}
                  </div>
                </div>
              </div>

              {/* User message */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-400 mb-1">User message:</p>
                <p className="text-gray-700 text-sm">{m.message}</p>
              </div>

              {/* Existing reply */}
              {m.reply && (
                <div className="bg-green-50 rounded-lg p-3 mb-3 border border-green-200">
                  <p className="text-xs text-green-600 mb-1">
                    Your reply · {m.repliedAt ? new Date(m.repliedAt).toLocaleDateString() : ''}
                  </p>
                  <p className="text-gray-700 text-sm">{m.reply}</p>
                </div>
              )}

              {/* Reply box */}
              <div className="flex gap-2 mt-2">
                <textarea
                  rows={2}
                  placeholder={m.reply ? 'Update reply...' : 'Write a reply...'}
                  value={replyText[m.id] || ''}
                  onChange={(e) => setReplyText((prev) => ({ ...prev, [m.id]: e.target.value }))}
                  className="input-field flex-1 text-sm resize-none"
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleReply(m.id)}
                    disabled={replying === m.id}
                    className="btn-primary text-sm px-4 disabled:opacity-60"
                  >
                    {replying === m.id ? '...' : m.reply ? 'Update' : 'Reply'}
                  </button>
                  {!m.isRead && (
                    <button
                      onClick={() => handleRead(m.id)}
                      className="text-xs text-gray-400 hover:text-gray-600 border rounded px-2 py-1"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
