require("dotenv").config();
const mongoose = require("mongoose");
const mongoURI = process.env.MONGODB_URI;

const connectToMongo = () => {
  return mongoose
    .connect(mongoURI, { 
      useNewUrlParser: true,
      serverSelectionTimeoutMS: 5000 
    })
    .then(() => {
      console.log("Connected to MongoDB Successfully");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB", error);
      throw error;
    });
};

module.exports = connectToMongo;
