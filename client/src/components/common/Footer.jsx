import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="/tap-grab-logo.png" alt="Tap & Grab" className="h-10 w-10 object-contain" />
            <h3 className="text-white text-xl font-bold">Tap & Grab</h3>
          </div>
          <p className="text-sm">Delicious food delivered to your door. Order online, track in real-time.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/menu" className="hover:text-primary">Menu</Link></li>
            <li><Link to="/orders" className="hover:text-primary">Orders</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>📍 Dhobighat-04, Lalitpur, Nepal</li>
            <li>📞 +977-9804117033</li>
            <li>✉️ support@tapandgrab.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 text-center py-4 text-xs text-gray-500">
        © {new Date().getFullYear()} Tap & Grab. All rights reserved.
      </div>
    </footer>
  )
}
