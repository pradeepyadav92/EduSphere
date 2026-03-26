import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const userToken = localStorage.getItem("userToken");

  // Fetch pending applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axiosWrapper.get("/student/applications", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (res.data.success) {
        setApplications(res.data.data);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to fetch applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id, name) => {
    if (!window.confirm(`Are you sure you want to approve ${name} and generate their Roll Number?`)) return;
    try {
      const res = await axiosWrapper.post(`/student/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (res.data.success) {
        toast.success(`${name} approved! Roll No: ${res.data.data.rollNo}, Enrollment: ${res.data.data.enrollmentNo}`, { duration: 6000 });
        setApplications(applications.filter(app => app._id !== id));
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to approve student.");
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Are you sure you want to REJECT and delete ${name}'s application?`)) return;
    try {
      const res = await axiosWrapper.post(`/student/reject/${id}`, {}, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (res.data.success) {
        toast.success(`${name}'s application was rejected.`);
        setApplications(applications.filter(app => app._id !== id));
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to reject student.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col px-6 py-8 md:px-10 font-sans bg-gray-50">
      <div className="flex justify-between items-center mb-10 w-full animate-fade-in-up">
        <Heading title="Student Applications" />
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up border-t-4 border-t-purple-500">
        <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Pending Approvals</h3>
            <p className="text-sm text-gray-500 font-medium">Review self-registered students</p>
          </div>
          <div className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
            {applications.length} Pending
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-500 font-semibold animate-pulse">Loading Applications...</div>
          ) : applications.length === 0 ? (
            <div className="p-16 text-center text-gray-400 italic font-medium">No pending applications right now.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-6 py-5">Applicant</th>
                  <th className="px-6 py-5">Contact Info</th>
                  <th className="px-6 py-5">Department</th>
                  <th className="px-6 py-5">Applied On</th>
                  <th className="px-6 py-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-purple-50/30 transition-colors duration-300">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={process.env.REACT_APP_MEDIA_LINK + "/" + app.profile}
                          alt="profile"
                          className="h-10 w-10 rounded-full object-cover border border-gray-200 shadow-sm"
                          onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; }}
                        />
                        <div>
                          <p className="font-bold text-gray-900 uppercase tracking-tight text-sm">
                            {app.firstName} {app.lastName}
                          </p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                            DOB: {new Date(app.dob).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800 text-sm">{app.email}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{app.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-blue-600 text-sm">{app.branchId?.name}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">Semester {app.semester}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-700">{new Date(app.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleApprove(app._id, app.firstName)}
                          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(app._id, app.firstName)}
                          className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentApplications;
