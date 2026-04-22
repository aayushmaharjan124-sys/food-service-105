import { useState, useEffect } from 'react'
import { getAllUsers, deleteUser } from '../../services/admin.service'
import AdminLayout from '../../components/admin/AdminLayout'
import { toast } from '../../components/common/Toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    getAllUsers()
      .then(({ data }) => setUsers(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this user and all their data?')) return
    try {
      await deleteUser(id)
      toast.success('User deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Users ({users.length})</h1>

      {loading ? (
        <div className="text-center py-16">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{u.number}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(u._id)} className="text-red-500 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center text-gray-500 py-8">No users found.</p>}
        </div>
      )}
    </AdminLayout>
  )
}
