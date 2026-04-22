import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrders } from '../../services/order.service'
import { usePolling } from '../../hooks/usePolling'

const STATUS_COLORS = {
  placed: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  out_for_delivery: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const STATUS_STEPS = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']

// MySQL stores items as JSON string — parse safely
const parseItems = (items) => {
  if (Array.isArray(items)) return items
  try { return JSON.parse(items) } catch { return [] }
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const { data } = await getMyOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const hasActive = orders.some((o) => !['delivered', 'cancelled'].includes(o.status))
  usePolling(fetchOrders, 8000, hasActive)
  useEffect(() => { fetchOrders() }, [])

  if (loading) return <div className="text-center py-16">Loading orders...</div>

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <Link to="/menu" className="btn-primary mt-4 inline-block">Order Now</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => {
          const items = parseItems(order.items)
          const currentIdx = STATUS_STEPS.indexOf(order.status)
          return (
            <div key={order.id} className="card p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <p className="text-primary font-bold mt-1">NRS. {order.totalPrice}</p>
                </div>
              </div>

              {/* Progress bar */}
              {order.status !== 'cancelled' && (
                <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step} className="flex items-center gap-1 flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${i <= currentIdx ? 'bg-primary' : 'bg-gray-300'}`} />
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`h-0.5 w-8 ${i < currentIdx ? 'bg-primary' : 'bg-gray-300'}`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-sm text-gray-600">
                {items.map((item, i) => (
                  <span key={i} className="mr-3">{item.name} × {item.quantity}</span>
                ))}
              </div>

              {order.estimatedDelivery && !['delivered', 'cancelled'].includes(order.status) && (
                <p className="text-sm text-orange-500 mt-2">⏱ Est. delivery: ~{order.estimatedDelivery} min</p>
              )}

              <Link to={`/orders/${order.id}`} className="text-primary text-sm hover:underline mt-3 inline-block">
                View Details →
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
