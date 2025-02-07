import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import crypto from 'crypto';

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
      validate: {
        // This only works on CREATE and SAVE
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
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
      type: String,
      default: 'https://www.gravatar.com/avatar/?d=mp',
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
userSchema.pre('/^find/', function (next) {
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
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

// Hash password
userSchema.pre('save', async function (next) {
  // Only run function if password was modified
  if (!this.isModified('password')) return next();

  // Hash the modified or new password
  this.password = await bcrypt.hash(this.password, 12);

  // Delete password confirm field
  this.passwordConfirm = undefined;

  next();
});

// QUERY MIDDLEWARES
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
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
