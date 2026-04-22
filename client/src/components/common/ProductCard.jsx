import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { toggleFavorite, getFavorites } from '../../services/user.service'
import { UPLOADS_URL } from '../../services/api'

export default function ProductCard({ product, isFavorited = false, onFavoriteToggle }) {
  const { addToCart } = useCart()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)
  const [favorited, setFavorited] = useState(isFavorited)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) return
    getFavorites().then(({ data }) => {
      const pid = product.id
      setFavorited(Array.isArray(data) && data.some((f) => f?.id == pid))
    }).catch(() => {})
  }, [isLoggedIn, product.id])

  const handleAddToCart = async () => {
    if (!isLoggedIn) return navigate('/login')
    setAdding(true)
    try {
      await addToCart(product.id, qty)
    } finally {
      setAdding(false)
    }
  }

  const handleFavorite = async () => {
    if (!isLoggedIn) return navigate('/login')
    try {
      await toggleFavorite(product.id)
      setFavorited((prev) => !prev)
      onFavoriteToggle?.()
    } catch {}
  }

  const productId = product.id

  return (
    <div className="card group hover:shadow-xl transition-shadow duration-300">
      <div className="relative overflow-hidden">
        <img
          src={`${UPLOADS_URL}/${product.image}`}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image' }}
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {/* Favorite button — red stays if favorited */}
          <button
            onClick={handleFavorite}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow transition-colors ${
              favorited ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
            }`}
          >
            ♥
          </button>
          {/* Eye icon — links to product detail page */}
          <Link
            to={`/menu/${productId}`}
            title="Quick view"
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow text-gray-500 hover:text-primary transition-colors"
          >
            👁
          </Link>
        </div>
        <span className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full capitalize">
          {product.category}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-primary font-bold text-lg">NRS. {product.price}</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1} max={99}
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-14 border rounded px-2 py-1 text-sm text-center"
            />
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="btn-primary text-sm py-1 px-3 disabled:opacity-60"
            >
              {adding ? '...' : '🛒'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

