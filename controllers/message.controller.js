const { Message } = require('../models/index')

// POST /api/messages — public (mapped from PHP contact.php)
const sendMessage = async (req, res) => {
  try {
    const { name, email, number, message } = req.body
    const msg = await Message.create({
      userId: req.user?.id || null,
      name, email, number, message,
    })
    res.status(201).json({ message: 'Message sent successfully', data: msg })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// GET /api/messages/my — user gets their own messages with replies
const getMyMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { sendMessage, getMyMessages }
