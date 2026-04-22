import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProduct, addReview } from '../../services/product.service'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { toggleFavorite } from '../../services/user.service'
import { toast } from '../../components/common/Toast'
import { UPLOADS_URL } from '../../services/api'

export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [favorited, setFavorited] = useState(false)
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getProduct(id)
      .then(({ data }) => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!isLoggedIn) return navigate('/login')
    await addToCart(id, qty)
    toast.success('Added to cart!')
  }

  const handleFavorite = async () => {
    if (!isLoggedIn) return navigate('/login')
    await toggleFavorite(id)
    setFavorited((f) => !f)
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) return navigate('/login')
    setSubmitting(true)
    try {
      await addReview(id, review)
      toast.success('Review submitted!')
      const { data } = await getProduct(id)
      setProduct(data)
      setReview({ rating: 5, comment: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center py-16">Loading...</div>
  if (!product) return (
    <div className="text-center py-16">
      <p className="text-gray-500 mb-4">Product not found.</p>
      <Link to="/menu" className="btn-primary">Back to Menu</Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/menu" className="text-primary hover:underline text-sm mb-6 inline-block">← Back to Menu</Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <img
          src={`${UPLOADS_URL}/${product.image}`}
          alt={product.name}
          className="w-full rounded-xl object-cover h-72"
          onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=No+Image' }}
        />
        <div>
          <span className="text-xs bg-primary text-white px-3 py-1 rounded-full capitalize">{product.category}</span>
          <h1 className="text-3xl font-bold mt-3 mb-2">{product.name}</h1>
          {product.description && <p className="text-gray-500 mb-4">{product.description}</p>}
          <p className="text-primary text-3xl font-bold mb-4">NRS. {product.price}</p>
          <p className="text-sm text-gray-400 mb-6">⏱ Prep time: ~{product.prepTime} min</p>

          <div className="flex items-center gap-3">
            <input
              type="number" min={1} max={99} value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 border rounded px-2 py-2 text-center"
            />
            <button onClick={handleAddToCart} className="btn-primary flex-1">Add to Cart 🛒</button>
            <button
              onClick={handleFavorite}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${favorited ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 text-gray-400 hover:border-red-400 hover:text-red-400'}`}
            >♥</button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Reviews ({product.reviews?.length || 0})</h2>

        {(product.reviews || []).length === 0 ? (
          <p className="text-gray-400 text-sm mb-6">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4 mb-6">
            {product.reviews.map((r) => (
              <div key={r.id} className="border-b pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm">{r.User?.name || 'User'}</span>
                  <span className="text-yellow-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                {r.comment && <p className="text-gray-500 text-sm">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {isLoggedIn && (
          <form onSubmit={handleReview} className="space-y-3">
            <h3 className="font-semibold">Leave a Review</h3>
            <select
              className="input-field"
              value={review.rating}
              onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{'★'.repeat(n)} {n} star{n > 1 ? 's' : ''}</option>
              ))}
            </select>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Write your review..."
              value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })}
            />
            <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

