const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

// Each support session belongs to one user
const ChatSession = sequelize.define('ChatSession', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM('active', 'closed'),
    defaultValue: 'active',
  },
  lastActivityAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'chat_sessions',
  timestamps: true,
})

module.exports = ChatSession
