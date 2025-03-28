import mongoose from 'mongoose';

const { model, models, Schema } = mongoose;

const giveawaySchema = new Schema(
  {
    title: String,
    description: String,
    image: { url: String, publicId: String },
    numVotes: { type: Number, default: 0 },
    category: {
      type: String,
      required: true,
      enum: {
        values: [
          'finance',
          'gift',
          'technology',
          'education',
          'health',
          'travel',
          'fashion',
          'beauty',
          'electronics',
          'home',
          'sports',
          'music',
          'art',
          'food',
          'other',
        ],
        message: 'Please select giveaway category',
      },
    },
    startDate: Date,
    endDate: Date,
    location: String,
    tags: [String],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isPaused: { type: Boolean, default: false },
    isEnded: { type: Boolean, default: false },
    isCancelled: { type: Boolean, default: false },
    isExpired: { type: Boolean, default: false },
    requirements: String,
    prizes: String,
    rules: String,
    isApproved: { type: Boolean, default: false },
    isRejected: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Giveaway = models.Giveaway || model('Giveaway', giveawaySchema);
export default Giveaway;
