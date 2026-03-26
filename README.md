# EduSphere - Advanced College ERP Platform

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)](https://www.mongodb.com/mern-stack)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/pradeepyadav92/EduSphere)

EduSphere is a robust, production-ready Enterprise Resource Planning (ERP) platform designed specifically for modern educational institutions. Built on the MERN stack, it provides a seamless interface for Administrators, Faculty, and Students to manage academic life effectively.

---

## 🌟 Key Features

### 🔐 Multi-Role Authentication
- Secure login for **Admins, Faculty, and Students**.
- **DOB-based Login** for secondary admins.
- Password hashing using **BcryptJS**.

### 📝 Student Self-Registration & Approval (NEW!)
- Public application portal for new students.
- Profile image upload & emergency contact tracking.
- **Admin Approval Queue:** Admins review applications and generate sequential, branch-specific Roll Numbers in one click.

### 💰 Transactional Fee Management
- Year-wise fee tracking (Total, Paid, Remaining).
- **Leger-style Transactions:** Every payment is recorded as a separate transaction with payment mode (UPI, Card, Cash).
- Real-time balance updates.

### 📊 Academic & Attendance Tracking
- **Day-wise Attendance:** Precise tracking for students.
- **3-Tier Sessional Marks:** Supports Sessional 1, Sessional 2, and PUT (Pre-University Test).
- Automated percentage and performance analytics.

### 🏢 Department & Resource Management
- **Branch Management:** Branch-specific sequential ID generation.
- **Faculty-Subject Assignment:** Link teachers to specific courses.
- **Material Repository:** Faculty can upload/manage study materials by subject and semester.
- **Timetable Management:** Dynamic schedule viewing for students.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS (Vanilla styling)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JSON Web Tokens (JWT)
- **File Handling:** Multer (Local disk storage)
- **Real-time Notifications:** Socket.io

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- Git

### Installation

1. **Clone the Repo**
   ```bash
   git clone https://github.com/pradeepyadav92/EduSphere.git
   cd EduSphere
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env with MONGODB_URI, JWT_SECRET, and PORT
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Create .env with REACT_APP_BASE_URL (http://localhost:4000/api/)
   npm start
   ```

4. **Initialize Admin**
   Run the seeder to create the master account:
   ```bash
   cd backend
   node admin-seeder.js
   # Use Email: admin@gmail.com / Password: admin123
   ```

---

## 📸 Screenshots
*(Add your screenshots here to showcase the stunning UI!)*

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Project by
**Pradeep Yadav** & Team.
Developed with precision as a comprehensive College Management Solution.
