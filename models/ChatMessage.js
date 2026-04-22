const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const ChatMessage = sequelize.define('ChatMessage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sessionId: { type: DataTypes.INTEGER, allowNull: false },
  sender: { type: DataTypes.ENUM('user', 'admin'), allowNull: false },
  senderName: { type: DataTypes.STRING(100), allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: false },
}, {
  tableName: 'chat_messages',
  timestamps: true,
})

module.exports = ChatMessage
