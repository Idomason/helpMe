import mongoose from 'mongoose';
import User from './userModel.js';
const { model, models, Schema } = mongoose;

const requestSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Request category is required'],
      enum: [
        'finance',
        'disaster',
        'accident',
        'agriculture',
        'medical',
        'academics',
      ],
    },
    requestDescription: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    specificDetails: {
      amount: { type: Number, required: true },
      deadline: { type: String, required: true },
    },
    image: {
      url: String,
      publicId: String,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'pending', 'completed'],
      default: 'active',
    },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        text: { type: String, required: true },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

requestSchema.virtual('totalVotes').get(function () {
  return this.votes.length / 7;
});

// Save creator's ID to the userRequests array upon creating the request document
// (this only works for creating new doc & not for updating them)
// requestSchema.pre('save', function (next) {
//   if (this.isNew) {
//     this.userRequests.push(this.user);
//   }
//   next();
// });

// populate userRequests with user data when fetching the request
// requestSchema.pre('findOne', function () {
//   this.populate({
//     path: 'userRequests',
//     select: '-password -_id',
//   });
// });

// Update the corresponding user helpRequests field with the request ID
requestSchema.pre('save', async function () {
  if (this.isNew) {
    await User.findByIdAndUpdate(this.user, {
      $push: { helpRequests: this._id },
    });
  }
});

const Request = models.Request || model('Request', requestSchema);
export default Request;
