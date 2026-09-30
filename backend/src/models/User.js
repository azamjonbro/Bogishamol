const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
 {
  username: {
   type: String,
   required: true,
   unique: true,
   trim: true,
   lowercase: true,
   minlength: 3,
   maxlength: 30,
   match: /^[a-z0-9_]+$/,
  },
  passwordHash: {
   type: String,
   required: true,
   select: false,
  },
  fullName: {
   type: String,
   trim: true,
   maxlength: 120,
  },
  role: {
   type: String,
   enum: ['admin'],
   default: 'admin',
   required: true,
  },
  isActive: {
   type: Boolean,
   default: true,
  },
 },
 { timestamps: true }
);

/**
 * Hash a plain-text password.
 */
userSchema.statics.hashPassword = function (plainPassword) {
 return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

/**
 * Verify a plain-text password against the stored hash.
 */
userSchema.methods.verifyPassword = function (plainPassword) {
 return bcrypt.compare(plainPassword, this.passwordHash);
};

/**
 * Strip sensitive fields when serializing to JSON.
 */
userSchema.methods.toJSON = function () {
 const obj = this.toObject();
 delete obj.passwordHash;
 delete obj.__v;
 return obj;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
