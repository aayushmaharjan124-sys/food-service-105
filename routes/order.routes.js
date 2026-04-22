const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { createOrder, getMyOrders, getOrder } = require('../controllers/order.controller');

router.use(protect);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrder);

module.exports = router;
