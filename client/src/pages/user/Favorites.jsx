import { useState, useEffect } from 'react'
import { getFavorites } from '../../services/user.service'
import ProductCard from '../../components/common/ProductCard'
import { Link } from 'react-router-dom'

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    getFavorites()
      .then(({ data }) => setFavorites(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="text-center py-16">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Favorites ♥</h1>
      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💔</div>
          <p className="text-gray-500 mb-4">No favorites yet</p>
          <Link to="/menu" className="btn-primary">Browse Menu</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((p) => (
            <ProductCard key={p._id} product={p} isFavorited={true} onFavoriteToggle={load} />
          ))}
        </div>
      )}
    </div>
  )
}
