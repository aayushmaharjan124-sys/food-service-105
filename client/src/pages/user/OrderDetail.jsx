import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrder } from '../../services/order.service'
import { usePolling } from '../../hooks/usePolling'

const STATUS_STEPS = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']

const parseItems = (items) => {
  if (Array.isArray(items)) return items
  try { return JSON.parse(items) } catch { return [] }
}

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchOrder = async () => {
    try {
      const { data } = await getOrder(id)
      setOrder(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const isActive = order && !['delivered', 'cancelled'].includes(order.status)
  usePolling(fetchOrder, 8000, !!isActive)
  useEffect(() => { fetchOrder() }, [id])

  if (loading) return <div className="text-center py-16">Loading...</div>
  if (error || !order) return (
    <div className="text-center py-16">
      <p className="text-gray-500 mb-4">Order not found.</p>
      <Link to="/orders" className="btn-primary">Back to Orders</Link>
    </div>
  )

  const items = parseItems(order.items)
  const currentIdx = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/orders" className="text-primary hover:underline text-sm mb-4 inline-block">← Back to Orders</Link>
      <h1 className="text-2xl font-bold mb-6">Order #{order.id}</h1>

      <div className="card p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div><span className="text-gray-500">Name:</span> <span className="font-medium">{order.customerName}</span></div>
          <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{order.customerPhone}</span></div>
          <div><span className="text-gray-500">Email:</span> <span className="font-medium">{order.customerEmail}</span></div>
          <div><span className="text-gray-500">Payment:</span> <span className="font-medium capitalize">{order.paymentMethod}</span></div>
          <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="font-medium">{order.deliveryAddress}</span></div>
          <div><span className="text-gray-500">Payment Status:</span>
            <span className={`ml-1 font-medium ${order.paymentStatus === 'completed' ? 'text-green-600' : 'text-orange-500'}`}>
              {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Status tracker */}
        {order.status !== 'cancelled' ? (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Order Status</h3>
            <div className="flex items-start gap-2 overflow-x-auto pb-2">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= currentIdx ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {i < currentIdx ? '✓' : i + 1}
                    </div>
                    <span className="text-xs mt-1 capitalize text-center w-20">{step.replace(/_/g, ' ')}</span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`h-0.5 w-8 mb-5 ${i < currentIdx ? 'bg-primary' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6 p-3 bg-red-50 rounded-lg text-red-600 text-sm">Order was cancelled.</div>
        )}

        {order.estimatedDelivery && isActive && (
          <p className="text-orange-500 text-sm mb-4">⏱ Estimated delivery: ~{order.estimatedDelivery} minutes</p>
        )}

        <h3 className="font-semibold mb-3">Items Ordered</h3>
        <div className="space-y-2 mb-4">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span className="font-medium">NRS. {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span className="text-primary">NRS. {order.totalPrice}</span>
        </div>
      </div>
    </div>
  )
}
