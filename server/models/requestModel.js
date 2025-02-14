import mongoose from 'mongoose';
import User from './userModel';
const { model, models, Schema } = mongoose;

const requestSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: [true, 'Request type is required'],
      enum: ['finance', 'disaster', 'accident', 'health', 'agriculture'],
    },
    description: {
      type: String,
      required: true,
    },
    img: {
      type: String,
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
      },
    ],
    userRequest: Array,
  },
  { timestamps: true },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

requestSchema.virtual('totalVotes').get(function () {
  return this.votes / 7;
});

// model function that embeds user data who made the request
// in the userRequest array on this model
// (this only works for creating new doc & not for updating them)
requestSchema.pre('save', async function (next) {
  const userRequestPromises = this.userRequest.map(
    async (id) => await User.findById(id),
  );
  this.userRequest = await Promise.all(userRequestPromises);

  next();
});

const Request = models.Request || model('Request', requestSchema);
export default Request;
