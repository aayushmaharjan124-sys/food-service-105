const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cart.controller');

router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:itemId', updateCartItem);
router.delete('/clear', clearCart);
router.delete('/:itemId', removeCartItem);

module.exports = router;
