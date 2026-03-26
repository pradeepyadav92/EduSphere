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
    <div className="w-full mx-auto mt-10 flex justify-center items-start flex-col mb-10">
      <div className="flex justify-between items-center w-full mb-6">
        <Heading title="View Marks" />
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Semester:</label>
          <select
            value={selectedSemester || ""}
            onChange={handleSemesterChange}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mt-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-4 text-center border-b pb-2">Sessional 1</h2>
          {dataLoading ? (
            <p className="text-gray-500 text-center">Loading...</p>
          ) : sessional1Marks.length > 0 ? (
            <div className="space-y-4">
              {sessional1Marks.map((mark) => (
                <div key={mark._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{mark.subjectId?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mt-1">{mark.examId?.name || "Exam"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-blue-600">{mark.marksObtained}</p>
                      <p className="text-xs text-gray-500 font-medium tracking-wide">out of {mark.examId?.totalMarks || "-"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center text-sm py-8 font-medium italic">No Sessional 1 marks available.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-indigo-500">
          <h2 className="text-xl font-semibold mb-4 text-center border-b pb-2">Sessional 2</h2>
          {dataLoading ? (
            <p className="text-gray-500 text-center">Loading...</p>
          ) : sessional2Marks.length > 0 ? (
            <div className="space-y-4">
              {sessional2Marks.map((mark) => (
                <div key={mark._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{mark.subjectId?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mt-1">{mark.examId?.name || "Exam"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-indigo-600">{mark.marksObtained}</p>
                      <p className="text-xs text-gray-500 font-medium tracking-wide">out of {mark.examId?.totalMarks || "-"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center text-sm py-8 font-medium italic">No Sessional 2 marks available.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
          <h2 className="text-xl font-semibold mb-4 text-center border-b pb-2">P-U-T</h2>
          {dataLoading ? (
            <p className="text-gray-500 text-center">Loading...</p>
          ) : putMarks.length > 0 ? (
            <div className="space-y-4">
              {putMarks.map((mark) => (
                <div key={mark._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{mark.subjectId?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mt-1">{mark.examId?.name || "Exam"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-purple-600">{mark.marksObtained}</p>
                      <p className="text-xs text-gray-500 font-medium tracking-wide">out of {mark.examId?.totalMarks || "-"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center text-sm py-8 font-medium italic">No PUT marks available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewMarks;
