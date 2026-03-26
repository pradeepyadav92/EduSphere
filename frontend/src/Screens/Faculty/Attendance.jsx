import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";
import CustomButton from "../../components/CustomButton";

const Attendance = () => {
  const [branches, setBranches] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const userToken = localStorage.getItem("userToken");
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [showSearch, setShowSearch] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "branch") {
      const branch = branches.find((b) => b._id === value);
      setSelectedBranch(branch);
    } else if (name === "subject") {
      const subject = subjects.find((s) => s._id === value);
      setSelectedSubject(subject);
    } else if (name === "semester") {
      setSelectedSemester(value);
    } else if (name === "date") {
      setSelectedDate(value);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axiosWrapper.get("branch", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) {
        setBranches(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to load branches");
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axiosWrapper.get(
        `subject?branch=${selectedBranch?._id}`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      if (response.data.success) {
        setSubjects(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to load subjects");
    }
  };

  const searchStudents = async () => {
    setDataLoading(true);
    toast.loading("Fetching students...");
    try {
      const response = await axiosWrapper.post(
        "student/search",
        {
          branch: selectedBranch?._id,
          semester: selectedSemester,
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      toast.dismiss();
      if (response.data.success) {
        setStudents(response.data.data);
        const initialAttendance = {};
        response.data.data.forEach((student) => {
          initialAttendance[student._id] = "Present";
        });
        setAttendanceData(initialAttendance);
        setShowSearch(false);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("No students found for this selection");
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async () => {
    setDataLoading(true);
    toast.loading("Submitting attendance...");
    try {
      const formattedData = Object.entries(attendanceData).map(([studentId, status]) => ({
        student: studentId,
        status,
        subject: selectedSubject?.name || "General",
        semester: selectedSemester,
        branch: selectedBranch?.name,
        date: selectedDate,
      }));

      const response = await axiosWrapper.post(
        "attendance/mark",
        { attendanceData: formattedData },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      if (response.data.success) {
        toast.success("Attendance marked successfully!");
        setShowSearch(true);
      }
    } catch (error) {
      toast.error("Failed to mark attendance");
    } finally {
      toast.dismiss();
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [userToken]);

  useEffect(() => {
    if (selectedBranch) fetchSubjects();
  }, [selectedBranch]);

  return (
    <div className="w-full mx-auto mt-10 mb-20 px-4">
      <Heading title="Mark Attendance" />

      {showSearch ? (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Date</label>
              <input
                type="date"
                name="date"
                value={selectedDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Semester</label>
              <select
                name="semester"
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Branch</label>
              <select
                name="branch"
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
              <select
                name="subject"
                disabled={!selectedBranch}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-center pt-4">
            <CustomButton
              onClick={searchStudents}
              disabled={!selectedBranch || !selectedSemester || dataLoading}
              className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all transform active:scale-95"
            >
              Get Student List
            </CustomButton>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-w-6xl mx-auto">
          <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900">{selectedSubject?.name || "Day-wise Attendance"}</h3>
              <p className="text-sm text-gray-500">
                Semester {selectedSemester} • {selectedBranch?.name} • {new Date(selectedDate).toLocaleDateString()}
              </p>
            </div>
            <CustomButton
              onClick={() => setShowSearch(true)}
              className="text-sm py-2 px-4 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Change Selection
            </CustomButton>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-8 py-4">Enrollment No</th>
                  <th className="px-8 py-4">Student Name</th>
                  <th className="px-8 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 italic">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-5 font-medium text-gray-900">{student.rollNo || student.enrollmentNo}</td>
                    <td className="px-8 py-5 text-gray-700 font-bold uppercase tracking-tight">{student.firstName} {student.lastName}</td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-4">
                        {["Present", "Absent", "Late"].map((status) => (
                          <label
                            key={status}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all border ${
                              attendanceData[student._id] === status
                                ? status === "Present" 
                                  ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                                  : status === "Absent" 
                                    ? "bg-rose-50 border-rose-500 text-rose-700"
                                    : "bg-amber-50 border-amber-500 text-amber-700"
                                : "bg-white border-gray-200 text-gray-400 hover:border-blue-400"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`attendance-${student._id}`}
                              value={status}
                              checked={attendanceData[student._id] === status}
                              onChange={() => setAttendanceData({ ...attendanceData, [student._id]: status })}
                              className="hidden"
                            />
                            <span className="text-xs font-bold uppercase tracking-wide">{status}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 border-t bg-gray-50 flex justify-center">
            <CustomButton
              onClick={handleSubmit}
              disabled={dataLoading}
              className="px-16 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/30 transition-all transform active:scale-95"
            >
              Submit Attendance
            </CustomButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
