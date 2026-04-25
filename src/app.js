require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const connectDB = require('./config/db');
const User = require('./models/user');
const { userAuth } = require('./middlewares/auth');
const { validateSignupData } = require('./utils/validators');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cookieParser());

app.post('/signup', async (req, res) => {
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

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res
      .cookie('token', token, { httpOnly: true })
      .json({ message: 'User logged in successfully' });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ error: 'Failed to log in user' });
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('token').json({ message: 'User logged out successfully' });
});

app.get('/profile', userAuth, async (req, res) => {
  const user = req.user;
  res.json(user);
});

app.post('/user', userAuth, async (req, res) => {
  const cookie = req.cookies;
  const isTokenValid = await jwt.verify(cookie.token, process.env.JWT_SECRET);
  if (!isTokenValid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const email = req.body.email;
  await User.find({ email })
    .then((users) => {
      if (users.length) {
        res.json(users);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch((err) => {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Failed to fetch users' });
    });
});

app.post('/feed', async (req, res) => {
  await User.find()
    .then((users) => {
      if (users.length) {
        res.json(users);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch((err) => {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Failed to fetch users' });
    });
});

app.delete('/user', async (req, res) => {
  const id = req.body.userId;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    } else {
      console.log('User deleted successfully');
      res.json({ message: 'User deleted successfully' });
    }
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.patch('/user', async (req, res) => {
  const id = req.body.userId;
  const updateData = req.body;
  try {
    const allowedUpdates = [
      'firstName',
      'lastName',
      'password',
      'age',
      'gender',
      'profilePicture',
      'bio',
      'skills',
      'experienceLevel',
      'location',
    ];
    const isValidOperation = Object.keys(updateData).every((key) =>
      allowedUpdates.includes(key),
    );
    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }
    // skills length should be less than 10
    if (updateData.skills.length > 10) {
      return res.status(400).json({ error: 'Too many skills provided' });
    }
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    } else {
      console.log('User updated successfully');
      res.json({ message: 'User updated successfully', user });
    }
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

connectDB()
  .then(() => {
    console.log('Database connected successfully');
    // start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
