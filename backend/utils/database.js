const mongoose = require('mongoose');

console.log("mongod",process.env.MONGO_URI )
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB with URI:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
 
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.log('MongoDB Connection Error:', err.message);
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

