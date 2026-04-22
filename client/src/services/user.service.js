import api from './api'

export const getProfile = () => api.get('/users/profile')
export const updateProfile = (data) => api.put('/users/profile', data)
export const updatePassword = (data) => api.put('/users/password', data)
export const updateAddress = (data) => api.put('/users/address', data)
export const getFavorites = () => api.get('/users/favorites')
export const toggleFavorite = (productId) => api.post(`/users/favorites/${productId}`)
