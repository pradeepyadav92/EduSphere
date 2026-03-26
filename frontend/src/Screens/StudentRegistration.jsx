import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosWrapper from "../utils/AxiosWrapper"; // This might require auth? No, we will use axios directly if axiosWrapper has auth interceptors, wait!
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    semester: "",
    branchId: "",
    gender: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    bloodGroup: "",
    password: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
  });
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);

  useEffect(() => {
    // Fetch branches publicly
    const fetchBranches = async () => {
      try {
        const res = await axiosWrapper.get("/branch/public");
        if (res.data.success) {
          setBranches(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load branches", error);
        toast.error("Failed to fetch department list.");
      }
    };
    fetchBranches();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (!key.startsWith("emergencyContact")) {
          data.append(key, formData[key]);
        }
      });
      data.append("emergencyContact[name]", formData.emergencyContactName);
      data.append("emergencyContact[relationship]", formData.emergencyContactRelationship);
      data.append("emergencyContact[phone]", formData.emergencyContactPhone);
      
      if (profileFile) {
        data.append("file", profileFile);
      }

      const res = await axiosWrapper.post(
        "/student/apply",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        toast.success(
          "Application submitted! You can now use the 'Check Status' button at any time to track your approval progress.",
          { duration: 8000 }
        );
        setShowStatusCheck(true); // Switch to status check view instead of navigating away
        setStatusEmail(formData.email);
        setStatusResult({ status: "Pending", branch: branches.find(b => b._id === formData.branchId)?.name });
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const [showStatusCheck, setShowStatusCheck] = useState(false);
  const [statusEmail, setStatusEmail] = useState("");
  const [statusResult, setStatusResult] = useState(null);

  const checkStatus = async () => {
    if (!statusEmail) return toast.error("Please enter your email");
    try {
      setLoading(true);
      const res = await axiosWrapper.get(`/student/status/${statusEmail}`);
      if (res.data.success) {
        setStatusResult(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Status check failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-6 mt-16">
        {/* Status Check Quick Link */}
        <div className="max-w-4xl w-full mb-6 flex justify-end">
          <button 
            onClick={() => { setShowStatusCheck(!showStatusCheck); setStatusResult(null); }}
            className="text-blue-600 font-bold text-sm bg-blue-50 px-6 py-2 rounded-full hover:bg-blue-100 transition shadow-sm"
          >
            {showStatusCheck ? "Back to Registration" : "Already Applied? Check Status"}
          </button>
        </div>

        {showStatusCheck ? (
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center animate-fade-in-up border-t-4 border-blue-600">
             <h2 className="text-2xl font-black mb-4 text-gray-800">Check Application Status</h2>
             <p className="text-gray-500 mb-8 text-sm font-medium">Enter your registered email to see where your application stands.</p>
             <input
              type="email"
              placeholder="Enter your email"
              value={statusEmail}
              onChange={(e) => setStatusEmail(e.target.value)}
              className="px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl w-full focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition font-medium mb-6"
             />
             <button
              onClick={checkStatus}
              disabled={loading}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all mb-8 shadow-xl"
             >
              {loading ? "Checking..." : "Check Status"}
             </button>

             {statusResult && (
               <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 animate-fade-in-up">
                  <p className="text-xs uppercase font-black text-blue-600 tracking-widest mb-2">Current Status</p>
                  <div className={`text-xl font-black mb-3 ${statusResult.status === 'Approved' ? 'text-emerald-600' : 'text-orange-600'}`}>
                    {statusResult.status}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    {statusResult.status === "Approved" 
                      ? `Congratulations! Your Roll No is ${statusResult.rollNo}. You can now login.`
                      : `Your application for ${statusResult.branch} is currently being reviewed by our Admin team.`}
                  </p>
               </div>
             )}
          </div>
        ) : (
          <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center rounded-t-3xl">
              <h2 className="text-3xl font-black mb-2 tracking-tight">Student Registration</h2>
              <p className="text-blue-100 font-medium">
                Submit your application to join EduSphere. An administrator will review your profile.
              </p>
            </div>
            {/* ... form content continues below ... */}
          <form onSubmit={handleSubmit} className="p-8 lg:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Profile Picture */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center mb-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50 shadow-sm flex items-center justify-center">
                    {profilePreview ? (
                      <img
                        src={profilePreview}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-10 h-10 text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer shadow-lg hover:bg-blue-700 transition">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-3 font-semibold">
                  Upload Profile Picture
                </p>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  placeholder="M."
                  value={formData.middleName}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Secure Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="branchId"
                  required
                  value={formData.branchId}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                >
                  <option value="" disabled>Select Department</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  name="semester"
                  required
                  value={formData.semester}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                >
                  <option value="" disabled>Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                >
                  <option value="">Select Blood Group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3 mt-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest border-b pb-2 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1">Contact Name</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      placeholder="Name"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1">Relationship</label>
                    <input
                      type="text"
                      name="emergencyContactRelationship"
                      placeholder="e.g. Father"
                      value={formData.emergencyContactRelationship}
                      onChange={handleChange}
                      className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1">Phone</label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      placeholder="Phone"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="123 Education Lane"
                  value={formData.address}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="New Delhi"
                  value={formData.city}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  placeholder="Delhi"
                  value={formData.state}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  required
                  placeholder="110001"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  required
                  placeholder="India"
                  value={formData.country}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition"
                />
              </div>
            </div>

            <div className="flex justify-center border-t border-gray-100 pt-8 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 transform disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
              >
                {loading ? "Submitting Application..." : "Submit Registration Request"}
              </button>
            </div>
          </form>
        </div>
        )}
      </div>
    </div>
  );
};

export default StudentRegistration;
