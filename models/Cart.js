const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

// Mapped from PHP `cart` table: id, user_id, pid, name, price, quantity, image
const Cart = sequelize.define('Cart', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  image: { type: DataTypes.STRING(255), allowNull: false },
}, {
  tableName: 'cart',
  timestamps: true,
})

module.exports = Cart
