const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, minlength: 2, index: true },
    lastName: { type: String, required: true, minlength: 2 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        const isValidEmail = validator.isEmail(value);
        if (!isValidEmail) {
          throw new Error('Invalid email format');
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        const isValidPassword = validator.isStrongPassword(value);
        if (!isValidPassword) {
          throw new Error('Invalid password format');
        }
      },
    },
    age: { type: Number, min: 18, max: 100 },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      validate(value) {
        if (!['Male', 'Female', 'Other'].includes(value)) {
          throw new Error('Gender must be Male, Female, or Other');
        }
      },
    },
    profilePicture: { type: String },
    bio: { type: String },
    skills: [{ type: String }],
    experienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    location: { type: String },
  },
  { timestamps: true },
);

userSchema.methods.getJWTToken = async function () {
  return await jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

userSchema.methods.verifyPassword = async function (passwordInputByUser) {
  return await bcrypt.compare(passwordInputByUser, this.password);
};

userSchema.methods.updatePassword = async function (newPassword) {
  await bcrypt.hash(newPassword, 10, async (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return { error: 'Failed to update password' };
    }
    this.password = hash;
    await this.save();
    return { message: 'Password updated successfully' };
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
