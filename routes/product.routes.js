const router = require('express').Router()
const { protect, adminOnly } = require('../middlewares/auth.middleware')
const upload = require('../middlewares/upload.middleware')
const {
  getAllProducts, getProduct, search, getAutocomplete,
  topSelling, recommendations, createProduct, updateProduct,
  deleteProduct, addReview,
} = require('../controllers/product.controller')

// ── Static named routes MUST come before /:id ────────────────────────────────
router.get('/', getAllProducts)
router.get('/search', search)
router.get('/autocomplete', getAutocomplete)
router.get('/top-selling', topSelling)
router.get('/recommendations', protect, recommendations)

// ── Admin CRUD (also before /:id to avoid conflicts) ─────────────────────────
router.post('/', protect, adminOnly, upload.single('image'), createProduct)
router.put('/:id', protect, adminOnly, upload.single('image'), updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)

// ── Dynamic /:id routes LAST ──────────────────────────────────────────────────
router.get('/:id', getProduct)
router.post('/:id/reviews', protect, addReview)

module.exports = router
