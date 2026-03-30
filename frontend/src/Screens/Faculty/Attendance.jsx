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

  const SelectField = ({ label, name, disabled = false, children }) => (
    <div className="space-y-2">
      <label className="ml-1 text-xs font-medium uppercase tracking-[0.16em] text-gray-500">{label}</label>
      <div className="relative">
        <select
          name={name}
          disabled={disabled}
          onChange={handleInputChange}
          className="w-full appearance-none rounded-[16px] border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 outline-none transition-all focus:border-blue-300 disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">v</span>
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 md:px-5 md:py-6">
      <Heading title="Mark Attendance" />

      {showSearch ? (
        <div className="mx-auto max-w-5xl space-y-8 rounded-[22px] border border-gray-200 bg-white p-8 shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Date</label>
              <input
                type="date"
                name="date"
                value={selectedDate}
                onChange={handleInputChange}
                className="w-full rounded-[16px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition-all focus:border-blue-300"
              />
            </div>

            <SelectField label="Semester" name="semester">
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </SelectField>

            <SelectField label="Branch" name="branch">
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </SelectField>

            <SelectField label="Subject" name="subject" disabled={!selectedBranch}>
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </SelectField>
          </div>

          <div className="flex justify-center pt-4">
            <CustomButton
              onClick={searchStudents}
              disabled={!selectedBranch || !selectedSemester || dataLoading}
              className="rounded-[16px] bg-blue-600 px-12 py-3 font-medium text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] hover:bg-blue-700"
            >
              Get Student List
            </CustomButton>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-6">
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-800">{selectedSubject?.name || "Day-wise Attendance"}</h3>
              <p className="text-sm text-gray-500">
                Semester {selectedSemester} • {selectedBranch?.name} • {new Date(selectedDate).toLocaleDateString()}
              </p>
            </div>
            <CustomButton
              onClick={() => setShowSearch(true)}
              className="rounded-[14px] border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Change Selection
            </CustomButton>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#123d8f] text-xs font-bold uppercase tracking-[0.18em] text-white/90">
                <tr>
                  <th className="px-8 py-4">Enrollment No</th>
                  <th className="px-8 py-4">Student Name</th>
                  <th className="px-8 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student._id} className="transition-colors hover:bg-blue-50/40">
                    <td className="px-8 py-5 font-medium text-gray-900">{student.rollNo || student.enrollmentNo}</td>
                    <td className="px-8 py-5 font-semibold text-gray-700">{student.firstName} {student.lastName}</td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-4">
                        {["Present", "Absent", "Late"].map((status) => (
                          <label
                            key={status}
                            className={`flex cursor-pointer items-center gap-2 rounded-[14px] border px-4 py-2 transition-all ${
                              attendanceData[student._id] === status
                                ? status === "Present"
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                  : status === "Absent"
                                  ? "border-rose-500 bg-rose-50 text-rose-700"
                                  : "border-amber-500 bg-amber-50 text-amber-700"
                                : "border-gray-200 bg-white text-gray-400 hover:border-blue-400"
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
                            <span className="text-xs font-semibold uppercase tracking-[0.12em]">{status}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center border-t border-gray-200 bg-gray-50 p-8">
            <CustomButton
              onClick={handleSubmit}
              disabled={dataLoading}
              className="rounded-[16px] bg-blue-600 px-16 py-3 font-medium text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)] hover:bg-blue-700"
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
