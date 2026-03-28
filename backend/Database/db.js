require("dotenv").config();
const mongoose = require("mongoose");
const mongoURI = process.env.MONGODB_URI;

const connectToMongo = () => {
  return mongoose
    .connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    })
    .then(() => {
      console.log("Connected to MongoDB Successfully");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error.message);
      // Don't throw — keep the server running so API can respond with proper errors
    });
};

module.exports = connectToMongo;
