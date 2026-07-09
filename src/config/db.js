const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/assettrack', {
  serverSelectionTimeoutMS: 10000
  });
};

module.exports = { connectDB };
