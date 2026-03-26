const express = require("express");
const router = express.Router();
const {
  addFeeRecord,
  getStudentFees,
  getAllFees,
} = require("../controllers/fee/fee.controller");

router.post("/add", addFeeRecord);
router.get("/student/:studentId", getStudentFees);
router.get("/all", getAllFees);

module.exports = router;
