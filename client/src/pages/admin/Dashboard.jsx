import { useState, useEffect } from 'react'
import { getDashboard } from '../../services/admin.service'
import AdminLayout from '../../components/admin/AdminLayout'
import { UPLOADS_URL } from '../../services/api'

const StatCard = ({ label, value, color = 'text-primary' }) => (
  <div className="bg-white rounded-xl shadow p-6">
    <p className="text-gray-500 text-sm">{label}</p>
    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
)

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminLayout><div className="text-center py-16">Loading dashboard...</div></AdminLayout>
  if (!data) return <AdminLayout><div className="text-center py-16 text-red-500">Failed to load dashboard.</div></AdminLayout>

  const { stats, topProducts, recentOrders } = data

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Pending Revenue" value={`NRS. ${stats.pendingRevenue}`} color="text-orange-500" />
        <StatCard label="Completed Revenue" value={`NRS. ${stats.completedRevenue}`} color="text-green-600" />
        <StatCard label="Total Products" value={stats.totalProducts} />
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Pending Orders" value={stats.pendingOrders} color="text-orange-500" />
        <StatCard label="Completed Orders" value={stats.completedOrders} color="text-green-600" />
        <StatCard label="Unread Messages" value={stats.unreadMessages} color="text-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products — fixed image URL and key */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-lg mb-4">🔥 Top Selling Products</h2>
          <div className="space-y-3">
            {(topProducts || []).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-5">{i + 1}.</span>
                <img
                  src={`${UPLOADS_URL}/${p.image}`}
                  alt={p.name}
                  className="w-10 h-10 rounded-lg object-cover"
                  onError={(e) => { e.target.src = 'https://placehold.co/40x40?text=?' }}
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.totalOrders} orders</p>
                </div>
                <span className="text-primary font-semibold text-sm">NRS. {p.price}</span>
              </div>
            ))}
            {(!topProducts || topProducts.length === 0) && (
              <p className="text-gray-400 text-sm">No products yet.</p>
            )}
          </div>
        </div>

        {/* Recent Orders — fixed key */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-lg mb-4">📦 Recent Orders</h2>
          <div className="space-y-3">
            {(recentOrders || []).map((o) => (
              <div key={o.id} className="flex justify-between items-center text-sm border-b pb-2">
                <div>
                  <p className="font-medium">{o.customerName}</p>
                  <p className="text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">NRS. {o.totalPrice}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${o.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {o.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
            {(!recentOrders || recentOrders.length === 0) && (
              <p className="text-gray-400 text-sm">No orders yet.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

