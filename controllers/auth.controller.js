const { registerUser, loginUser, loginAdmin } = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const result = await loginAdmin(req.body);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports = { register, login, adminLogin };
