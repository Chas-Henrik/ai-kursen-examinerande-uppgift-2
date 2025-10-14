import mongoose from 'mongoose';

// Connect to MongoDB
export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};
