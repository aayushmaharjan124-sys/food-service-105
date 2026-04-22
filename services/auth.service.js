const jwt = require('jsonwebtoken')
const { User } = require('../models/index')

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })

const registerUser = async ({ name, email, number, password }) => {
  const exists = await User.findOne({ where: { email } })
  const existsNum = await User.findOne({ where: { number } })
  if (exists || existsNum) throw new Error('Email or phone number already registered')

  const user = await User.create({ name, email, number, password })
  return { user: user.toSafeJSON(), token: generateToken(user.id) }
}

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } })
  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Incorrect email or password')
  }
  return { user: user.toSafeJSON(), token: generateToken(user.id) }
}

const loginAdmin = async ({ email, password }) => {
  const user = await User.findOne({ where: { email, role: 'admin' } })
  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Incorrect admin credentials')
  }
  return { user: user.toSafeJSON(), token: generateToken(user.id) }
}

module.exports = { registerUser, loginUser, loginAdmin }
