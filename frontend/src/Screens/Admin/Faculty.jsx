import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit } from "react-icons/md";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import CustomButton from "../../components/CustomButton";
import Loading from "../../components/Loading";

const initialState = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  profile: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "",
  gender: "",
  dob: "",
  designation: "",
  joiningDate: "",
  salary: "",
  status: "active",
  emergencyContact: {
    name: "",
    relationship: "",
    phone: "",
  },
  bloodGroup: "",
  branchId: "",
};

const inputClass =
  "w-full rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-blue-300 focus:bg-white";

const Faculty = () => {
  const [data, setData] = useState(initialState);
  const [branch, setBranches] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const userToken = localStorage.getItem("userToken");
  const [file, setFile] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    getFacultyHandler();
    getBranchHandler();
  }, []);

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
        toast.error(error.response?.data?.message || "Error fetching subjects");
      }
    } finally {
      setDataLoading(false);
    }
  };

  const getFacultyHandler = async () => {
    try {
      toast.loading("Loading faculty...");
      const response = await axiosWrapper.get(`/faculty`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.data.success) {
        setFaculty(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setFaculty([]);
      } else {
        toast.error(error.response?.data?.message || "Error fetching faculty");
      }
    } finally {
      toast.dismiss();
    }
  };

  const addFacultyHandler = async () => {
    try {
      toast.loading(isEditing ? "Updating Faculty" : "Adding Faculty");
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${userToken}`,
      };

      const formData = new FormData();
      for (const key in data) {
        if (key === "emergencyContact") {
          for (const subKey in data.emergencyContact) {
            formData.append(`emergencyContact[${subKey}]`, data.emergencyContact[subKey]);
          }
        } else {
          formData.append(key, data[key]);
        }
      }

      if (file) {
        formData.append("file", file);
      }

      let response;
      if (isEditing) {
        response = await axiosWrapper.patch(`/faculty/${selectedFacultyId}`, formData, { headers });
      } else {
        response = await axiosWrapper.post(`/faculty/register`, formData, { headers });
      }

      toast.dismiss();
      if (response.data.success) {
        toast.success(isEditing ? response.data.message : "Faculty created successfully! Default password: faculty123");
        resetForm();
        getFacultyHandler();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error");
    }
  };

  const deleteFacultyHandler = (id) => {
    setIsDeleteConfirmOpen(true);
    setSelectedFacultyId(id);
  };

  const editFacultyHandler = (facultyItem) => {
    setData({
      firstName: facultyItem.firstName || "",
      middleName: facultyItem.middleName || "",
      lastName: facultyItem.lastName || "",
      email: facultyItem.email || "",
      phone: facultyItem.phone || "",
      profile: facultyItem.profile || "",
      address: facultyItem.address || "",
      city: facultyItem.city || "",
      state: facultyItem.state || "",
      pincode: facultyItem.pincode || "",
      country: facultyItem.country || "",
      gender: facultyItem.gender || "",
      dob: facultyItem.dob?.split("T")[0] || "",
      designation: facultyItem.designation || "",
      joiningDate: facultyItem.joiningDate?.split("T")[0] || "",
      salary: facultyItem.salary || "",
      status: facultyItem.status || "active",
      emergencyContact: {
        name: facultyItem.emergencyContact?.name || "",
        relationship: facultyItem.emergencyContact?.relationship || "",
        phone: facultyItem.emergencyContact?.phone || "",
      },
      bloodGroup: facultyItem.bloodGroup || "",
      branchId: facultyItem.branchId?._id || facultyItem.branchId || "",
    });
    setSelectedFacultyId(facultyItem._id);
    setIsEditing(true);
    setShowAddForm(true);
  };

  const confirmDelete = async () => {
    try {
      toast.loading("Deleting Faculty");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      };
      const response = await axiosWrapper.delete(`/faculty/${selectedFacultyId}`, { headers });
      toast.dismiss();
      if (response.data.success) {
        toast.success("Faculty has been deleted successfully");
        setIsDeleteConfirmOpen(false);
        getFacultyHandler();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error");
    }
  };

  const resetForm = () => {
    setData(initialState);
    setShowAddForm(false);
    setIsEditing(false);
    setSelectedFacultyId(null);
    setFile(null);
  };

  const handleInputChange = (field, value) => {
    setData({ ...data, [field]: value });
  };

  const handleEmergencyContactChange = (field, value) => {
    setData({
      ...data,
      emergencyContact: { ...data.emergencyContact, [field]: value },
    });
  };

  return (
    <div className="w-full px-1 py-2 md:px-2">
      <div className="flex flex-col gap-4 rounded-[22px] border border-gray-200 bg-white p-5 shadow-[0_12px_30px_rgba(37,71,154,0.06)] md:flex-row md:items-center md:justify-between">
        <Heading title="Faculty Management" />
        <CustomButton
          onClick={() => {
            if (showAddForm) {
              resetForm();
            } else {
              setShowAddForm(true);
            }
          }}
          className="!rounded-[14px] !bg-blue-600 !px-4 !py-2.5 !shadow-none hover:!translate-y-0 hover:!bg-blue-700"
        >
          <IoMdAdd className="mr-2 text-lg" />
          {showAddForm ? "Close Form" : "Add Faculty"}
        </CustomButton>
      </div>

      {dataLoading && <Loading />}

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[24px] border border-gray-200 bg-white shadow-2xl">
            <button onClick={resetForm} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-[14px] bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700">
              <IoMdClose className="text-xl" />
            </button>
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-xl font-semibold text-gray-900">{isEditing ? "Edit Faculty" : "Add New Faculty"}</h2>
              <p className="mt-1 text-sm text-gray-500">All controls now match the cleaner admin workspace without changing behavior.</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addFacultyHandler();
              }}
              className="px-6 py-6"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Profile Photo</label>
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} className={inputClass} accept="image/*" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" value={data.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Middle Name</label>
                  <input type="text" value={data.middleName} onChange={(e) => handleInputChange("middleName", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" value={data.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" value={data.email} onChange={(e) => handleInputChange("email", e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Phone</label>
                  <input type="tel" value={data.phone} onChange={(e) => handleInputChange("phone", e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Gender</label>
                  <select value={data.gender} onChange={(e) => handleInputChange("gender", e.target.value)} className={inputClass} required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input type="date" value={data.dob} onChange={(e) => handleInputChange("dob", e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Blood Group</label>
                  <select value={data.bloodGroup} onChange={(e) => handleInputChange("bloodGroup", e.target.value)} className={inputClass} required>
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Designation</label>
                  <input type="text" value={data.designation} onChange={(e) => handleInputChange("designation", e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Joining Date</label>
                  <input type="date" value={data.joiningDate} onChange={(e) => handleInputChange("joiningDate", e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Salary</label>
                  <input type="number" value={data.salary} onChange={(e) => handleInputChange("salary", e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Branch</label>
                  <select value={data.branchId} onChange={(e) => handleInputChange("branchId", e.target.value)} className={inputClass} required>
                    <option value="">Select Branch</option>
                    {branch.map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Address</label>
                  <input type="text" value={data.address} onChange={(e) => handleInputChange("address", e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">City</label>
                  <input type="text" value={data.city} onChange={(e) => handleInputChange("city", e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">State</label>
                  <input type="text" value={data.state} onChange={(e) => handleInputChange("state", e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Pincode</label>
                  <input type="text" value={data.pincode} onChange={(e) => handleInputChange("pincode", e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Country</label>
                  <input type="text" value={data.country} onChange={(e) => handleInputChange("country", e.target.value)} className={inputClass} required />
                </div>
                <div className="md:col-span-2 rounded-[18px] border border-gray-200 bg-gray-50 px-4 py-4">
                  <h3 className="mb-4 text-base font-semibold text-gray-800">Emergency Contact</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Name</label>
                      <input type="text" value={data.emergencyContact.name} onChange={(e) => handleEmergencyContactChange("name", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Relationship</label>
                      <input type="text" value={data.emergencyContact.relationship} onChange={(e) => handleEmergencyContactChange("relationship", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Phone</label>
                      <input type="tel" value={data.emergencyContact.phone} onChange={(e) => handleEmergencyContactChange("phone", e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-gray-500">Default password will be <span className="font-semibold text-gray-800">faculty123</span></p>
                <div className="flex gap-3">
                  <CustomButton type="button" variant="secondary" onClick={resetForm} className="!rounded-[14px] !bg-gray-100 !px-4 !py-2.5 !text-gray-700 !shadow-none hover:!translate-y-0 hover:!bg-gray-200">Cancel</CustomButton>
                  <CustomButton type="submit" variant="primary" className="!rounded-[14px] !bg-blue-600 !px-4 !py-2.5 !shadow-none hover:!translate-y-0 hover:!bg-blue-700">{isEditing ? "Update Faculty" : "Add Faculty"}</CustomButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {!dataLoading && !showAddForm && (
        <div className="mt-5 overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-gray-800">Faculty Directory</h3>
              <p className="text-sm text-gray-500">Unified card, table, and action styling for the admin dashboard.</p>
            </div>
            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{faculty?.length || 0} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#123d8f] text-white">
                <tr>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">Name</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">Email</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">Phone</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">Employee ID</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">Designation</th>
                  <th className="px-5 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {faculty && faculty.length > 0 ? (
                  faculty.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 text-gray-700 transition hover:bg-blue-50/40">
                      <td className="px-5 py-4 font-semibold text-gray-900">{`${item.firstName} ${item.lastName}`}</td>
                      <td className="px-5 py-4">{item.email}</td>
                      <td className="px-5 py-4">{item.phone}</td>
                      <td className="px-5 py-4 font-mono text-xs text-blue-700">{item.employeeId}</td>
                      <td className="px-5 py-4">{item.designation}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <CustomButton variant="secondary" className="!rounded-[12px] !bg-slate-600 !p-2.5 !shadow-none hover:!translate-y-0" onClick={() => editFacultyHandler(item)}>
                            <MdEdit />
                          </CustomButton>
                          <CustomButton variant="danger" className="!rounded-[12px] !bg-rose-600 !p-2.5 !shadow-none hover:!translate-y-0" onClick={() => deleteFacultyHandler(item._id)}>
                            <MdOutlineDelete />
                          </CustomButton>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-14 text-center text-sm text-gray-500">No Faculty found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <DeleteConfirm isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={confirmDelete} message="Are you sure you want to delete this faculty?" />
    </div>
  );
};

export default Faculty;
