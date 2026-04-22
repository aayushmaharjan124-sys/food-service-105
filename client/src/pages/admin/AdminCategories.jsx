import { useState, useEffect } from 'react'
import api from '../../services/api'
import AdminLayout from '../../components/admin/AdminLayout'
import { toast } from '../../components/common/Toast'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => api.get('/categories').then(({ data }) => setCategories(data))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      if (editId) {
        await api.put(`/categories/${editId}`, { name })
        toast.success('Category updated')
      } else {
        await api.post('/categories', { name })
        toast.success('Category added')
      }
      setName('')
      setEditId(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      await api.delete(`/categories/${id}`)
      toast.success('Category deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Categories</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-8 flex gap-3">
        <input
          className="input-field flex-1"
          placeholder="Category name (e.g. Fast Food)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? '...' : editId ? 'Update' : 'Add Category'}
        </button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setName('') }} className="btn-outline">
            Cancel
          </button>
        )}
      </form>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Value (used in products)</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{cat.value}</td>
                <td className="px-4 py-3 flex gap-3">
                  <button
                    onClick={() => { setEditId(cat.id); setName(cat.name) }}
                    className="text-primary hover:underline text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={3} className="text-center text-gray-400 py-8">No categories yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
