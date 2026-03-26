const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getStudentAttendance,
  getAllAttendance,
} = require("../controllers/attendance/attendance.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/mark", auth, markAttendance);
router.get("/student/:studentId", auth, getStudentAttendance);
router.get("/all", auth, getAllAttendance);

module.exports = router;
