const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentDetail",
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    transactions: [
      {
        amountPaid: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        paymentMode: { type: String, enum: ["Cash", "UPI", "Card", "Cheque"], default: "Cash" },
        remarks: { type: String },
      }
    ],
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Partial"],
      default: "Pending",
    },
    semester: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fee", feeSchema);
