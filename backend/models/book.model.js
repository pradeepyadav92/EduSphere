const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1,
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1,
    },
    location: {
      type: String, // e.g. Shelf A, Row 2
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
