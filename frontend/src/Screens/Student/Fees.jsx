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

  const totalPaid = feeRecords.reduce(
    (acc, curr) => acc + (Number(curr.paidAmount) || 0),
    0
  );
  const totalPending = feeRecords.reduce(
    (acc, curr) => acc + (Number(curr.remainingAmount) || 0),
    0
  );

  const allTransactions = feeRecords
    .flatMap((record) =>
      (record.transactions || []).map((transaction) => ({
        ...transaction,
        semester: record.semester,
        year: record.year,
      }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 md:px-5 md:py-6">
      <Heading title="Fee Status & History" />

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-[22px] bg-white text-sm font-medium italic text-[#8090b3] shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
          Loading your fee records...
        </div>
      ) : (
        <div className="mx-auto space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-[22px] border-l-4 border-l-[#118c88] bg-white p-7 shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#7ea8a3]">
                Total Amount Paid
              </p>
              <h2 className="text-[2rem] font-semibold tracking-[-0.03em] text-[#0f6f6d]">
                Rs {totalPaid.toLocaleString()}
              </h2>
            </div>
            <div className="rounded-[22px] border-l-4 border-l-[#21439c] bg-white p-7 shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#8ea1c7]">
                Total Amount Pending
              </p>
              <h2 className="text-[2rem] font-semibold tracking-[-0.03em] text-[#21439c]">
                Rs {totalPending.toLocaleString()}
              </h2>
            </div>
          </div>

          <div className="overflow-hidden rounded-[22px] border border-[#e1e9fc] bg-white shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
            <div className="border-b border-[#edf2ff] bg-[#f8fbff] p-6">
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#1f3f94]">
                Transaction History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#123d8f] text-xs font-bold uppercase tracking-[0.2em] text-white/90">
                  <tr>
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">Term</th>
                    <th className="px-8 py-4">Amount Paid</th>
                    <th className="px-8 py-4 text-center">Mode</th>
                    <th className="px-8 py-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf2ff]">
                  {allTransactions.map((tx, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-[#f7faff]">
                      <td className="px-8 py-5 font-medium text-[#223964]">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5 text-[#5d6f95]">
                        Sem {tx.semester} - {tx.year}
                      </td>
                      <td className="px-8 py-5 font-semibold text-[#118c88]">
                        Rs {tx.amountPaid?.toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="rounded-[10px] bg-[#eef3ff] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#5871ad]">
                          {tx.paymentMode || "Cash"}
                        </span>
                      </td>
                      <td className="max-w-xs truncate px-8 py-5 text-sm text-[#8fa1c5]">
                        {tx.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                  {allTransactions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-8 py-10 text-center font-medium text-[#8fa1c5]">
                        No payment history found.
                      </td>
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
