const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  getProfile, updateProfile, updatePassword,
  updateAddress, toggleFavorite, getFavorites,
} = require('../controllers/user.controller');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.put('/address', updateAddress);
router.get('/favorites', getFavorites);
router.post('/favorites/:productId', toggleFavorite);

module.exports = router;
