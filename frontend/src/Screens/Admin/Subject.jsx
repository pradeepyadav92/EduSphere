import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import axiosWrapper from "../../utils/AxiosWrapper";
import CustomButton from "../../components/CustomButton";
import { CgDanger } from "react-icons/cg";
import Loading from "../../components/Loading";

const Subject = () => {
  const [data, setData] = useState({
    name: "",
    code: "",
    branch: "",
    semester: "",
    assignedFaculty: "",
    credits: "",
  });
  const [subject, setSubject] = useState([]);
  const [branch, setBranches] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const userToken = localStorage.getItem("userToken");
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    getSubjectHandler();
    getBranchHandler();
    getFacultyHandler();
  }, []);

  const getSubjectHandler = async () => {
    try {
      setDataLoading(true);
      const response = await axiosWrapper.get(`/subject`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.data.success) {
        setSubject(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setSubject([]);
      } else {
        toast.error(error.response?.data?.message || "Error fetching subjects");
      }
    } finally {
      setDataLoading(false);
    }
  };

  const getBranchHandler = async () => {
    try {
      setDataLoading(true);
      const response = await axiosWrapper.get(`/branch`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.data.success) {
        setBranches(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setBranches([]);
      } else {
        toast.error(error.response?.data?.message || "Error fetching branches");
      }
    } finally {
      setDataLoading(false);
    }
  };

  const getFacultyHandler = async () => {
    try {
      const response = await axiosWrapper.get(`/faculty`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) {
        setFaculties(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching faculties", error);
    }
  };

  const addSubjectHandler = async () => {
    if (!data.name || !data.code || !data.branch || !data.semester || !data.credits) {
      toast.dismiss();
      toast.error("Please fill all the fields");
      return;
    }
    try {
      setDataLoading(true);
      toast.loading(isEditing ? "Updating Subject" : "Adding Subject");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      };
      let response;
      if (isEditing) {
        response = await axiosWrapper.patch(`/subject/${selectedSubjectId}`, data, { headers });
      } else {
        response = await axiosWrapper.post(`/subject`, data, { headers });
      }
      toast.dismiss();
      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();
        getSubjectHandler();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Unable to save subject");
    } finally {
      setDataLoading(false);
    }
  };

  const resetForm = () => {
    setData({
      name: "",
      code: "",
      branch: "",
      semester: "",
      credits: "",
      assignedFaculty: "",
    });
    setShowModal(false);
    setIsEditing(false);
    setSelectedSubjectId(null);
  };

  const deleteSubjectHandler = (id) => {
    setIsDeleteConfirmOpen(true);
    setSelectedSubjectId(id);
  };

  const editSubjectHandler = (subjectItem) => {
    setData({
      name: subjectItem.name,
      code: subjectItem.code,
      branch: subjectItem.branch?._id,
      semester: subjectItem.semester,
      credits: subjectItem.credits,
      assignedFaculty: subjectItem.assignedFaculty?._id || "",
    });
    setSelectedSubjectId(subjectItem._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDataLoading(true);
      toast.loading("Deleting Subject");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      };
      const response = await axiosWrapper.delete(`/subject/${selectedSubjectId}`, { headers });
      toast.dismiss();
      if (response.data.success) {
        toast.success("Subject has been deleted successfully");
        setIsDeleteConfirmOpen(false);
        getSubjectHandler();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Unable to delete subject");
    } finally {
      setDataLoading(false);
    }
  };

  return (
    <div className="w-full px-1 py-2 md:px-2">
      <div className="flex flex-col gap-4 rounded-[22px] border border-gray-200 bg-white p-5 shadow-[0_12px_30px_rgba(37,71,154,0.06)] md:flex-row md:items-center md:justify-between">
        <Heading title="Subject Details" />
        {branch.length > 0 && (
          <CustomButton
            onClick={() => setShowModal(true)}
            className="!rounded-[14px] !bg-blue-600 !px-4 !py-2.5 !shadow-none hover:!translate-y-0 hover:!bg-blue-700"
          >
            <IoMdAdd className="mr-2 text-lg" />
            Add Subject
          </CustomButton>
        )}
      </div>

      {dataLoading && <Loading />}

      {!dataLoading && branch.length === 0 && (
        <div className="mt-5 flex min-h-[260px] flex-col items-center justify-center rounded-[22px] border border-dashed border-amber-200 bg-amber-50/60 px-6 text-center">
          <CgDanger className="mb-4 h-14 w-14 text-amber-500" />
          <p className="text-base font-medium text-gray-700">Please add branches before adding a subject.</p>
        </div>
      )}

      {!dataLoading && branch.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-gray-800">Subject Directory</h3>
              <p className="text-sm text-gray-500">Updated spacing and table treatment for the admin workspace.</p>
            </div>
            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {subject?.length || 0} records
            </span>
          </div>

          {subject.length === 0 ? (
            <div className="px-5 py-14 text-center text-sm text-gray-500">No subjects found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#123d8f] text-white">
                  <tr>
                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">Name</th>
                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">Code</th>
                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">Branch</th>
                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">Semester</th>
                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">Faculty</th>
                    <th className="px-5 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subject.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 text-gray-700 transition hover:bg-blue-50/40">
                      <td className="px-5 py-4 font-semibold text-gray-900">{item.name}</td>
                      <td className="px-5 py-4 font-mono text-xs text-blue-700">{item.code}</td>
                      <td className="px-5 py-4">{item.branch?.name}</td>
                      <td className="px-5 py-4">Semester {item.semester}</td>
                      <td className="px-5 py-4">
                        {item.assignedFaculty ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">
                              {item.assignedFaculty.firstName} {item.assignedFaculty.lastName}
                            </span>
                            <span className="text-xs text-gray-400">{item.assignedFaculty.facultyId}</span>
                          </div>
                        ) : (
                          <span className="text-xs italic text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <CustomButton
                            variant="secondary"
                            className="!rounded-[12px] !bg-slate-600 !p-2.5 !shadow-none hover:!translate-y-0"
                            onClick={() => editSubjectHandler(item)}
                          >
                            <MdEdit />
                          </CustomButton>
                          <CustomButton
                            variant="danger"
                            className="!rounded-[12px] !bg-rose-600 !p-2.5 !shadow-none hover:!translate-y-0"
                            onClick={() => deleteSubjectHandler(item._id)}
                          >
                            <MdOutlineDelete />
                          </CustomButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? "Edit Subject" : "Add New Subject"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">Use the same cleaner admin modal structure.</p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
              >
                <AiOutlineClose size={18} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Subject Name</label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="w-full rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-blue-300 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Subject Code</label>
                  <input
                    type="text"
                    value={data.code}
                    onChange={(e) => setData({ ...data, code: e.target.value })}
                    className="w-full rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-blue-300 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Branch</label>
                  <select
                    value={data.branch}
                    onChange={(e) => setData({ ...data, branch: e.target.value })}
                    className="w-full appearance-none rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-blue-300 focus:bg-white"
                    required
                  >
                    <option value="">Select Branch</option>
                    {branch.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Semester</label>
                  <select
                    value={data.semester}
                    onChange={(e) => setData({ ...data, semester: e.target.value })}
                    className="w-full appearance-none rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-blue-300 focus:bg-white"
                    required
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Credits</label>
                  <input
                    type="number"
                    value={data.credits}
                    onChange={(e) => setData({ ...data, credits: e.target.value })}
                    className="w-full rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-blue-300 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Assign Faculty</label>
                  <select
                    value={data.assignedFaculty}
                    onChange={(e) => setData({ ...data, assignedFaculty: e.target.value })}
                    className="w-full appearance-none rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-blue-300 focus:bg-white"
                  >
                    <option value="">Select Faculty (Optional)</option>
                    {faculties.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.firstName} {item.lastName} ({item.facultyId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <CustomButton
                  onClick={resetForm}
                  variant="secondary"
                  className="!rounded-[14px] !bg-gray-100 !px-4 !py-2.5 !text-gray-700 !shadow-none hover:!translate-y-0 hover:!bg-gray-200"
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  onClick={addSubjectHandler}
                  disabled={dataLoading}
                  className="!rounded-[14px] !bg-blue-600 !px-4 !py-2.5 !shadow-none hover:!translate-y-0 hover:!bg-blue-700"
                >
                  {isEditing ? "Update Subject" : "Add Subject"}
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this subject?"
      />
    </div>
  );
};

export default Subject;
