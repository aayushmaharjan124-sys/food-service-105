const router = require('express').Router()
const { protect } = require('../middlewares/auth.middleware')
const { sendMessage, getMyMessages } = require('../controllers/message.controller')

router.post('/', sendMessage)
router.get('/my', protect, getMyMessages)

module.exports = router
