const { Product, Review, User } = require('../models/index')
const { searchProducts, autocomplete } = require('../services/product.service')
const { getTopSelling, getRecommendations } = require('../services/order.service')
const path = require('path')
const fs = require('fs')

const getAllProducts = async (req, res) => {
  try {
    const where = { isAvailable: true }
    if (req.query.category) where.category = req.query.category
    const products = await Product.findAll({
      where,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
    })
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    const reviews = await Review.findAll({
      where: { productId: product.id },
      include: [{ model: User, attributes: ['name'] }],
    })
    res.json({ ...product.toJSON(), reviews })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const search = async (req, res) => {
  try {
    res.json(await searchProducts(req.query.q))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getAutocomplete = async (req, res) => {
  try {
    res.json(await autocomplete(req.query.q))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const topSelling = async (req, res) => {
  try {
    res.json(await getTopSelling(parseInt(req.query.limit) || 6))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const recommendations = async (req, res) => {
  try {
    res.json(await getRecommendations(req.user.id))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Mapped from PHP admin/products.php add_product
const createProduct = async (req, res) => {
  try {
    const { name, category, price, description, prepTime } = req.body
    if (!req.file) return res.status(400).json({ message: 'Product image is required' })

    const exists = await Product.findOne({ where: { name } })
    if (exists) return res.status(400).json({ message: 'Product name already exists' })

    const product = await Product.create({
      name, category, price: Number(price),
      image: req.file.filename,
      description: description || '',
      prepTime: prepTime ? Number(prepTime) : 15,
    })
    res.status(201).json(product)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Mapped from PHP admin/update_product.php
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    const { name, category, price, description, prepTime, isAvailable } = req.body
    if (name) product.name = name
    if (category) product.category = category
    if (price !== undefined) product.price = Number(price)
    if (description !== undefined) product.description = description
    if (prepTime !== undefined) product.prepTime = Number(prepTime)
    if (isAvailable !== undefined) product.isAvailable = isAvailable

    if (req.file) {
      const oldPath = path.join(__dirname, '../uploads', product.image)
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      product.image = req.file.filename
    }

    await product.save()
    res.json(product)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Mapped from PHP admin/products.php delete
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    // Delete image file if it exists (don't fail if missing)
    const imgPath = path.join(__dirname, '../uploads', product.image)
    if (fs.existsSync(imgPath)) {
      try { fs.unlinkSync(imgPath) } catch {}
    }

    await product.destroy()
    res.json({ message: 'Product deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body
    const existing = await Review.findOne({ where: { productId: req.params.id, userId: req.user.id } })
    if (existing) return res.status(400).json({ message: 'You already reviewed this product' })

    const review = await Review.create({ productId: req.params.id, userId: req.user.id, rating, comment })
    res.status(201).json(review)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

module.exports = {
  getAllProducts, getProduct, search, getAutocomplete,
  topSelling, recommendations, createProduct, updateProduct,
  deleteProduct, addReview,
}
