import { useState, useEffect } from 'react'
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../../services/product.service'
import AdminLayout from '../../components/admin/AdminLayout'
import { toast } from '../../components/common/Toast'
import { UPLOADS_URL } from '../../services/api'

const EMPTY_FORM = { name: '', category: '', price: '', description: '', prepTime: '15' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [image, setImage] = useState(null)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => {
    getProducts().then(({ data }) => setProducts(Array.isArray(data) ? data : []))
    getCategories().then(({ data }) => setCategories(Array.isArray(data) ? data : []))
  }
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editId && !image) return toast.error('Product image is required')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (image) fd.append('image', image)

      if (editId) {
        await updateProduct(editId, fd)   // PUT /api/products/:id
        toast.success('Product updated')
      } else {
        await createProduct(fd)           // POST /api/products
        toast.success('Product added')
      }
      setForm(EMPTY_FORM)
      setImage(null)
      setEditId(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  // Fix: use p.id (MySQL) not p._id (MongoDB)
  const handleEdit = (p) => {
    setEditId(p.id)
    setForm({
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description || '',
      prepTime: p.prepTime || 15,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct(id)
      toast.success('Product deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">{editId ? '✏️ Edit Product' : '➕ Add Product'}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="input-field"
          placeholder="Product Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <select
          className="input-field"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.value} className="capitalize">{c.name}</option>
          ))}
        </select>
        <input
          className="input-field"
          type="number"
          placeholder="Price (NRS)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
          min="0"
        />
        <input
          className="input-field"
          type="number"
          placeholder="Prep Time (minutes)"
          value={form.prepTime}
          onChange={(e) => setForm({ ...form, prepTime: e.target.value })}
          min="1"
        />
        <input
          className="input-field md:col-span-2"
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="md:col-span-2">
          <input
            type="file"
            accept="image/jpg,image/jpeg,image/png,image/webp"
            onChange={(e) => setImage(e.target.files[0])}
            className="input-field"
          />
          <p className="text-xs text-gray-400 mt-1">
            {editId ? 'Leave empty to keep current image' : 'Required — max 2MB, JPG/PNG/WEBP'}
          </p>
        </div>
        <div className="md:col-span-2 flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
            {loading ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => { setEditId(null); setForm(EMPTY_FORM); setImage(null) }}
              className="btn-outline"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="text-xl font-bold mb-4">All Products ({products.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow overflow-hidden">
            <img
              src={`${UPLOADS_URL}/${p.image}`}
              alt={p.name}
              className="w-full h-40 object-cover"
              onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image' }}
            />
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-gray-400 capitalize">{p.category}</p>
                </div>
                <span className="text-primary font-bold">NRS. {p.price}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Orders: {p.totalOrders} | Prep: {p.prepTime}min</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleEdit(p)} className="flex-1 btn-outline text-sm py-1">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-1 rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}

