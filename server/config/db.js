import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    if (conn) console.log(`Mongo DB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error connecting to DB: ${error.message}`);
    process.exit(1);
  }
};
