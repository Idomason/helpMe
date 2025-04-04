import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import crypto from 'crypto';
import Request from './requestModel.js';

const { model, models, Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'User must have a name'],
      maxlength: [40, 'Name must have at most 40 characters'],
      minlength: [3, 'Name must have at least 3 characters'],
      // validate: [
      //   validator.isAlpha,
      //   'Name must only contain alphabets, no spacing',
      // ],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'User must have an email'],
      unique: [true, 'Email must be unique'],
      validate: [validator.isEmail, 'Please provide a valid email'],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'User must have a password'],
      minLength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      select: false,
    },
    role: {
      type: String,
      required: [true, 'User must have a role'],
      enum: {
        values: ['helper', 'helpee', 'admin'],
        message: 'Role must either be helper or helpee',
      },
      default: 'helpee',
    },
    profileImg: {
      url: {
        type: String,
        default: 'https://www.gravatar.com/avatar/?d=mp',
      },
      publicId: {
        type: String,
      },
    },
    termsConditions: {
      type: Boolean,
      required: true,
      select: false,
    },
    helpRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
      },
    ],
    helpsRendered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Render',
      },
    ],
    giveaways: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Giveaways' }],
    changedPasswordAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// DOCUMENT MIDDLEWARES

// Check if email already exist
userSchema.pre('validate', async function () {
  if (!this.isNew) return;

  const emailExists = await models.User.findOne({ email: this.email });

  if (emailExists) {
    this.invalidate('email', 'Email already in use');
  }
});

// Add giveaway array if the user is a helper
userSchema.pre('save', function (next) {
  if (this.isNew && this.role !== 'helper') {
    this.giveaways = undefined;
  }

  next();
});

// Set the time at every instance the password is changed or a new user doc is created
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

// Check if password & confirm password is correct before hashing
userSchema.pre('validate', function (next) {
  if (this.password !== this.passwordConfirm) {
    this.invalidate('passwordConfirm', 'Passwords do not match');
  }

  next();
});

// Hash password
userSchema.pre('save', async function () {
  // Only run function if password was modified
  if (!this.isModified('password')) return;

  // Hash the modified or new password
  this.password = await bcrypt.hash(this.password, 12);

  // Delete password confirm field
  this.passwordConfirm = undefined;
});

// QUERY MIDDLEWARES
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

// Populate the helpRequests field upon query
userSchema.pre('findOne', async function () {
  this.populate({ path: 'helpRequests', select: '-password -__v' });
});

// Remove all posts associated with a user before deleting the user
// userSchema.pre('remove', async function () {
//   await Request.deleteMany({ user: this._id });
// });

// Log a message after the user is deleted
// userSchema.post('remove', function (doc) {
//   console.log(`User ${doc.name} has been removed.`);
//   toast.success(`User ${doc.name} has been removed.`);
// });

// DOCUMENT METHODS
// Check for correct password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check when password was changed if ever changed
userSchema.methods.changedPasswordAfter = function (JWT_timestamp) {
  if (this.changedPasswordAt) {
    const changedTimestamp = parseInt(
      this.changedPasswordAt.getTime() / 1000,
      10,
    );

    return JWT_timestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

// Password Reset Token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = models.User || model('User', userSchema);
export default User;
