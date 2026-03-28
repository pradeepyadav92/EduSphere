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
    <div className="mx-auto w-full max-w-7xl px-3 py-4 md:px-5 md:py-6">
      <Heading title="My Attendance Report" />

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-[28px] bg-white text-sm font-medium italic text-[#8090b3] shadow-[0_18px_45px_rgba(37,71,154,0.08)]">Loading your records...</div>
      ) : (
        <div className="mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.subject} className="rounded-[22px] border border-[#e1e9fc] bg-white p-6 shadow-[0_12px_30px_rgba(37,71,154,0.06)] transition-shadow hover:shadow-[0_18px_36px_rgba(37,71,154,0.09)]">
                <div>
                  <h4 className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8fa1c5]">{s.subject}</h4>
                  <div className="text-[2rem] font-semibold tracking-[-0.03em] text-[#1f3f94]">{s.percentage}%</div>
                </div>
                <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[#e9effd]">
                  <div 
                    className={`h-full transition-all duration-1000 ${Number(s.percentage) > 75 ? 'bg-[#0f7f7a]' : 'bg-[#df4f4f]'}`}
                    style={{ width: `${s.percentage}%` }}
                  ></div>
                </div>
                <div className="mt-4 flex justify-between text-[11px] font-medium uppercase tracking-[0.12em] text-[#9caccd]">
                  <span>{s.present} Present</span>
                  <span>{s.total} Total Classes</span>
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-[22px] border border-[#e1e9fc] bg-white shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
            <div className="border-b border-[#edf2ff] bg-[#f8fbff] p-6">
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#1f3f94]">Recent Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#123d8f] text-xs font-bold uppercase tracking-[0.2em] text-white/90">
                  <tr>
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">Subject</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf2ff]">
                  {attendance.map((record) => (
                    <tr key={record._id} className="transition-colors hover:bg-[#f7faff]">
                      <td className="px-8 py-5 font-semibold text-[#223964]">
                        {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-8 py-5 text-[#5d6f95]">{record.subject}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          record.status === 'Present' ? 'bg-[#dff6f4] text-[#0f7f7a]' :
                          record.status === 'Absent' ? 'bg-[#ffe5e5] text-[#d33d3d]' : 'bg-[#fff0d9] text-[#c17a1b]'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {attendance.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-8 py-10 text-center font-medium text-[#8fa1c5]">No attendance records found yet.</td>
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
