const express = require('express');
const authRouter = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { validateSignupData } = require('../utils/validators');

authRouter.post('/signup', async (req, res) => {
  const { errors, valid } = validateSignupData(req.body);
  if (!valid) {
    return res.status(400).json({ errors });
  }
  const { password, ...userData } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  userData.password = hashedPassword;
  const user = new User(userData);
  await user
    .save()
    .then(() => {
      console.log('User created successfully');
      res.status(201).json({ message: 'User created successfully' });
    })
    .catch((err) => {
      console.error('Error creating user:', err);
      res.status(500).json({ error: 'Failed to create user' });
    });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await user.verifyPassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = await user.getJWTToken();

    res
      .cookie('token', token, { httpOnly: true })
      .json({ message: 'User logged in successfully' });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ error: 'Failed to log in user' });
  }
});

authRouter.get('/logout', (req, res) => {
  res.clearCookie('token').json({ message: 'User logged out successfully' });
});

module.exports = authRouter;
