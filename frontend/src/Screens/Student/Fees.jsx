import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";

const Fees = () => {
  const [feeRecords, setFeeRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const userData = useSelector((state) => state.userData);
  const userToken = localStorage.getItem("userToken");

  const fetchFees = async () => {
    if (!userData?._id) return;
    setLoading(true);
    try {
      const response = await axiosWrapper.get(`/fee/student/${userData._id}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) {
        setFeeRecords(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch fees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [userData]);

  const totalPaid = feeRecords.reduce((acc, curr) => acc + (Number(curr.paidAmount) || 0), 0);
  const totalPending = feeRecords.reduce((acc, curr) => acc + (Number(curr.remainingAmount) || 0), 0);

  const allTransactions = feeRecords.flatMap(record => 
    (record.transactions || []).map(t => ({
      ...t,
      semester: record.semester,
      year: record.year
    }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="w-full mx-auto mt-10 mb-20 px-4">
      <Heading title="Fee Status & History" />

      {loading ? (
        <div className="flex justify-center items-center h-64 italic text-gray-400">Loading your fee records...</div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-3xl border border-emerald-200 shadow-sm">
              <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2">Total Amount Paid</p>
              <h2 className="text-4xl font-black text-emerald-900">₹{totalPaid.toLocaleString()}</h2>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-8 rounded-3xl border border-rose-200 shadow-sm">
              <p className="text-rose-600 font-bold text-xs uppercase tracking-widest mb-2">Total Amount Pending</p>
              <h2 className="text-4xl font-black text-rose-900">₹{totalPending.toLocaleString()}</h2>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gray-50 border-b">
              <h3 className="font-bold text-gray-900">Transaction History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">Term</th>
                    <th className="px-8 py-4">Amount Paid</th>
                    <th className="px-8 py-4 text-center">Mode</th>
                    <th className="px-8 py-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 italic">
                  {allTransactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-8 py-5 text-gray-900 font-medium">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5 text-gray-600">Sem {tx.semester} - {tx.year}</td>
                      <td className="px-8 py-5 font-black text-emerald-600">+ ₹{tx.amountPaid?.toLocaleString()}</td>
                      <td className="px-8 py-5 text-center">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                          {tx.paymentMode || "Cash"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-gray-400 text-sm max-w-xs truncate">{tx.remarks || "-"}</td>
                    </tr>
                  ))}
                  {allTransactions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-medium">No payment history found.</td>
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

export default Fees;
