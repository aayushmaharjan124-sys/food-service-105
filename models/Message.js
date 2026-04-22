const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, defaultValue: null },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false },
  number: { type: DataTypes.STRING(15), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  reply: { type: DataTypes.TEXT, defaultValue: null },
  repliedAt: { type: DataTypes.DATE, defaultValue: null },
}, {
  tableName: 'messages',
  timestamps: true,
})

module.exports = Message
