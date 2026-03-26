import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";
import CustomButton from "../../components/CustomButton";

const Fees = () => {
  const [branches, setBranches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [feeData, setFeeData] = useState({});
  const [showSearch, setShowSearch] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const userToken = localStorage.getItem("userToken");

  const fetchBranches = async () => {
    try {
      const response = await axiosWrapper.get("branch", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) setBranches(response.data.data);
    } catch (error) {
      toast.error("Failed to load branches");
    }
  };

  const searchStudents = async () => {
    setLoading(true);
    const branchName = branches.find((b) => b._id === selectedBranch)?.name;
    try {
      const [studentRes, feeRes] = await Promise.all([
        axiosWrapper.post(
          "student/search",
          { branch: selectedBranch, semester: selectedSemester },
          { headers: { Authorization: `Bearer ${userToken}` } }
        ),
        axiosWrapper.get(
          `fee/all?branch=${encodeURIComponent(branchName || "")}&semester=${selectedSemester}&year=${selectedYear}`,
          { headers: { Authorization: `Bearer ${userToken}` } }
        )
      ]);

      if (studentRes.data.success) {
        const studentsData = studentRes.data.data;
        const existingFees = feeRes.data.success ? feeRes.data.data : [];
        
        setStudents(studentsData);
        
        const initialFees = {};
        studentsData.forEach((s) => {
          const existing = existingFees.find(f => f.student?._id === s._id);
          initialFees[s._id] = {
            totalAmount: existing?.totalAmount || "",
            previouslyPaid: existing?.paidAmount || 0,
            newPayment: "",
            paidAmount: existing?.paidAmount || 0,
            remainingAmount: existing?.remainingAmount || 0,
            status: existing?.status || "Pending",
            paymentMode: "Cash",
            remarks: "",
            transactions: existing?.transactions || [],
          };
        });
        setFeeData(initialFees);
        setShowSearch(false);
      }
    } catch (error) {
      toast.error("Error searching students or fees");
    } finally {
      setLoading(false);
    }
  };

  const handleFeeChange = (studentId, field, value) => {
    const data = feeData[studentId];
    const newData = { ...data, [field]: value };
    
    const total = Number(newData.totalAmount) || 0;
    const prev = Number(newData.previouslyPaid) || 0;
    const newPay = Number(newData.newPayment) || 0;
    
    const cumulative = prev + newPay;
    const remaining = total - cumulative;
    
    newData.paidAmount = cumulative;
    newData.remainingAmount = remaining;
    newData.status = remaining <= 0 ? "Paid" : cumulative > 0 ? "Partial" : "Pending";
    
    setFeeData({
      ...feeData,
      [studentId]: newData,
    });
  };

  const handleSingleSubmit = async (studentId) => {
    const data = feeData[studentId];
    if (!data || !data.totalAmount) {
      toast.error("Please enter the total fee.");
      return;
    }

    const remaining = Number(data.totalAmount) - Number(data.previouslyPaid);
    if (Number(data.newPayment) > remaining) {
      toast.error("New payment cannot exceed the remaining fees.");
      return;
    }

    setLoading(true);
    try {
      await axiosWrapper.post(
        "fee/add",
        {
          student: studentId,
          year: Number(selectedYear),
          semester: selectedSemester,
          branch: branches.find((b) => b._id === selectedBranch)?.name,
          totalAmount: Number(data.totalAmount),
          paidAmount: Number(data.paidAmount),
          remainingAmount: Number(data.remainingAmount),
          newPayment: Number(data.newPayment) || 0,
          paymentMode: data.paymentMode || "Cash",
          status: data.status,
          remarks: data.remarks,
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      toast.success("Fee record updated successfully!");
      await searchStudents();
    } catch (error) {
      toast.error("Failed to update student fee.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    const hasInvalidPayments = Object.values(feeData).some((data) => {
      const remaining = Number(data.totalAmount) - Number(data.previouslyPaid);
      return Number(data.newPayment) > remaining;
    });

    if (hasInvalidPayments) {
      toast.error("New payment cannot exceed the remaining fees.");
      setLoading(false);
      return;
    }

    try {
      const promises = Object.entries(feeData)
        .filter(([_, data]) => data.totalAmount !== "")
        .map(([studentId, data]) =>
          axiosWrapper.post(
            "fee/add",
            {
              student: studentId,
              year: Number(selectedYear),
              totalAmount: Number(data.totalAmount),
              paidAmount: Number(data.paidAmount),
              remainingAmount: Number(data.remainingAmount),
              newPayment: Number(data.newPayment) || 0,
              paymentMode: data.paymentMode || "Cash",
              status: data.status,
              remarks: data.remarks,
              semester: selectedSemester,
              branch: branches.find((b) => b._id === selectedBranch)?.name,
            },
            { headers: { Authorization: `Bearer ${userToken}` } }
          )
        );

      await Promise.all(promises);
      toast.success("Fee records updated!");
      await searchStudents(); // Refresh data instead of dismissing the table
    } catch (error) {
      toast.error("Failed to update fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <div className="w-full mx-auto mt-10 mb-20 px-4">
      <Heading title="Fee Management" />

      {showSearch ? (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                {[2023, 2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-center">
            <CustomButton
              onClick={searchStudents}
              disabled={!selectedBranch || !selectedSemester || loading}
            >
              Search Students
            </CustomButton>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-w-[90rem] mx-auto">
          {/* Search Box */}
          <div className="p-6 bg-white border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800 text-sm tracking-widest uppercase">
              Student Ledger ({students.filter(s => `${s.firstName} ${s.lastName} ${s.enrollmentNo}`.toLowerCase().includes(searchQuery.toLowerCase())).length}/{students.length})
            </h3>
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search by name or enrollment..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-shadow shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-6 py-5">Student Info</th>
                  <th className="px-6 py-5">Total Fee</th>
                  <th className="px-6 py-5">Previously Paid</th>
                  <th className="px-6 py-5">New Payment</th>
                  <th className="px-6 py-5">Remaining</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Details</th>
                  <th className="px-6 py-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.filter(s => `${s.firstName} ${s.lastName} ${s.enrollmentNo}`.toLowerCase().includes(searchQuery.toLowerCase())).map((s) => (
                  <React.Fragment key={s._id}>
                    <tr
                      className="hover:bg-blue-50/30 transition-all duration-300"
                    >
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">
                        {s.firstName} {s.lastName}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {s.rollNo || s.enrollmentNo}
                      </p>
                      <button 
                        className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline mt-1 font-bold outline-none uppercase tracking-wider flex items-center gap-1"
                        onClick={() => setExpandedStudentId(expandedStudentId === s._id ? null : s._id)}
                      >
                        {expandedStudentId === s._id ? "Close Ledger" : "View Ledger"}
                        <svg className={`w-3 h-3 transition-transform ${expandedStudentId === s._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-semibold"
                        value={feeData[s._id]?.totalAmount}
                        onChange={(e) => handleFeeChange(s._id, "totalAmount", e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-5 text-gray-500 font-bold">
                      {feeData[s._id]?.previouslyPaid || 0}
                    </td>
                    <td className="px-6 py-5">
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-24 px-3 py-2 border border-blue-200 bg-blue-50/50 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none text-sm font-bold text-blue-700"
                        value={feeData[s._id]?.newPayment}
                        onChange={(e) => handleFeeChange(s._id, "newPayment", e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`text-sm font-black ${
                          feeData[s._id]?.remainingAmount > 0
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {feeData[s._id]?.remainingAmount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${
                          feeData[s._id]?.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : feeData[s._id]?.status === "Partial"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {feeData[s._id]?.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 space-y-2">
                      <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none text-xs font-semibold"
                        value={feeData[s._id]?.paymentMode || "Cash"}
                        onChange={(e) => handleFeeChange(s._id, "paymentMode", e.target.value)}
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Remarks..."
                        className="w-full min-w-[120px] px-3 py-2 border border-gray-200 rounded-lg outline-none text-xs italic"
                        value={feeData[s._id]?.remarks}
                        onChange={(e) => handleFeeChange(s._id, "remarks", e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => handleSingleSubmit(s._id)}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 outline-none text-white rounded-lg text-xs font-bold hover:bg-blue-700 hover:shadow-md transition-all disabled:opacity-50"
                      >
                        Submit
                      </button>
                    </td>
                    </tr>
                    {expandedStudentId === s._id && (
                      <tr className="bg-blue-50/20">
                        <td colSpan="8" className="p-0 border-b border-gray-100">
                          <div className="p-6 border-l-4 border-blue-500 shadow-inner max-w-4xl mx-auto">
                            <h4 className="font-bold text-gray-700 mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              Transaction Ledger
                            </h4>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                              <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                                  <tr>
                                    <th className="px-5 py-3 border-b max-w-[150px]">Payment Date</th>
                                    <th className="px-5 py-3 border-b">Method</th>
                                    <th className="px-5 py-3 border-b">Amount</th>
                                    <th className="px-5 py-3 border-b">Remarks</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-xs">
                                  {[...(feeData[s._id]?.transactions || [])].sort((a,b) => new Date(b.date) - new Date(a.date)).map((tx, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                      <td className="px-5 py-3 font-medium text-gray-800">{new Date(tx.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                      <td className="px-5 py-3">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border border-gray-200">
                                          {tx.paymentMode || "Cash"}
                                        </span>
                                      </td>
                                      <td className="px-5 py-3 font-bold text-emerald-600">+ ₹{tx.amountPaid?.toLocaleString()}</td>
                                      <td className="px-5 py-3 text-gray-500 italic truncate max-w-[200px]">{tx.remarks || "-"}</td>
                                    </tr>
                                  ))}
                                  {(feeData[s._id]?.transactions || []).length === 0 && (
                                    <tr>
                                      <td colSpan="4" className="px-5 py-6 text-center text-gray-400 italic font-medium">No previous transactions found on active ledger.</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 border-t bg-gray-50 flex justify-between items-center">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Adding Records for Year:{" "}
              <span className="text-blue-600">{selectedYear}</span>
            </div>
            <div className="flex gap-4">
              <CustomButton
                onClick={() => setShowSearch(true)}
                variant="secondary"
              >
                Back
              </CustomButton>
              <CustomButton onClick={handleSubmit} disabled={loading}>
                Submit Records
              </CustomButton>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Fees;
