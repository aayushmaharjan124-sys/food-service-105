const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

// Mapped from PHP `products` table: id, name, category, price, image
const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  image: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  prepTime: { type: DataTypes.INTEGER, defaultValue: 15 }, // minutes
  totalOrders: { type: DataTypes.INTEGER, defaultValue: 0 },
  recentOrders: { type: DataTypes.INTEGER, defaultValue: 0 },
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'products',
  timestamps: true,
})

// Top-selling score: (totalOrders * 0.7) + (recentOrders * 1.3)
Product.prototype.getScore = function () {
  return this.totalOrders * 0.7 + this.recentOrders * 1.3
}

module.exports = Product
