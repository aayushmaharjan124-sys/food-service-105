import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchProducts } from '../../services/product.service'
import ProductCard from '../../components/common/ProductCard'

export default function Search() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    searchProducts(q)
      .then(({ data }) => setProducts(data))
      .finally(() => setLoading(false))
  }, [q])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">
        Search results for: <span className="text-primary">"{q}"</span>
      </h1>
      <p className="text-gray-500 mb-6">{products.length} result(s) found</p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-64 animate-pulse bg-gray-200" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No dishes found for "{q}"</p>
          <a href="/menu" className="btn-primary mt-4 inline-block">Browse Menu</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => <ProductCard key={p.id || p._id} product={p} />)}
        </div>
      )}
    </div>
  )
}
