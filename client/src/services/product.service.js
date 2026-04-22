import api from './api'

export const getProducts = (params) => api.get('/products', { params })
export const getProduct = (id) => api.get(`/products/${id}`)
export const searchProducts = (q) => api.get('/products/search', { params: { q } })
export const autocomplete = (q) => api.get('/products/autocomplete', { params: { q } })
export const getTopSelling = (limit = 6) => api.get('/products/top-selling', { params: { limit } })
export const getRecommendations = () => api.get('/products/recommendations')
export const getCategories = () => api.get('/categories')
export const addReview = (id, data) => api.post(`/products/${id}/reviews`, data)

// Admin
export const createProduct = (formData) =>
  api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteProduct = (id) => api.delete(`/products/${id}`)
