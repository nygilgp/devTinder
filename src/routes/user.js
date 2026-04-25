const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { userAuth } = require('../middlewares/auth');

router.get('/profile', userAuth, async (req, res) => {
  const user = req.user;
  res.json(user);
});

router.patch('/profile', userAuth, async (req, res) => {
  const user = req.user;
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
    if (updateData.skills && updateData.skills.length > 10) {
      return res.status(400).json({ error: 'Too many skills provided' });
    }
    Object.keys(updateData).forEach((key) => {
      user[key] = updateData[key];
    });
    const updatedUser = await user.save();
    console.log('User updated successfully');
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.patch('/profile/password', userAuth, async (req, res) => {
  const user = req.user;
  const { currentPassword, newPassword } = req.body;
  try {
    const isMatch = await user.verifyPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    const response = await user.updatePassword(newPassword);
    if (response?.error) {
      return res.status(500).json({ error: response.error });
    }
    console.log('Password updated successfully');
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// router.post('/user', userAuth, async (req, res) => {
//   const cookie = req.cookies;
//   const isTokenValid = await jwt.verify(cookie.token, process.env.JWT_SECRET);
//   if (!isTokenValid) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const email = req.body.email;
//   await User.find({ email })
//     .then((users) => {
//       if (users.length) {
//         res.json(users);
//       } else {
//         res.status(404).json({ error: 'User not found' });
//       }
//     })
//     .catch((err) => {
//       console.error('Error fetching users:', err);
//       res.status(500).json({ error: 'Failed to fetch users' });
//     });
// });

// router.post('/feed', async (req, res) => {
//   await User.find()
//     .then((users) => {
//       if (users.length) {
//         res.json(users);
//       } else {
//         res.status(404).json({ error: 'User not found' });
//       }
//     })
//     .catch((err) => {
//       console.error('Error fetching users:', err);
//       res.status(500).json({ error: 'Failed to fetch users' });
//     });
// });

// router.delete('/user', async (req, res) => {
//   const id = req.body.userId;
//   try {
//     const user = await User.findByIdAndDelete(id);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     } else {
//       console.log('User deleted successfully');
//       res.json({ message: 'User deleted successfully' });
//     }
//   } catch (err) {
//     console.error('Error deleting user:', err);
//     res.status(500).json({ error: 'Failed to delete user' });
//   }
// });

// router.patch('/user', async (req, res) => {
//   const id = req.body.userId;
//   const updateData = req.body;
//   try {
//     const allowedUpdates = [
//       'firstName',
//       'lastName',
//       'password',
//       'age',
//       'gender',
//       'profilePicture',
//       'bio',
//       'skills',
//       'experienceLevel',
//       'location',
//     ];
//     const isValidOperation = Object.keys(updateData).every((key) =>
//       allowedUpdates.includes(key),
//     );
//     if (!isValidOperation) {
//       return res.status(400).json({ error: 'Invalid updates' });
//     }
//     // skills length should be less than 10
//     if (updateData.skills.length > 10) {
//       return res.status(400).json({ error: 'Too many skills provided' });
//     }
//     const user = await User.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     } else {
//       console.log('User updated successfully');
//       res.json({ message: 'User updated successfully', user });
//     }
//   } catch (err) {
//     console.error('Error updating user:', err);
//     res.status(500).json({ error: 'Failed to update user' });
//   }
// });

module.exports = router;
