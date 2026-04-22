import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import SearchBar from './SearchBar'

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/tap-grab-logo.png" alt="Tap & Grab" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-primary hidden sm:block">Tap & Grab</span>
        </Link>

        {/* Search */}
        <div className="hidden md:block flex-1 max-w-md mx-6">
          <SearchBar />
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/menu" className="hover:text-primary transition-colors">Menu</Link>
          <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>

          {isLoggedIn ? (
            <>
              <Link to="/cart" className="relative hover:text-primary">
                🛒
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              <Link to="/orders" className="hover:text-primary">Orders</Link>
              <Link to="/profile" className="hover:text-primary">
                👤 {user?.name?.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-primary">Login</Link>
              <Link to="/register" className="btn-primary text-sm">Register</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-2xl" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-3 flex flex-col gap-3 text-sm font-medium">
          <SearchBar />
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/menu" onClick={() => setMenuOpen(false)}>Menu</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          {isLoggedIn ? (
            <>
              <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart ({itemCount})</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="text-left text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
