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
        values: ['finance', 'gift', 'item'],
        message: 'Please select giveaway category',
      },
    },
    createdAt: Date.now(),
    expiresAt: Date.now(),
  },
  { timestamps: true },
);

const Giveaway = models.Giveaway || model('Giveaway', giveawaySchema);
export default Giveaway;
