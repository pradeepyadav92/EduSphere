import React, { useEffect, useState } from "react";
import { MdLink } from "react-icons/md";
import Heading from "../../components/Heading";
import { useSelector } from "react-redux";
import axiosWrapper from "../../utils/AxiosWrapper";
import toast from "react-hot-toast";
import { getMediaSource } from "../../utils/MediaHelper";
import CustomButton from "../../components/CustomButton";
import Loading from "../../components/Loading";

const Material = () => {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const userData = useSelector((state) => state.userData);
  const [filters, setFilters] = useState({
    subject: "",
    type: "",
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [filters]);

  const fetchSubjects = async () => {
    try {
      setDataLoading(true);
      const response = await axiosWrapper.get(
        `/subject?semester=${userData.semester}&branch=${userData.branchId._id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      if (response.data.success) {
        setSubjects(response.data.data);
      }
    } catch (error) {
      if (error && error.response && error.response.status === 404) {
        setSubjects([]);
        return;
      }
      toast.error(error?.response?.data?.message || "Failed to load subjects");
    } finally {
      setDataLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      setDataLoading(true);
      const queryParams = new URLSearchParams({
        semester: userData.semester,
        branch: userData.branchId._id,
      });

      if (filters.subject) queryParams.append("subject", filters.subject);
      if (filters.type) queryParams.append("type", filters.type);

      const response = await axiosWrapper.get(`/material?${queryParams}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (response.data.success) {
        setMaterials(response.data.data);
      }
    } catch (error) {
      if (error && error.response && error.response.status === 404) {
        setMaterials([]);
        return;
      }
      toast.error(error?.response?.data?.message || "Failed to load materials");
    } finally {
      setDataLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-3 py-4 md:px-5 md:py-6">
      <Heading title="Study Materials" />

      {!dataLoading && (
        <div className="mt-4 w-full rounded-[22px] border border-[#dfe8fb] bg-white p-5 shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#95a3c4]">
                Filter by Subject
              </label>
              <div className="relative">
                <select
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  className="w-full appearance-none rounded-[16px] border border-[#d8e3fb] bg-[#f5f8ff] px-4 py-3 pr-10 text-sm font-medium text-[#21439c] outline-none transition focus:border-[#b9ccf8]"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6f83b1]">
                  v
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#95a3c4]">
                Filter by Type
              </label>
              <div className="relative">
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full appearance-none rounded-[16px] border border-[#d8e3fb] bg-[#f5f8ff] px-4 py-3 pr-10 text-sm font-medium text-[#21439c] outline-none transition focus:border-[#b9ccf8]"
                >
                  <option value="">All Types</option>
                  <option value="notes">Notes</option>
                  <option value="assignment">Assignment</option>
                  <option value="syllabus">Syllabus</option>
                  <option value="other">Other</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6f83b1]">
                  v
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {dataLoading && <Loading />}

      {!dataLoading && (
        <div className="mt-8 w-full overflow-hidden rounded-[22px] border border-[#e1e9fc] bg-white shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#123d8f] text-white">
                <th className="py-4 px-6 text-left font-semibold">File</th>
                <th className="py-4 px-6 text-left font-semibold">Title</th>
                <th className="py-4 px-6 text-left font-semibold">Subject</th>
                <th className="py-4 px-6 text-left font-semibold">Type</th>
              </tr>
            </thead>
            <tbody>
              {materials && materials.length > 0 ? (
                materials.map((material) => (
                  <tr key={material._id} className="border-b border-[#edf2ff] hover:bg-[#f7faff]">
                    <td className="py-4 px-6">
                      <CustomButton
                        variant="primary"
                        className="rounded-[14px] bg-[#21439c] px-4 py-2 shadow-[0_10px_20px_rgba(33,67,156,0.16)] hover:bg-[#18357f]"
                        onClick={() => {
                          window.open(getMediaSource(material.file));
                        }}
                      >
                        <MdLink className="text-xl" />
                      </CustomButton>
                    </td>
                    <td className="py-4 px-6">{material.title}</td>
                    <td className="py-4 px-6">{material.subject.name}</td>
                    <td className="py-4 px-6 capitalize">{material.type}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="pt-10 pb-10 text-center text-base text-[#8fa1c5]">
                    No materials found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Material;
