const { Order, User, Product, Message, Cart } = require('../models/index')
const { Op } = require('sequelize')
const sequelize = require('../config/db')

// Mapped from PHP admin/dashboard.php
const getDashboard = async (req, res) => {
  try {
    const [totalOrders, pendingOrders, completedOrders, totalProducts, totalUsers, totalMessages, unreadMessages] =
      await Promise.all([
        Order.count(),
        Order.count({ where: { paymentStatus: 'pending' } }),
        Order.count({ where: { paymentStatus: 'completed' } }),
        Product.count(),
        User.count({ where: { role: 'user' } }),
        Message.count(),
        Message.count({ where: { isRead: false } }),
      ])

    const [pendingRev] = await sequelize.query(
      "SELECT SUM(totalPrice) as total FROM orders WHERE paymentStatus = 'pending'"
    )
    const [completedRev] = await sequelize.query(
      "SELECT SUM(totalPrice) as total FROM orders WHERE paymentStatus = 'completed'"
    )

    const topProducts = await Product.findAll({
      order: [['totalOrders', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'totalOrders', 'recentOrders', 'price', 'image'],
    })

    const recentOrders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [{ model: User, attributes: ['name', 'email'] }],
    })

    res.json({
      stats: {
        totalOrders, pendingOrders, completedOrders,
        totalProducts, totalUsers, totalMessages, unreadMessages,
        pendingRevenue: pendingRev[0]?.total || 0,
        completedRevenue: completedRev[0]?.total || 0,
      },
      topProducts,
      recentOrders,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query
    const where = {}
    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus

    const { count, rows } = await Order.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit: Number(limit),
      include: [{ model: User, attributes: ['name', 'email'] }],
    })

    res.json({ orders: rows, total: count, pages: Math.ceil(count / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Mapped from PHP admin/placed_orders.php update_payment
const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body
    const order = await Order.findByPk(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (status) order.status = status
    if (paymentStatus) order.paymentStatus = paymentStatus
    await order.save()
    res.json(order)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const deleteOrder = async (req, res) => {
  try {
    await Order.destroy({ where: { id: req.params.id } })
    res.json({ message: 'Order deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Mapped from PHP admin/users_accounts.php
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: 'user' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Mapped from PHP users_accounts.php delete — cascades orders + cart
const deleteUser = async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } }) // cascades via associations
    res.json({ message: 'User and associated data deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({ order: [['createdAt', 'DESC']] })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const markMessageRead = async (req, res) => {
  try {
    await Message.update({ isRead: true }, { where: { id: req.params.id } })
    res.json({ message: 'Marked as read' })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// POST /api/admin/messages/:id/reply — admin replies to a message
const replyToMessage = async (req, res) => {
  try {
    const { reply } = req.body
    if (!reply?.trim()) return res.status(400).json({ message: 'Reply cannot be empty' })
    const msg = await Message.findByPk(req.params.id)
    if (!msg) return res.status(404).json({ message: 'Message not found' })
    msg.reply = reply.trim()
    msg.repliedAt = new Date()
    msg.isRead = true
    await msg.save()
    res.json(msg)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

module.exports = {
  getDashboard, getAllOrders, updateOrderStatus, deleteOrder,
  getAllUsers, deleteUser, getMessages, markMessageRead, replyToMessage,
}
