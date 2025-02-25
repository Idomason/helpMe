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
        default: [],
      },
    ],
    helpsRendered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'render',
        default: [],
      },
    ],
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

// =============================================================
// VIRTUAL
userSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

// CUSTOM VALIDATION - Only works when creating NEW document
// priceDistocunt: {
//   type: Number,
//   validate: {
//     validator: function(val) {
//       return val < this.price;
//     },
//     message: 'Discount price ({VALUE}) must always be lower than the actual price'
//   }
// }

// validate: {
//   // This only works on CREATE and SAVE
//   validator: function (el) {
//     return el === this.password;
//   },
//   message: 'Passwords are not the same!',
// },

// DOCUMENT MIDDLEWARES: Runs before .save() and .create() not for update
userSchema.pre('save', function (next) {
  // this.slug = slugify(this.name, {lower: true});

  next();
});

userSchema.post('save', function (doc, next) {
  console.log(doc);

  next();
});

// QUERY MIDDLEWARE
userSchema.pre(/^find/, function (next) {
  // userSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

userSchema.post('/^find/', function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  // console.log(docs);

  next();
});

// AGGREGATION MIDDLEWARE
userSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

// ======================= REAL ============================

// DOCUMENT MIDDLEWARES

// Check if email already exist
userSchema.pre('validate', async function () {
  if (!this.isNew) return;

  const emailExists = await User.findOne({ email: this.email });

  if (emailExists) {
    this.invalidate('email', 'Email already in use');
  }
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

// Post-save hook to send a welcome email
// userSchema.post('save', async function (doc) {
//   try {
//     await sendWelcomeEmail(doc.email);
//     console.log(`Welcome email sent to ${doc.email}`);
//   } catch (error) {
//     console.error(`Failed to send welcome email to ${doc.email}:`, error);
//   }
// });

// QUERY MIDDLEWARES
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

// Populate the helpRequests field upon query
userSchema.pre('findOne', async function () {
  this.populate({ path: 'helpRequests', select: '-password -_id' });
});

// Remove all posts associated with a user before deleting the user
userSchema.pre('remove', async function () {
  await Request.deleteMany({ user: this._id });
});

// Log a message after the user is deleted
userSchema.post('remove', function (doc) {
  console.log(`User ${doc.name} has been removed.`);
  toast.success(`User ${doc.name} has been removed.`);
});

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
