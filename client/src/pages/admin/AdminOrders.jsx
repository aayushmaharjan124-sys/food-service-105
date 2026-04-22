import { useState, useEffect } from 'react'
import { getAllOrders, updateOrderStatus, deleteOrder } from '../../services/admin.service'
import AdminLayout from '../../components/admin/AdminLayout'
import { toast } from '../../components/common/Toast'

const STATUS_OPTIONS = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']
const PAYMENT_OPTIONS = ['pending', 'completed']

// MySQL returns items as a JSON string — parse it safely
const parseItems = (items) => {
  if (Array.isArray(items)) return items
  try { return JSON.parse(items) } catch { return [] }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const load = (status = '') => {
    setLoading(true)
    getAllOrders(status ? { status } : {})
      .then(({ data }) => setOrders(Array.isArray(data.orders) ? data.orders : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(filter) }, [filter])

  const handleStatusUpdate = async (id, field, value) => {
    try {
      await updateOrderStatus(id, { [field]: value })
      toast.success('Order updated')
      load(filter)
    } catch {
      toast.error('Update failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this order?')) return
    try {
      await deleteOrder(id)
      toast.success('Order deleted')
      load(filter)
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <select className="input-field w-48" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16">Loading orders...</div>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-500 py-16">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = parseItems(order.items)
            return (
              <div key={order.id} className="bg-white rounded-xl shadow p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div><span className="text-gray-400">Customer:</span> <span className="font-medium">{order.customerName}</span></div>
                  <div><span className="text-gray-400">Phone:</span> <span className="font-medium">{order.customerPhone}</span></div>
                  <div><span className="text-gray-400">Total:</span> <span className="font-bold text-primary">NRS. {order.totalPrice}</span></div>
                  <div><span className="text-gray-400">Date:</span> <span>{new Date(order.createdAt).toLocaleDateString()}</span></div>
                  <div className="col-span-2"><span className="text-gray-400">Address:</span> <span>{order.deliveryAddress}</span></div>
                  <div className="col-span-2">
                    <span className="text-gray-400">Items:</span>{' '}
                    {items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Status:</label>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, 'status', e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Payment:</label>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={order.paymentStatus}
                      onChange={(e) => handleStatusUpdate(order.id, 'paymentStatus', e.target.value)}
                    >
                      {PAYMENT_OPTIONS.map((s) => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="ml-auto text-red-500 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}
