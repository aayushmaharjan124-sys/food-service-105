const { User, Favorite, Product } = require('../models/index')

const getProfile = async (req, res) => {
  res.json(req.user.toSafeJSON())
}

// Mapped from PHP update_profile.php
const updateProfile = async (req, res) => {
  try {
    const { name, email, number } = req.body
    const user = await User.findByPk(req.user.id)

    if (name) user.name = name
    if (email && email !== user.email) {
      const taken = await User.findOne({ where: { email } })
      if (taken) return res.status(400).json({ message: 'Email already taken' })
      user.email = email
    }
    if (number && number !== user.number) {
      const taken = await User.findOne({ where: { number } })
      if (taken) return res.status(400).json({ message: 'Phone number already taken' })
      user.number = number
    }
    await user.save()
    res.json({ message: 'Profile updated', user: user.toSafeJSON() })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Mapped from PHP update_profile.php password section
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    const user = await User.findByPk(req.user.id)
    if (!(await user.matchPassword(oldPassword))) {
      return res.status(400).json({ message: 'Old password is incorrect' })
    }
    user.password = newPassword
    await user.save()
    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Mapped from PHP update_address.php
const updateAddress = async (req, res) => {
  try {
    const { area, city, country, pinCode } = req.body
    const user = await User.findByPk(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.addressArea = area || ''
    user.addressCity = city || ''
    user.addressCountry = country || ''
    user.addressPinCode = pinCode || ''
    await user.save()

    // Return updated address in frontend-friendly format
    res.json({
      message: 'Address saved',
      address: {
        area: user.addressArea,
        city: user.addressCity,
        country: user.addressCountry,
        pinCode: user.addressPinCode,
      },
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const toggleFavorite = async (req, res) => {
  try {
    const { productId } = req.params
    const existing = await Favorite.findOne({ where: { userId: req.user.id, productId } })
    if (existing) {
      await existing.destroy()
      res.json({ favorited: false })
    } else {
      await Favorite.create({ userId: req.user.id, productId })
      res.json({ favorited: true })
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }],
    })
    res.json(favorites.map((f) => f.Product))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getProfile, updateProfile, updatePassword, updateAddress, toggleFavorite, getFavorites }
