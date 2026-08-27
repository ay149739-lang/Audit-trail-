const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/audit-trail';
  
  try {
    // Attempt standard connection with 3 sec timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected successfully to ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.warn(`[MongoDB] Standard connection to ${uri} failed: ${err.message}`);
    console.log('[MongoDB] Falling back to MongoMemoryServer for immediate zero-config execution...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create({
        instance: { dbName: 'audit-trail' }
      });
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`[MongoDB Memory Server] Connected successfully to in-memory instance at ${mongoUri}`);
    } catch (memErr) {
      console.error('[MongoDB] Failed to launch in-memory MongoDB instance:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
