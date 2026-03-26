require("dotenv").config();
const adminDetails = require("./models/details/admin-details.model");
const connectToMongo = require("./database/db");
const mongoose = require("mongoose");

const seedData = async () => {
  try {
    await connectToMongo();

    // Clear existing admin data
    await adminDetails.deleteMany({});

    const password = "Pradeep@9554";
    const employeeId = 123456;

    const adminDetail = {
      employeeId: employeeId,
      firstName: "Super",
      lastName: "Admin",
      email: "pradeepyadav7326@gmail.com",
      phone: "9554732600",
      profile: "default.png",
      address: "Admin Office",
      city: "City",
      state: "State",
      pincode: "123456",
      country: "India",
      gender: "male",
      dob: new Date("1990-01-01"),
      designation: "System Administrator",
      joiningDate: new Date(),
      salary: 100000,
      status: "active",
      isSuperAdmin: true,
      bloodGroup: "O+",
      emergencyContact: {
        name: "Emergency Contact",
        relationship: "Guardian",
        phone: "9111111111",
      },
      password: password,
    };

    await adminDetails.create(adminDetail);

    console.log("\n=== Admin Credentials Created on Atlas ===");
    console.log("Employee ID:", employeeId);
    console.log("Password:", password);
    console.log("Email:", adminDetail.email);
    console.log("=========================================\n");
  } catch (error) {
    console.error("Error while seeding Atlas:", error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

seedData();
