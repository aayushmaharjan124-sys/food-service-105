const { Cart, Product } = require('../models/index')

// GET /api/cart — mapped from PHP: SELECT * FROM cart WHERE user_id = ?
const getCart = async (req, res) => {
  try {
    const items = await Cart.findAll({ where: { userId: req.user.id } })
    const total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)
    res.json({ items, total })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/cart — mapped from PHP add_cart.php
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body
    const product = await Product.findByPk(productId)
    if (!product || !product.isAvailable) {
      return res.status(404).json({ message: 'Product not found or unavailable' })
    }

    const existing = await Cart.findOne({ where: { userId: req.user.id, productId } })
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, 99)
      await existing.save()
    } else {
      await Cart.create({
        userId: req.user.id,
        productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      })
    }

    const items = await Cart.findAll({ where: { userId: req.user.id } })
    const total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)
    res.json({ items, total })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// PUT /api/cart/:itemId — mapped from PHP cart.php update_qty
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body
    const item = await Cart.findOne({ where: { id: req.params.itemId, userId: req.user.id } })
    if (!item) return res.status(404).json({ message: 'Item not found' })

    item.quantity = Math.max(1, Math.min(quantity, 99))
    await item.save()

    const items = await Cart.findAll({ where: { userId: req.user.id } })
    const total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)
    res.json({ items, total })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE /api/cart/:itemId — mapped from PHP cart.php delete
const removeCartItem = async (req, res) => {
  try {
    await Cart.destroy({ where: { id: req.params.itemId, userId: req.user.id } })
    const items = await Cart.findAll({ where: { userId: req.user.id } })
    const total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)
    res.json({ items, total })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE /api/cart/clear — mapped from PHP cart.php delete_all
const clearCart = async (req, res) => {
  try {
    await Cart.destroy({ where: { userId: req.user.id } })
    res.json({ items: [], total: 0 })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart }
