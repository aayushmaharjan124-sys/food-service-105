import api from './api'

export const getDashboard = () => api.get('/admin/dashboard')
export const getAllOrders = (params) => api.get('/admin/orders', { params })
export const updateOrderStatus = (id, data) => api.put(`/admin/orders/${id}`, data)
export const deleteOrder = (id) => api.delete(`/admin/orders/${id}`)
export const getAllUsers = () => api.get('/admin/users')
export const deleteUser = (id) => api.delete(`/admin/users/${id}`)
export const getMessages = () => api.get('/admin/messages')
export const markMessageRead = (id) => api.put(`/admin/messages/${id}/read`)
export const sendMessage = (data) => api.post('/messages', data)
