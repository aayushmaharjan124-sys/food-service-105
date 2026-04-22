const sequelize = require('../config/db')
const User = require('./User')
const Product = require('./Product')
const Cart = require('./Cart')
const Order = require('./Order')
const Message = require('./Message')
const Review = require('./Review')
const Favorite = require('./Favorite')
const Category = require('./Category')
const ChatSession = require('./ChatSession')
const ChatMessage = require('./ChatMessage')

// Associations
User.hasMany(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' })
Cart.belongsTo(User, { foreignKey: 'userId' })

User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' })
Order.belongsTo(User, { foreignKey: 'userId' })

User.hasMany(Message, { foreignKey: 'userId', onDelete: 'SET NULL' })
Message.belongsTo(User, { foreignKey: 'userId' })

User.hasMany(Review, { foreignKey: 'userId', onDelete: 'CASCADE' })
Review.belongsTo(User, { foreignKey: 'userId' })

Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE' })
Review.belongsTo(Product, { foreignKey: 'productId' })

User.hasMany(Favorite, { foreignKey: 'userId', onDelete: 'CASCADE' })
Favorite.belongsTo(User, { foreignKey: 'userId' })

Product.hasMany(Favorite, { foreignKey: 'productId', onDelete: 'CASCADE' })
Favorite.belongsTo(Product, { foreignKey: 'productId' })

// Chat associations
User.hasMany(ChatSession, { foreignKey: 'userId', onDelete: 'CASCADE' })
ChatSession.belongsTo(User, { foreignKey: 'userId' })
ChatSession.hasMany(ChatMessage, { foreignKey: 'sessionId', onDelete: 'CASCADE' })
ChatMessage.belongsTo(ChatSession, { foreignKey: 'sessionId' })

module.exports = { sequelize, User, Product, Cart, Order, Message, Review, Favorite, Category, ChatSession, ChatMessage }
