import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const userData = useSelector((state) => state.userData);
  const userToken = localStorage.getItem("userToken");

  const fetchAttendance = async () => {
    if (!userData?._id) return;
    setLoading(true);
    try {
      const response = await axiosWrapper.get(`/attendance/student/${userData._id}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) {
        setAttendance(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [userData]);

  const calculateStats = () => {
    const stats = {};
    attendance.forEach((rec) => {
      if (!stats[rec.subject]) {
        stats[rec.subject] = { present: 0, total: 0 };
      }
      stats[rec.subject].total += 1;
      if (rec.status === "Present" || rec.status === "Late") {
        stats[rec.subject].present += 1;
      }
    });

    return Object.entries(stats).map(([subject, data]) => ({
      subject,
      percentage: ((data.present / data.total) * 100).toFixed(1),
      ...data,
    }));
  };

  const stats = calculateStats();

  return (
    <div className="w-full mx-auto mt-10 mb-20 px-4">
      <Heading title="My Attendance Report" />

      {loading ? (
        <div className="flex justify-center items-center h-64 italic text-gray-400">Loading your records...</div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.subject} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-shadow">
                <div>
                  <h4 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-2">{s.subject}</h4>
                  <div className="text-3xl font-black text-gray-900">{s.percentage}%</div>
                </div>
                <div className="mt-4 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${Number(s.percentage) > 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${s.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-3 text-xs font-bold text-gray-400">
                  <span>{s.present} Present</span>
                  <span>{s.total} Total Classes</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gray-50 border-b">
              <h3 className="font-bold text-gray-900">Recent Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">Subject</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 italic">
                  {attendance.map((record) => (
                    <tr key={record._id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-8 py-5 font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-8 py-5 text-gray-600">{record.subject}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          record.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                          record.status === 'Absent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {attendance.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-8 py-10 text-center text-gray-400 font-medium">No attendance records found yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
