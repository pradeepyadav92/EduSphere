import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";
import { useSelector } from "react-redux";

const ViewMarks = () => {
  const userData = useSelector((state) => state.userData);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(
    userData?.semester || 1
  );
  const [marks, setMarks] = useState([]);
  const userToken = localStorage.getItem("userToken");

  const fetchMarks = async (semester) => {
    setDataLoading(true);
    toast.loading("Loading marks...");
    try {
      const response = await axiosWrapper.get(
        `/marks/student?semester=${semester}`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      if (response.data.success) {
        setMarks(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching marks");
    } finally {
      setDataLoading(false);
      toast.dismiss();
    }
  };

  useEffect(() => {
    fetchMarks(userData?.semester || 1);
  }, []);

  const handleSemesterChange = (e) => {
    const semester = e.target.value;
    setSelectedSemester(semester);
    fetchMarks(semester);
  };

  const sessional1Marks = marks.filter((mark) => mark.examId?.examType === "sessional1");
  const sessional2Marks = marks.filter((mark) => mark.examId?.examType === "sessional2");
  const putMarks = marks.filter((mark) => mark.examId?.examType === "put");

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-3 py-4 md:px-5 md:py-6">
      <div className="mb-6 flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Heading title="View Marks" />
        <div className="flex items-center gap-4 self-start rounded-[18px] border border-[#dfe8fb] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(37,71,154,0.06)]">
          <label className="text-sm font-medium text-[#5e7096]">Semester:</label>
          <div className="relative">
            <select
              value={selectedSemester || ""}
              onChange={handleSemesterChange}
              className="appearance-none rounded-[14px] border border-[#d8e3fb] bg-[#f5f8ff] px-4 py-2 pr-10 text-sm font-semibold text-[#21439c] outline-none transition focus:border-[#b9ccf8]"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6f83b1]">
              v
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-[22px] border-l-4 border-l-[#0f8b8d] bg-white p-6 shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
          <h2 className="mb-4 border-b border-[#edf2ff] pb-3 text-center text-xl font-semibold tracking-[-0.02em] text-[#233d88]">Sessional 1</h2>
          {dataLoading ? (
            <p className="text-center text-[#8fa1c5]">Loading...</p>
          ) : sessional1Marks.length > 0 ? (
            <div className="space-y-4">
              {sessional1Marks.map((mark) => (
                <div key={mark._id} className="rounded-2xl border border-[#e6ecfc] bg-[#fbfcff] p-4 transition-shadow hover:shadow-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#24365f]">{mark.subjectId?.name || "Unknown"}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#97a6c5]">{mark.examId?.name || "Exam"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-[#21439c]">{mark.marksObtained}</p>
                      <p className="text-xs font-medium tracking-wide text-[#97a6c5]">out of {mark.examId?.totalMarks || "-"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm font-medium italic text-[#8fa1c5]">No Sessional 1 marks available.</p>
          )}
        </div>

        <div className="rounded-[22px] border-l-4 border-l-[#2e38ce] bg-white p-6 shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
          <h2 className="mb-4 border-b border-[#edf2ff] pb-3 text-center text-xl font-semibold tracking-[-0.02em] text-[#233d88]">Sessional 2</h2>
          {dataLoading ? (
            <p className="text-center text-[#8fa1c5]">Loading...</p>
          ) : sessional2Marks.length > 0 ? (
            <div className="space-y-4">
              {sessional2Marks.map((mark) => (
                <div key={mark._id} className="rounded-2xl border border-[#e6ecfc] bg-[#fbfcff] p-4 transition-shadow hover:shadow-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#24365f]">{mark.subjectId?.name || "Unknown"}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#97a6c5]">{mark.examId?.name || "Exam"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-[#2e38ce]">{mark.marksObtained}</p>
                      <p className="text-xs font-medium tracking-wide text-[#97a6c5]">out of {mark.examId?.totalMarks || "-"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm font-medium italic text-[#8fa1c5]">No Sessional 2 marks available.</p>
          )}
        </div>

        <div className="rounded-[22px] border-l-4 border-l-[#123d8f] bg-white p-6 shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
          <h2 className="mb-4 border-b border-[#edf2ff] pb-3 text-center text-xl font-semibold tracking-[-0.02em] text-[#233d88]">P-U-T</h2>
          {dataLoading ? (
            <p className="text-center text-[#8fa1c5]">Loading...</p>
          ) : putMarks.length > 0 ? (
            <div className="space-y-4">
              {putMarks.map((mark) => (
                <div key={mark._id} className="rounded-2xl border border-[#e6ecfc] bg-[#fbfcff] p-4 transition-shadow hover:shadow-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#24365f]">{mark.subjectId?.name || "Unknown"}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#97a6c5]">{mark.examId?.name || "Exam"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-[#123d8f]">{mark.marksObtained}</p>
                      <p className="text-xs font-medium tracking-wide text-[#97a6c5]">out of {mark.examId?.totalMarks || "-"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm font-medium italic text-[#8fa1c5]">No PUT marks available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewMarks;
