import React, { useEffect, useState } from "react";
import { getMediaSource } from "../../utils/MediaHelper";
import { FiDownload } from "react-icons/fi";
import Heading from "../../components/Heading";
import { useSelector } from "react-redux";
import axiosWrapper from "../../utils/AxiosWrapper";
import { toast } from "react-hot-toast";
import Loading from "../../components/Loading";

const Timetable = () => {
  const [timetable, setTimetable] = useState("");
  const userData = useSelector((state) => state.userData);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const getTimetable = async () => {
      try {
        setDataLoading(true);
        const response = await axiosWrapper.get(
          `/timetable?semester=${userData.semester}&branch=${userData.branchId?._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );
        if (response.data.success && response.data.data.length > 0) {
          setTimetable(response.data.data[0].link);
        } else {
          setTimetable("");
        }
      } catch (error) {
        if (error && error.response && error.response.status === 404) {
          setTimetable("");
          return;
        }
        toast.error(
          error.response?.data?.message || "Error fetching timetable"
        );
        console.error(error);
      } finally {
        setDataLoading(false);
      }
    };
    userData && getTimetable();
  }, [userData, userData.branchId, userData.semester]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-3 py-4 md:px-5 md:py-6">
      <div className="flex w-full items-center justify-between">
        <Heading title={`Timetable of Semester ${userData.semester}`} />
        {!dataLoading && timetable && (
          <button
            type="button"
            className="flex items-center gap-2 rounded-[14px] border border-[#d8e3fb] bg-white px-4 py-2.5 text-sm font-medium text-[#21439c] shadow-[0_10px_20px_rgba(37,71,154,0.06)] transition hover:bg-[#f6f9ff]"
            onClick={() => window.open(getMediaSource(timetable))}
          >
            <FiDownload />
            <span>Download</span>
          </button>
        )}
      </div>
      {dataLoading && <Loading />}
      {!dataLoading && timetable && (
        <div className="mt-8 overflow-hidden rounded-[22px] border border-[#e1e9fc] bg-white p-5 shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
          <img
            className="mx-auto w-full max-w-4xl rounded-[16px] border border-[#edf2ff]"
            src={getMediaSource(timetable)}
            alt="timetable"
          />
        </div>
      )}
      {!dataLoading && !timetable && (
        <div className="mt-8 rounded-[22px] border border-dashed border-[#d8e3fb] bg-white px-6 py-10 text-center text-sm font-medium text-[#8fa1c5] shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
          No timetable available at the moment.
        </div>
      )}
    </div>
  );
};

export default Timetable;
