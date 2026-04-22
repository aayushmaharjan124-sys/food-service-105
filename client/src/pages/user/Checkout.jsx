import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { placeOrder } from '../../services/order.service'
import { toast } from '../../components/common/Toast'

export default function Checkout() {
  const { cart, fetchCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const items = cart?.items || []
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const addr = user?.address
  const fullAddress = addr
    ? `${addr.area}, ${addr.city}, ${addr.country} - ${addr.pinCode}`
    : ''

  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.number || '',
    deliveryAddress: fullAddress,
    paymentMethod: 'cash on delivery',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.deliveryAddress.trim()) {
      return toast.error('Please enter a delivery address')
    }
    setLoading(true)
    try {
      const { data } = await placeOrder(form)
      toast.success('Order placed successfully!')
      await fetchCart()
      navigate(`/orders/${data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <a href="/menu" className="btn-primary mt-4 inline-block">Browse Menu</a>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Delivery Info */}
        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-bold">Delivery Information</h2>
          <input
            className="input-field"
            placeholder="Full Name"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            required
          />
          <input
            className="input-field"
            placeholder="Email"
            type="email"
            value={form.customerEmail}
            onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
            required
          />
          <input
            className="input-field"
            placeholder="Phone Number"
            value={form.customerPhone}
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            required
          />
          <textarea
            className="input-field"
            placeholder="Delivery Address"
            rows={3}
            value={form.deliveryAddress}
            onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
            required
          />
          <select
            className="input-field"
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
          >
            <option value="cash on delivery">Cash on Delivery</option>
          </select>
          {!fullAddress && (
            <p className="text-sm text-orange-500">
              💡 <a href="/profile" className="underline">Update your profile</a> to auto-fill address
            </p>
          )}
        </div>

        {/* Order Summary */}
        <div className="card p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span className="font-medium">NRS. {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-lg mb-6">
            <span>Grand Total</span>
            <span className="text-primary">NRS. {total}</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  )
}
