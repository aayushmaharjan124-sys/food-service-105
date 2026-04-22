const { Op } = require('sequelize')
const { Product } = require('../models/index')

// Mapped from PHP search.php: SELECT * FROM products WHERE name LIKE '%query%'
const searchProducts = async (query) => {
  if (!query || query.trim() === '') return []
  return Product.findAll({
    where: { name: { [Op.like]: `%${query.trim()}%` }, isAvailable: true },
    limit: 20,
  })
}

// Autocomplete — prefix match for debounced search
const autocomplete = async (query) => {
  if (!query || query.trim().length < 2) return []
  return Product.findAll({
    where: { name: { [Op.like]: `${query.trim()}%` }, isAvailable: true },
    attributes: ['id', 'name', 'category'],
    limit: 8,
  })
}

module.exports = { searchProducts, autocomplete }
