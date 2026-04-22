const { Category, Product } = require('../models/index')

// GET /api/categories — public
const getCategories = async (req, res) => {
  try {
    const cats = await Category.findAll({ order: [['name', 'ASC']] })
    res.json(cats)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/categories — admin only
const createCategory = async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ message: 'Name is required' })
    // value is lowercase slug used in product ENUM — e.g. "Fast Food" → "fast food"
    const value = name.trim().toLowerCase()
    const exists = await Category.findOne({ where: { value } })
    if (exists) return res.status(400).json({ message: 'Category already exists' })
    const cat = await Category.create({ name: name.trim(), value })
    res.status(201).json(cat)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// PUT /api/categories/:id — admin only
const updateCategory = async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id)
    if (!cat) return res.status(404).json({ message: 'Category not found' })
    const { name } = req.body
    if (name) { cat.name = name.trim(); cat.value = name.trim().toLowerCase() }
    await cat.save()
    res.json(cat)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE /api/categories/:id — admin only
const deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id)
    if (!cat) return res.status(404).json({ message: 'Category not found' })
    await cat.destroy()
    res.json({ message: 'Category deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory }
