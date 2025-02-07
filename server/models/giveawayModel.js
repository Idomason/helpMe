import mongoose from 'mongoose';

const { model, models, Schema } = mongoose;

const giveawaySchema = new Schema({
  title: String,
  image: String,
  numVotes: { type: Number, default: 0 },
});

const Giveaway = models.Giveaway || model('Giveaway', giveawaySchema);
export default Giveaway;
