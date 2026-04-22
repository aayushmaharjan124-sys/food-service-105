const { Op } = require('sequelize')
const { Order, Cart, Product } = require('../models/index')

// Delivery estimation: Prep Time + (Active Orders × 2 minutes)
const estimateDelivery = async (items) => {
  const activeOrders = await Order.count({
    where: { status: { [Op.in]: ['placed', 'confirmed', 'preparing'] } },
  })
  // Guard against empty items array
  const prepTimes = items.map((i) => i.prepTime || 15)
  const maxPrepTime = prepTimes.length > 0 ? Math.max(...prepTimes) : 15
  return maxPrepTime + activeOrders * 2
}

// Place order and clear cart
const placeOrder = async (userId, orderData) => {
  const { customerName, customerEmail, customerPhone, deliveryAddress, paymentMethod } = orderData

  if (!customerName?.trim()) throw new Error('Customer name is required')
  if (!customerEmail?.trim()) throw new Error('Customer email is required')
  if (!customerPhone?.trim()) throw new Error('Customer phone is required')
  if (!deliveryAddress?.trim()) throw new Error('Delivery address is required')

  const cartItems = await Cart.findAll({ where: { userId } })
  if (!cartItems.length) throw new Error('Cart is empty')

  const items = cartItems.map((i) => ({
    productId: i.productId,
    name: i.name,
    price: parseFloat(i.price),
    quantity: i.quantity,
    image: i.image,
  }))

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const estimatedDelivery = await estimateDelivery(items)

  const order = await Order.create({
    userId,
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    customerPhone: customerPhone.trim(),
    deliveryAddress: deliveryAddress.trim(),
    paymentMethod: paymentMethod || 'cash on delivery',
    items,
    totalPrice,
    estimatedDelivery,
  })

  // Update product order counts for top-selling algorithm
  for (const item of items) {
    await Product.increment(
      { totalOrders: item.quantity, recentOrders: item.quantity },
      { where: { id: item.productId } }
    )
  }

  await Cart.destroy({ where: { userId } })
  return order
}

// Top-selling: score = (totalOrders * 0.7) + (recentOrders * 1.3)
const getTopSelling = async (limit = 6) => {
  const products = await Product.findAll({ where: { isAvailable: true } })
  return products
    .map((p) => ({ ...p.toJSON(), score: p.totalOrders * 0.7 + p.recentOrders * 1.3 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

// Fix: N+1 query resolved — fetch all products in one query
const getRecommendations = async (userId, limit = 6) => {
  const userOrders = await Order.findAll({ where: { userId } })

  if (!userOrders.length) return getTopSelling(limit)

  // Collect all productIds from all orders
  const productIds = []
  for (const order of userOrders) {
    const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]')
    items.forEach((i) => { if (i.productId) productIds.push(i.productId) })
  }

  if (!productIds.length) return getTopSelling(limit)

  // Single query to get all products
  const products = await Product.findAll({
    where: { id: { [Op.in]: productIds } },
    attributes: ['id', 'category'],
  })

  // Count categories
  const categoryCount = {}
  products.forEach((p) => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1
  })

  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0]
  if (topCategory) {
    const recs = await Product.findAll({ where: { category: topCategory, isAvailable: true }, limit })
    if (recs.length >= limit) return recs
  }

  return getTopSelling(limit)
}

// Reset recentOrders weekly (call via cron or scheduled task)
const resetRecentOrders = async () => {
  await Product.update({ recentOrders: 0 }, { where: {} })
  console.log('[cron] recentOrders reset')
}

module.exports = { placeOrder, getTopSelling, getRecommendations, resetRecentOrders }
