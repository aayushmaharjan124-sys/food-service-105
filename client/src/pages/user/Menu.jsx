import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, getCategories } from '../../services/product.service'
import ProductCard from '../../components/common/ProductCard'

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const activeCategory = searchParams.get('category') || ''

  useEffect(() => {
    getCategories().then(({ data }) => setCategories(data))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = activeCategory ? { category: activeCategory } : {}
    getProducts(params)
      .then(({ data }) => setProducts(data))
      .finally(() => setLoading(false))
  }, [activeCategory])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Our Menu</h1>
        <p className="text-gray-500 mt-1">
          <a href="/" className="hover:text-primary">Home</a> / Menu
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => setSearchParams({})}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!activeCategory ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSearchParams({ category: cat.value })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${activeCategory === cat.value ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-64 animate-pulse bg-gray-200" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500 py-16">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => <ProductCard key={p.id || p._id} product={p} />)}
        </div>
      )}
    </div>
  )
}
