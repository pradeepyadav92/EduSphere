const Attendance = require("../../models/attendance.model");
const Student = require("../../models/details/student-details.model");

// Mark attendance for multiple students
const markAttendance = async (req, res) => {
  try {
    const { attendanceData } = req.body; // Array of { studentId, status, subject, semester, branch, date }

    if (!attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({ success: false, message: "Invalid attendance data" });
    }

    const records = await Attendance.insertMany(attendanceData);

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get attendance for a specific student
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const records = await Attendance.find({ student: studentId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all attendance records (Admin/Faculty filter)
const getAllAttendance = async (req, res) => {
  try {
    const { branch, semester, date } = req.query;
    let query = {};
    if (branch) query.branch = branch;
    if (semester) query.semester = semester;
    if (date) query.date = new Date(date);

    const records = await Attendance.find(query).populate("student", "firstName lastName enrollmentNo rollNo");

    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  markAttendance,
  getStudentAttendance,
  getAllAttendance,
};
