import mongoose from 'mongoose';

export const connectDB = async (): Promise<boolean> => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/audit-trail';
    mongoose.set('strictQuery', true);
    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB Connected: ${mongoose.connection.host}`);
    return true;
  } catch (error: any) {
    console.warn(`[Database] MongoDB Connection Warning: ${error.message}. Running with in-memory fallback store.`);
    return false;
  }
};
