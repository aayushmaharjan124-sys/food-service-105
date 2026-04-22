const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

// Mapped from PHP `orders` table: id, user_id, name, number, email,
// method, address, total_products, total_price, placed_on, payment_status
const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  customerName: { type: DataTypes.STRING(100), allowNull: false },
  customerEmail: { type: DataTypes.STRING(100), allowNull: false },
  customerPhone: { type: DataTypes.STRING(20), allowNull: false },
  deliveryAddress: { type: DataTypes.TEXT, allowNull: false },
  paymentMethod: { type: DataTypes.STRING(50), defaultValue: 'cash on delivery' },
  // normalized items stored as JSON (was a flat string in PHP)
  items: { type: DataTypes.JSON, allowNull: false },
  totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: {
    type: DataTypes.ENUM('placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
    defaultValue: 'placed',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed'),
    defaultValue: 'pending',
  },
  estimatedDelivery: { type: DataTypes.INTEGER, defaultValue: 30 }, // minutes
}, {
  tableName: 'orders',
  timestamps: true,
})

module.exports = Order
