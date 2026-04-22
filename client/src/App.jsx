import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ToastContainer from './components/common/Toast'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import SupportChat from './components/common/SupportChat'
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute'

// User pages
import Home from './pages/user/Home'
import Menu from './pages/user/Menu'
import Search from './pages/user/Search'
import Cart from './pages/user/Cart'
import Checkout from './pages/user/Checkout'
import Orders from './pages/user/Orders'
import OrderDetail from './pages/user/OrderDetail'
import Profile from './pages/user/Profile'
import Favorites from './pages/user/Favorites'
import Login from './pages/user/Login'
import Register from './pages/user/Register'
import Contact from './pages/user/Contact'
import ProductDetail from './pages/user/ProductDetail'

import AdminMessages from './pages/admin/AdminMessages'
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCategories from './pages/admin/AdminCategories'
import AdminSupport from './pages/admin/AdminSupport'
// Admin pages
import AdminLogin from './pages/admin/AdminLogin'

const UserLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-screen">{children}</main>
    <Footer />
    <SupportChat />
  </>
)

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastContainer />
        <Routes>
          {/* Public user routes */}
          <Route path="/" element={<UserLayout><Home /></UserLayout>} />
          <Route path="/menu" element={<UserLayout><Menu /></UserLayout>} />
          <Route path="/search" element={<UserLayout><Search /></UserLayout>} />
          <Route path="/contact" element={<UserLayout><Contact /></UserLayout>} />
          <Route path="/menu/:id" element={<UserLayout><ProductDetail /></UserLayout>} />
          <Route path="/login" element={<UserLayout><Login /></UserLayout>} />
          <Route path="/register" element={<UserLayout><Register /></UserLayout>} />

          {/* Protected user routes */}
          <Route path="/cart" element={<ProtectedRoute><UserLayout><Cart /></UserLayout></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><UserLayout><Checkout /></UserLayout></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><UserLayout><Orders /></UserLayout></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><UserLayout><OrderDetail /></UserLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserLayout><Profile /></UserLayout></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><UserLayout><Favorites /></UserLayout></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />
          <Route path="/admin/support" element={<AdminRoute><AdminSupport /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={<UserLayout><div className="text-center py-24"><h1 className="text-4xl font-bold">404</h1><p className="text-gray-500 mt-2">Page not found</p><a href="/" className="btn-primary mt-4 inline-block">Go Home</a></div></UserLayout>} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}
