const studentDetails = require("../../models/details/student-details.model");
const Branch = require("../../models/branch.model");
const resetToken = require("../../models/reset-password.model");
const bcrypt = require("bcryptjs");
const ApiResponse = require("../../utils/ApiResponse");
const jwt = require("jsonwebtoken");
const sendEmail = require("../../utils/SendMail");
const { getApprovalTemplate, getRejectionTemplate } = require("../../utils/EmailTemplates");

const loginStudentController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await studentDetails.findOne({ email });

    if (!user) {
      return ApiResponse.notFound("User not found").send(res);
    }

    const userDob = new Date(user.dob);
    const day = String(userDob.getDate()).padStart(2, "0");
    const month = String(userDob.getMonth() + 1).padStart(2, "0");
    const year = userDob.getFullYear();
    const formattedDob = `${day}${month}${year}`;

    if (password !== formattedDob) {
      return ApiResponse.unauthorized("Invalid credentials").send(res);
    }

    const token = jwt.sign(
      { userId: user._id, role: "student" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return ApiResponse.success({ token }, "Login successful").send(res);
  } catch (error) {
    console.error("Login Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const getAllDetailsController = async (req, res) => {
  try {
    const users = await studentDetails
      .find()
      .select("-__v -password")
      .populate("branchId");

    if (!users || users.length === 0) {
      return ApiResponse.notFound("No Student Found").send(res);
    }

    return ApiResponse.success(users, "Student Details Found!").send(res);
  } catch (error) {
    console.error("Get Details Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const registerStudentController = async (req, res) => {
  try {
    const profile = req.file ? req.file.path : "default.png";

    const enrollmentNo = Math.floor(100000 + Math.random() * 900000);
    const email = `${enrollmentNo}@gmail.com`;

    const branch = await Branch.findById(req.body.branchId);
    if (!branch) {
      return ApiResponse.notFound("Branch not found").send(res);
    }

    const currentYear = new Date().getFullYear();
    const branchPrefix = branch.branchId.toUpperCase();
    const rollNoPrefix = `${branchPrefix}-${currentYear}-`;

    // Find the latest roll number for this branch and year
    const lastStudent = await studentDetails
      .findOne({ 
        rollNo: { $regex: `^${rollNoPrefix}` } 
      })
      .sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastStudent && lastStudent.rollNo) {
      const parts = lastStudent.rollNo.split("-");
      const lastNumStr = parts[parts.length - 1];
      const lastNumber = parseInt(lastNumStr, 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const rollNo = `${rollNoPrefix}${String(nextNumber).padStart(3, "0")}`;
    console.log(`Generated Roll No: ${rollNo} for branch ${branchPrefix}`);

    const user = await studentDetails.create({
      ...req.body,
      profile,
      password: "student123",
      email,
      enrollmentNo,
      rollNo,
    });

    const sanitizedUser = await studentDetails
      .findById(user._id)
      .select("-__v -password");

    return ApiResponse.created(sanitizedUser, "Student Details Added!").send(
      res
    );
  } catch (error) {
    console.error("Add Details Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const getMyDetailsController = async (req, res) => {
  try {
    const user = await studentDetails
      .findById(req.userId)
      .select("-password -__v")
      .populate("branchId");

    if (!user) {
      return ApiResponse.notFound("User not found").send(res);
    }

    return ApiResponse.success(user, "My Details Found!").send(res);
  } catch (error) {
    console.error("Get My Details Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const updateDetailsController = async (req, res) => {
  try {
    if (!req.params.id) {
      return ApiResponse.badRequest("Student ID is required").send(res);
    }

    const updateData = { ...req.body };
    const { email, phone, password, enrollmentNo } = updateData;

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return ApiResponse.badRequest("Invalid email format").send(res);
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return ApiResponse.badRequest("Phone number must be 10 digits").send(res);
    }

    if (password && password.length < 8) {
      return ApiResponse.badRequest(
        "Password must be at least 8 characters long"
      ).send(res);
    }

    if (phone) {
      const existingStudent = await studentDetails.findOne({
        _id: { $ne: req.params.id },
        phone: phone,
      });

      if (existingStudent) {
        return ApiResponse.conflict("Phone number already in use").send(res);
      }
    }

    if (email) {
      const existingStudent = await studentDetails.findOne({
        _id: { $ne: req.params.id },
        email: email,
      });

      if (existingStudent) {
        return ApiResponse.conflict("Email already in use").send(res);
      }
    }

    if (enrollmentNo) {
      const existingStudent = await studentDetails.findOne({
        _id: { $ne: req.params.id },
        enrollmentNo: enrollmentNo,
      });

      if (existingStudent) {
        return ApiResponse.conflict("Enrollment number already in use").send(
          res
        );
      }
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      updateData.profile = req.file.path;
    }

    if (updateData.dob) {
      updateData.dob = new Date(updateData.dob);
    }
    if (updateData.joiningDate) {
      updateData.joiningDate = new Date(updateData.joiningDate);
    }

    const updatedUser = await studentDetails
      .findByIdAndUpdate(req.params.id, updateData, { new: true })
      .select("-__v -password");

    if (!updatedUser) {
      return ApiResponse.notFound("Student not found").send(res);
    }

    return ApiResponse.success(updatedUser, "Updated Successfully!").send(res);
  } catch (error) {
    console.error("Update Details Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const deleteDetailsController = async (req, res) => {
  try {
    if (!req.params.id) {
      return ApiResponse.badRequest("Student ID is required").send(res);
    }

    const user = await studentDetails.findById(req.params.id);

    if (!user) {
      return ApiResponse.notFound("No Student Found").send(res);
    }

    await studentDetails.findByIdAndDelete(req.params.id);

    return ApiResponse.success(null, "Deleted Successfully!").send(res);
  } catch (error) {
    console.error("Delete Details Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const sendForgetPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return ApiResponse.badRequest("Email is required").send(res);
    }

    const user = await studentDetails.findOne({ email });

    if (!user) {
      return ApiResponse.notFound("No Student Found").send(res);
    }
    const resetTkn = jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    await resetToken.deleteMany({
      type: "StudentDetails",
      userId: user._id,
    });

    const resetId = await resetToken.create({
      resetToken: resetTkn,
      type: "StudentDetails",
      userId: user._id,
    });

    // Send reset email
    const subject = "Password Reset Request";
    const html = getResetPasswordTemplate("student", resetId._id);
    await sendEmail(user.email, subject, html);

    return ApiResponse.success(null, "Reset Mail Send Successful").send(res);
  } catch (error) {
    console.error("Send Reset Mail Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const updatePasswordHandler = async (req, res) => {
  try {
    const { resetId } = req.params;
    const { password } = req.body;
    if (!resetId || !password) {
      return ApiResponse.badRequest("Password and ResetId is Required").send(
        res
      );
    }

    const resetTkn = await resetToken.findById(resetId);

    if (!resetTkn) {
      return ApiResponse.notFound("No Reset Request Found").send(res);
    }

    const verifyToken = await jwt.verify(
      resetTkn.resetToken,
      process.env.JWT_SECRET
    );

    if (!verifyToken) {
      return ApiResponse.notFound("Token Expired").send(res);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await studentDetails.findByIdAndUpdate(verifyToken._id, {
      password: hashedPassword,
    });

    await resetToken.deleteMany({
      type: "StudentDetails",
      userId: verifyToken._id,
    });

    return ApiResponse.success(null, "Password Updated!").send(res);
  } catch (error) {
    console.error("Update Password Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const searchStudentsController = async (req, res) => {
  try {
    const { enrollmentNo, name, semester, branch } = req.body;
    let query = {};

    if (!enrollmentNo && !name && !semester && !branch) {
      return ApiResponse.badRequest("Select at least one filter").send(res);
    }

    if (enrollmentNo) {
      query.enrollmentNo = enrollmentNo;
    }

    if (name) {
      query.$or = [
        { firstName: { $regex: name, $options: "i" } },
        { middleName: { $regex: name, $options: "i" } },
        { lastName: { $regex: name, $options: "i" } },
      ];
    }

    if (semester) {
      query.semester = semester;
    }

    if (branch) {
      query.branchId = branch;
    }

    const students = await studentDetails
      .find(query)
      .select("-password -__v")
      .populate("branchId")
      .sort({ enrollmentNo: 1 });

    if (!students || students.length === 0) {
      return ApiResponse.notFound("No students found").send(res);
    }

    return ApiResponse.success(students, "Students found successfully").send(
      res
    );
  } catch (error) {
    console.error("Search Students Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const updateLoggedInPasswordController = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!currentPassword || !newPassword) {
      return ApiResponse.badRequest(
        "Current password and new password are required"
      ).send(res);
    }

    if (newPassword.length < 8) {
      return ApiResponse.badRequest(
        "New password must be at least 8 characters long"
      ).send(res);
    }

    const user = await studentDetails.findById(userId);
    if (!user) {
      return ApiResponse.notFound("User not found").send(res);
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return ApiResponse.unauthorized("Current password is incorrect").send(
        res
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await studentDetails.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

    return ApiResponse.success(null, "Password updated successfully").send(res);
  } catch (error) {
    console.error("Update Password Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const StudentApplication = require("../../models/details/student-application.model");

const checkStatusController = async (req, res) => {
  try {
    const { email } = req.params;
    const application = await StudentApplication.findOne({ email }).populate("branchId");
    
    if (application) {
      return ApiResponse.success({ status: application.status, branch: application.branchId?.name, remarks: application.remarks }, "Application found").send(res);
    }

    // If not in applications, check if already in live student details
    const student = await studentDetails.findOne({ email });
    if (student) {
      return ApiResponse.success({ status: "Approved", rollNo: student.rollNo }, "Student already approved").send(res);
    }

    return ApiResponse.notFound("No application or student found with this email").send(res);
  } catch (error) {
    return ApiResponse.internalServerError().send(res);
  }
};

const applyStudentController = async (req, res) => {
  try {
    const profile = req.file ? req.file.path : "default.png";
    
    // Structure emergencyContact if sent as flat fields or bracket notation
    const emergencyContact = {
      name: req.body["emergencyContact[name]"] || req.body.emergencyContactName,
      relationship: req.body["emergencyContact[relationship]"] || req.body.emergencyContactRelationship,
      phone: req.body["emergencyContact[phone]"] || req.body.emergencyContactPhone,
    };

    const studentData = { ...req.body, profile, status: "Pending", emergencyContact };
    
    // Remove the flat/bracket fields to avoid schema pollution (though Mongoose ignores them)
    delete studentData["emergencyContact[name]"];
    delete studentData["emergencyContact[relationship]"];
    delete studentData["emergencyContact[phone]"];
    delete studentData.emergencyContactName;
    delete studentData.emergencyContactRelationship;
    delete studentData.emergencyContactPhone;

    const application = await StudentApplication.create(studentData);
    return ApiResponse.created(application, "Application submitted successfully").send(res);
  } catch (error) {
    console.error("Apply Student Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const getApplicationsController = async (req, res) => {
  try {
    const applications = await StudentApplication.find({ status: "Pending" }).populate("branchId");
    return ApiResponse.success(applications, "Applications fetched").send(res);
  } catch (error) {
    return ApiResponse.internalServerError().send(res);
  }
};

const approveApplicationController = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await StudentApplication.findById(id);
    if (!application) return ApiResponse.notFound("Application not found").send(res);

    const enrollmentNo = Math.floor(100000 + Math.random() * 900000);
    
    const branch = await Branch.findById(application.branchId);
    if (!branch) return ApiResponse.notFound("Branch not found").send(res);

    const currentYear = new Date().getFullYear();
    const branchPrefix = branch.branchId.toUpperCase();
    const rollNoPrefix = `${branchPrefix}-${currentYear}-`;

    const lastStudent = await studentDetails
      .findOne({ rollNo: { $regex: `^${rollNoPrefix}` } })
      .sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastStudent && lastStudent.rollNo) {
      const parts = lastStudent.rollNo.split("-");
      const lastNumStr = parts[parts.length - 1];
      const lastNumber = parseInt(lastNumStr, 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const rollNo = `${rollNoPrefix}${String(nextNumber).padStart(3, "0")}`;

    const studentData = application.toObject();
    delete studentData._id;
    delete studentData.createdAt;
    delete studentData.updatedAt;
    delete studentData.status;
    delete studentData.__v;
    studentData.enrollmentNo = enrollmentNo;
    studentData.rollNo = rollNo;

    // Use insertMany to explicitly bypass the pre-save double-hashing
    await studentDetails.insertMany([studentData]);

    await StudentApplication.findByIdAndDelete(id);

    // Send Approval Email
    try {
      const subject = "Admission Approved - Welcome to EduSphere!";
      const html = getApprovalTemplate(
        `${application.firstName} ${application.lastName}`,
        rollNo,
        enrollmentNo
      );
      await sendEmail(application.email, subject, html);
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
    }

    return ApiResponse.success({ rollNo, enrollmentNo }, "Student Approved and Added").send(res);
  } catch (error) {
    console.error("Approve Application Error: ", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const rejectApplicationController = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await StudentApplication.findById(id);
    if (!application) return ApiResponse.notFound("Application not found").send(res);

    await StudentApplication.findByIdAndDelete(id);
    // Send Rejection Email
    try {
      const subject = "Admission Application Status";
      const html = getRejectionTemplate(
        `${application.firstName} ${application.lastName}`
      );
      await sendEmail(application.email, subject, html);
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
    }

    return ApiResponse.success(null, "Application Rejected").send(res);
  } catch (error) {
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = {
  loginStudentController,
  getAllDetailsController,
  registerStudentController,
  updateDetailsController,
  deleteDetailsController,
  getMyDetailsController,
  sendForgetPasswordEmail,
  updatePasswordHandler,
  searchStudentsController,
  updateLoggedInPasswordController,
  applyStudentController,
  checkStatusController,
  getApplicationsController,
  approveApplicationController,
  rejectApplicationController,
};
