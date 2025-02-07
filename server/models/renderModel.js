import mongoose from 'mongoose';
const { model, models, Schema } = mongoose;

const renderSchema = new Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    text: { type: String },
    img: { type: String },
    votes: [{ types: mongoose.Schema.ObjectId, ref: 'User' }],
    comments: [
      {
        text: { type: String, required: true },
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

const Render = models.Render || model('Render', renderSchema);
export default Render;
