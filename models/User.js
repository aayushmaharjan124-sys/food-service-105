const { DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')
const sequelize = require('../config/db')

// Mapped from PHP `users` table: id, name, email, number, password, address
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  number: { type: DataTypes.STRING(15), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  // address split into fields (was a single string in PHP)
  addressArea: { type: DataTypes.STRING(100), defaultValue: '' },
  addressCity: { type: DataTypes.STRING(100), defaultValue: '' },
  addressCountry: { type: DataTypes.STRING(100), defaultValue: '' },
  addressPinCode: { type: DataTypes.STRING(20), defaultValue: '' },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12)
      }
    },
  },
})

User.prototype.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password)
}

User.prototype.toSafeJSON = function () {
  const data = this.toJSON()
  delete data.password
  // Normalize address to frontend-expected format
  data.address = {
    area: data.addressArea || '',
    city: data.addressCity || '',
    country: data.addressCountry || '',
    pinCode: data.addressPinCode || '',
  }
  return data
}

module.exports = User
