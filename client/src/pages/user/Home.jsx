import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCategories, getTopSelling } from '../../services/product.service'
import ProductCard from '../../components/common/ProductCard'

const HERO_SLIDES = [
  { title: 'Delicious Waffles', sub: 'Order Online', img: '🧇' },
  { title: 'Cheesy Burgers', sub: 'Fresh & Hot', img: '🍔' },
  { title: 'Roasted Chicken', sub: 'Chef Special', img: '🍗' },
]

export default function Home() {
  const [categories, setCategories] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
    getTopSelling(6)
      .then(({ data }) => setTopProducts(Array.isArray(data) ? data : []))
      .catch(() => setTopProducts([]))
    const timer = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-orange-50 to-red-50 py-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <span className="text-primary font-semibold">{HERO_SLIDES[slide].sub}</span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mt-2 mb-4">
              {HERO_SLIDES[slide].title}
            </h1>
            <Link to="/menu" className="btn-primary text-base">See Menu</Link>
          </div>
          <div className="text-[120px] select-none">{HERO_SLIDES[slide].img}</div>
        </div>
        <div className="flex justify-center gap-2 mt-6">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`w-3 h-3 rounded-full transition-colors ${i === slide ? 'bg-primary' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">Food Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/menu?category=${encodeURIComponent(cat.value)}`}
              className="card p-6 text-center hover:shadow-xl transition-shadow group"
            >
              <div className="text-4xl mb-3">
                {cat.value === 'fast food' ? '🍔' : cat.value === 'main dish' ? '🍽️' : cat.value === 'drinks' ? '🥤' : '🍰'}
              </div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Selling */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-center mb-8">🔥 Top Selling</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topProducts.map((p) => <ProductCard key={p.id || p._id} product={p} />)}
        </div>
        <div className="text-center mt-8">
          <Link to="/menu" className="btn-outline">View All Menu</Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🔍', title: 'Browse Menu', desc: 'Explore our wide variety of dishes' },
              { icon: '🛒', title: 'Add to Cart', desc: 'Select your favorites and quantities' },
              { icon: '🚀', title: 'Fast Delivery', desc: 'Get your order delivered hot & fresh' },
            ].map((step) => (
              <div key={step.title} className="card p-6">
                <div className="text-4xl mb-3">{step.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
