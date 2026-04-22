const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  value: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  image: { type: DataTypes.STRING(255), defaultValue: '' },
}, {
  tableName: 'categories',
  timestamps: true,
})

module.exports = Category
