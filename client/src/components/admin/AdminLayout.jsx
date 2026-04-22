import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/admin/dashboard', label: '📊 Dashboard' },
  { to: '/admin/products', label: '🍔 Products' },
  { to: '/admin/categories', label: '🏷️ Categories' },
  { to: '/admin/orders', label: '📦 Orders' },
  { to: '/admin/users', label: '👥 Users' },
  { to: '/admin/support', label: '💬 Support Chat' },
  { to: '/admin/messages', label: '✉️ Messages' },
]

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700 flex items-center gap-3">
          <img src="/tap-grab-logo.png" alt="Tap & Grab" className="h-10 w-10 object-contain rounded-lg" />
          <div>
            <h1 className="text-lg font-bold leading-tight">Tap & Grab</h1>
            <p className="text-gray-400 text-xs">{user?.name}</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="w-full text-left text-red-400 hover:text-red-300 text-sm px-4 py-2">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
