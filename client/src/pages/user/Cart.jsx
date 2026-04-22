import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { toast } from '../../components/common/Toast'
import { UPLOADS_URL } from '../../services/api'

export default function Cart() {
  const { cart, updateItem, removeItem, clearCart } = useCart()
  const items = cart?.items || []
  const total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)

  const handleRemove = async (itemId) => {
    await removeItem(itemId)
    toast.success('Item removed from cart')
  }

  const handleClear = async () => {
    if (!confirm('Clear entire cart?')) return
    await clearCart()
    toast.info('Cart cleared')
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some delicious items from our menu</p>
        <Link to="/menu" className="btn-primary">Browse Menu</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex gap-4 items-center">
              <img
                src={`${UPLOADS_URL}/${item.image}`}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                onError={(e) => { e.target.src = 'https://placehold.co/80x80?text=?' }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{item.name}</h3>
                <p className="text-primary font-bold">NRS. {item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateItem(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-40 font-bold"
                >−</button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateItem(item.id, item.quantity + 1)}
                  disabled={item.quantity >= 99}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-40 font-bold"
                >+</button>
              </div>
              <div className="text-right min-w-[80px]">
                <p className="font-bold">NRS. {(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                <button onClick={() => handleRemove(item.id)} className="text-red-500 text-sm hover:underline mt-1">Remove</button>
              </div>
            </div>
          ))}

          <button onClick={handleClear} className="text-red-500 text-sm hover:underline">
            Clear all items
          </button>
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between">
                <span className="truncate mr-2">{i.name} × {i.quantity}</span>
                <span className="flex-shrink-0">NRS. {(parseFloat(i.price) * i.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">NRS. {total.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn-primary w-full text-center mt-4 block">
            Proceed to Checkout
          </Link>
          <Link to="/menu" className="btn-outline w-full text-center mt-2 block text-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
