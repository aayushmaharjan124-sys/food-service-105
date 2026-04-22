const router = require('express').Router()
const { protect, adminOnly } = require('../middlewares/auth.middleware')
const {
  getDashboard, getAllOrders, updateOrderStatus, deleteOrder,
  getAllUsers, deleteUser, getMessages, markMessageRead, replyToMessage,
} = require('../controllers/admin.controller')

router.use(protect, adminOnly)

router.get('/dashboard', getDashboard)

router.get('/orders', getAllOrders)
router.put('/orders/:id', updateOrderStatus)
router.delete('/orders/:id', deleteOrder)

router.get('/users', getAllUsers)
router.delete('/users/:id', deleteUser)

router.get('/messages', getMessages)
router.put('/messages/:id/read', markMessageRead)
router.post('/messages/:id/reply', replyToMessage)

module.exports = router
