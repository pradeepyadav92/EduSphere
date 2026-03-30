/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FiUpload, FiEdit2, FiTrash2 } from "react-icons/fi";
import Heading from "../../components/Heading";
import { AiOutlineClose } from "react-icons/ai";
import toast from "react-hot-toast";
import { getMediaSource } from "../../utils/MediaHelper";
import axiosWrapper from "../../utils/AxiosWrapper";
import DeleteConfirm from "../../components/DeleteConfirm";
import CustomButton from "../../components/CustomButton";
import { MdLink } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
const Material = () => {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    semester: "",
    branch: "",
    type: "notes",
  });
  const [file, setFile] = useState(null);
  const [filters, setFilters] = useState({
    subject: "",
    semester: "",
    branch: "",
    type: "",
  });

  useEffect(() => {
    fetchSubjects();
    fetchBranches();
    fetchMaterials();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [filters]);

  const fetchSubjects = async () => {
    try {
      toast.loading("Loading subjects...");
      const response = await axiosWrapper.get("subject", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (response.data.success) {
        setSubjects(response.data.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setSubjects([]);
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to load subjects"
        );
      }
    } finally {
      toast.dismiss();
    }
  };

  const fetchBranches = async () => {
    try {
      toast.loading("Loading branches...");
      const response = await axiosWrapper.get("branch", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (response.data.success) {
        setBranches(response.data.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setBranches([]);
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to load branches"
        );
      }
    } finally {
      toast.dismiss();
    }
  };

  const fetchMaterials = async () => {
    try {
      toast.loading("Loading materials...");
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axiosWrapper.get(`material?${queryParams}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (response.data.success) {
        setMaterials(response.data.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setMaterials([]);
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to load materials"
        );
      }
    } finally {
      toast.dismiss();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subject: "",
      semester: "",
      branch: "",
      type: "notes",
    });
    setFile(null);
    setEditingMaterial(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDataLoading(true);
    toast.loading(
      editingMaterial ? "Updating material..." : "Adding material..."
    );

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });
      if (file) {
        formDataToSend.append("file", file);
      }

      if (editingMaterial) {
        await axiosWrapper.put(
          `material/${editingMaterial._id}`,
          formDataToSend
        );
        toast.success("Material updated successfully");
      } else {
        await axiosWrapper.post("material", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        });
        toast.success("Material added successfully");
      }

      setShowModal(false);
      resetForm();
      fetchMaterials();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Operation failed");
    } finally {
      setDataLoading(false);
      toast.dismiss();
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      subject: material.subject._id,
      semester: material.semester,
      branch: material.branch._id,
      type: material.type,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await axiosWrapper.delete(`material/${selectedMaterialId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      toast.success("Material deleted successfully");
      setIsDeleteConfirmOpen(false);
      fetchMaterials();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete material"
      );
    }
  };

  const SelectBox = ({ name, value, onChange, children }) => (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-[16px] border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 outline-none focus:border-blue-300"
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">v</span>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-3 py-4 md:px-5 md:py-6">
      <div className="flex w-full items-center justify-between">
        <Heading title="Material Management" />
        <CustomButton onClick={() => setShowModal(true)} className="rounded-[14px] bg-blue-600 px-4 py-2.5 font-medium text-white shadow-[0_10px_20px_rgba(37,99,235,0.18)] hover:bg-blue-700">
          <IoMdAdd className="text-2xl" />
        </CustomButton>
      </div>

      <div className="mt-4 w-full rounded-[22px] border border-gray-200 bg-white p-5 shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Filter by Subject</label>
            <SelectBox name="subject" value={filters.subject} onChange={handleFilterChange}>
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>{subject.name}</option>
              ))}
            </SelectBox>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Filter by Branch</label>
            <SelectBox name="branch" value={filters.branch} onChange={handleFilterChange}>
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>{branch.name}</option>
              ))}
            </SelectBox>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Filter by Semester</label>
            <SelectBox name="semester" value={filters.semester} onChange={handleFilterChange}>
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </SelectBox>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Filter by Type</label>
            <SelectBox name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="notes">Notes</option>
              <option value="assignment">Assignment</option>
              <option value="syllabus">Syllabus</option>
              <option value="other">Other</option>
            </SelectBox>
          </div>
        </div>
      </div>

      <div className="mt-8 w-full overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
        {materials.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No materials found</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#123d8f] text-white">
                <th className="px-6 py-4 text-left font-semibold">File</th>
                <th className="px-6 py-4 text-left font-semibold">Title</th>
                <th className="px-6 py-4 text-left font-semibold">Subject</th>
                <th className="px-6 py-4 text-left font-semibold">Semester</th>
                <th className="px-6 py-4 text-left font-semibold">Branch</th>
                <th className="px-6 py-4 text-left font-semibold">Type</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material._id} className="border-b border-gray-100 hover:bg-blue-50/40">
                  <td className="px-6 py-4">
                    <CustomButton
                      variant="primary"
                      className="rounded-[14px] bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                      onClick={() => {
                        window.open(getMediaSource(material.file));
                      }}
                    >
                      <MdLink className="text-xl" />
                    </CustomButton>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{material.title}</td>
                  <td className="px-6 py-4 text-gray-700">{material.subject.name}</td>
                  <td className="px-6 py-4 text-gray-700">{material.semester}</td>
                  <td className="px-6 py-4 text-gray-700">{material.branch.name}</td>
                  <td className="px-6 py-4 capitalize text-gray-700">{material.type}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <CustomButton
                        variant="secondary"
                        className="rounded-[14px] border border-gray-200 bg-white px-4 py-2 text-gray-600 hover:bg-gray-50"
                        onClick={() => handleEdit(material)}
                      >
                        <FiEdit2 />
                      </CustomButton>
                      <CustomButton
                        variant="danger"
                        className="rounded-[14px] bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                        onClick={() => {
                          setSelectedMaterialId(material._id);
                          setIsDeleteConfirmOpen(true);
                        }}
                      >
                        <FiTrash2 />
                      </CustomButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-[22px] bg-white p-6 shadow-[0_30px_70px_rgba(15,23,42,0.18)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingMaterial ? "Edit Material" : "Add New Material"}
              </h2>
              <CustomButton
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                variant="secondary"
                className="rounded-[14px] border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600 hover:bg-gray-100"
              >
                <AiOutlineClose size={24} />
              </CustomButton>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded-[16px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Subject</label>
                  <SelectBox name="subject" value={formData.subject} onChange={handleInputChange}>
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>{subject.name}</option>
                    ))}
                  </SelectBox>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Branch</label>
                  <SelectBox name="branch" value={formData.branch} onChange={handleInputChange}>
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>{branch.name}</option>
                    ))}
                  </SelectBox>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Semester</label>
                  <SelectBox name="semester" value={formData.semester} onChange={handleInputChange}>
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </SelectBox>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Type</label>
                  <SelectBox name="type" value={formData.type} onChange={handleInputChange}>
                    <option value="notes">Notes</option>
                    <option value="assignment">Assignment</option>
                    <option value="syllabus">Syllabus</option>
                    <option value="other">Other</option>
                  </SelectBox>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-gray-500">Material File</label>
                <div className="flex items-center space-x-4">
                  <label className="flex-1 cursor-pointer rounded-[16px] border border-gray-200 bg-gray-50 px-4 py-3 hover:bg-gray-100">
                    <span className="flex items-center justify-center text-sm text-gray-700">
                      <FiUpload className="mr-2" />
                      {file ? file.name : "Choose File"}
                    </span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      required={!editingMaterial}
                    />
                  </label>
                  {file && (
                    <CustomButton
                      onClick={() => setFile(null)}
                      variant="danger"
                      className="rounded-[14px] bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                    >
                      <AiOutlineClose size={20} />
                    </CustomButton>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <CustomButton
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  variant="secondary"
                  className="rounded-[14px] border border-gray-200 bg-white px-5 py-2.5 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  type="submit"
                  disabled={dataLoading}
                  className="rounded-[14px] bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
                >
                  {dataLoading
                    ? "Processing..."
                    : editingMaterial
                    ? "Update Material"
                    : "Add Material"}
                </CustomButton>
              </div>
            </form>
          </div>
        </div>
      )}
      <DeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this material? This action cannot be undone."
      />
    </div>
  );
};

export default Material;
