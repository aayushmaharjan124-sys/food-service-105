require('dotenv').config()
const { sequelize, User } = require('../models/index')

async function seed() {
  await sequelize.sync({ alter: true })
  console.log('Tables synced')

  const existing = await User.findOne({ where: { email: 'admin@foodservice.com' } })
  if (existing) {
    console.log('Admin already exists:', existing.email)
    process.exit(0)
  }

  await User.create({
    name: 'Admin',
    email: 'admin@foodservice.com',
    number: '9800000000',
    password: 'admin123',
    role: 'admin',
  })

  console.log('✅ Admin created: admin@foodservice.com / admin123')
  process.exit(0)
}

seed().catch((err) => { console.error(err); process.exit(1) })
