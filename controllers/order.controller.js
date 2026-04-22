const { Order } = require('../models/index')
const { placeOrder } = require('../services/order.service')

const createOrder = async (req, res) => {
  try {
    const order = await placeOrder(req.user.id, req.body)
    res.status(201).json(order)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { createOrder, getMyOrders, getOrder }
