const Fee = require("../../models/fee.model");

const addFeeRecord = async (req, res) => {
  try {
    const { student, year, semester, totalAmount, paidAmount, remainingAmount, status, remarks, branch, newPayment, paymentMode } = req.body;
    let record = await Fee.findOne({ student, year, semester });
    
    if (record) {
      const oldRemaining = record.remainingAmount || (record.totalAmount - record.paidAmount) || 0;
      if (newPayment && Number(newPayment) > oldRemaining) {
        return res.status(400).json({ success: false, message: "Payment amount cannot exceed remaining fees." });
      }

      if (newPayment !== undefined && newPayment !== null && Number(newPayment) !== 0) {
        record.transactions.push({ amountPaid: Number(newPayment), date: new Date(), paymentMode: paymentMode || "Cash", remarks });
      }
      record.totalAmount = totalAmount;
      record.paidAmount = paidAmount;
      record.remainingAmount = remainingAmount;
      record.status = status;
      record.branch = branch;
      await record.save();
    } else {
      if (newPayment && Number(newPayment) > (totalAmount || 0)) {
        return res.status(400).json({ success: false, message: "Payment amount cannot exceed total fees." });
      }
      record = await Fee.create({
        student, year, semester, branch,
        totalAmount, paidAmount, remainingAmount, status,
        transactions: newPayment && Number(newPayment) !== 0 ? [{ amountPaid: Number(newPayment), date: new Date(), paymentMode: paymentMode || "Cash", remarks }] : []
      });
    }

    res.status(200).json({ success: true, message: "Fee record updated", data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const records = await Fee.find({ student: studentId })
      .populate("student", "firstName lastName enrollmentNo rollNo")
      .sort({ year: -1, date: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllFees = async (req, res) => {
  try {
    const { branch, semester, status, year } = req.query;
    let query = {};
    if (branch) query.branch = branch;
    if (semester) query.semester = semester;
    if (status) query.status = status;
    if (year) query.year = Number(year);


    const records = await Fee.find(query).populate(
      "student",
      "firstName lastName enrollmentNo rollNo"
    );
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addFeeRecord,
  getStudentFees,
  getAllFees,
};
