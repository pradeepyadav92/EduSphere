import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit } from "react-icons/md";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { RxDashboard } from "react-icons/rx";
import { getMediaSource } from "../../utils/MediaHelper";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import axiosWrapper from "../../utils/AxiosWrapper";
import CustomButton from "../../components/CustomButton";
import NoData from "../../components/NoData";
import { CgDanger } from "react-icons/cg";
import { getMediaSource } from "../../utils/MediaHelper";

const Student = () => {
  const [searchParams, setSearchParams] = useState({
    enrollmentNo: "",
    name: "",
    semester: "",
    branch: "",
  });
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const userToken = localStorage.getItem("userToken");

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    semester: "",
    branchId: "",
    gender: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    profile: "",
    status: "active",
    bloodGroup: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
    email: "", 
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    getBranchHandler();
  }, []);

  const getBranchHandler = async () => {
    try {
      toast.loading("Loading branches...");
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
        console.error(error);
        toast.error(error.response?.data?.message || "Error fetching branches");
      }
    } finally {
      toast.dismiss();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const searchStudents = async (e) => {
    e.preventDefault();

    if (
      !searchParams.enrollmentNo &&
      !searchParams.name &&
      !searchParams.semester &&
      !searchParams.branch
    ) {
      toast.error("Please select at least one filter");
      return;
    }

    setDataLoading(true);
    setHasSearched(true);
    toast.loading("Searching students...");
    try {
      const response = await axiosWrapper.post(
        `/student/search`,
        searchParams,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      toast.dismiss();
      if (response.data.success) {
        if (response.data.data.length === 0) {
          setStudents([]);
        } else {
          toast.success("Students found!");
          setStudents(response.data.data);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      setStudents([]);
      toast.error(error.response?.data?.message || "Error searching students");
    } finally {
      setDataLoading(false);
    }
  };

  const handleFormInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmergencyContactChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      },
    }));
  };

  const addStudentHandler = async () => {
    try {
      toast.loading(isEditing ? "Updating Student" : "Adding Student");
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${userToken}`,
      };

      const formDataToSend = new FormData();
      for (const key in formData) {
        if (key === "emergencyContact") {
          for (const subKey in formData.emergencyContact) {
            formDataToSend.append(
              `emergencyContact[${subKey}]`,
              formData.emergencyContact[subKey]
            );
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }

      if (file) {
        formDataToSend.append("file", file);
      }

      let response;
      if (isEditing) {
        response = await axiosWrapper.patch(
          `/student/${selectedStudentId}`,
          formDataToSend,
          {
            headers,
          }
        );
      } else {
        response = await axiosWrapper.post(
          `/student/register`,
          formDataToSend,
          {
            headers,
          }
        );
      }

      toast.dismiss();
      if (response.data.success) {
        if (!isEditing) {
          toast.success(
            `Student created successfully! Default password: student123`
          );
        } else {
          toast.success(response.data.message);
        }
        resetForm();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error");
    }
  };

  const deleteStudentHandler = (id) => {
    setIsDeleteConfirmOpen(true);
    setSelectedStudentId(id);
  };

  const editStudentHandler = (student) => {
    setFormData({
      firstName: student.firstName || "",
      middleName: student.middleName || "",
      lastName: student.lastName || "",
      phone: student.phone || "",
      semester: student.semester || "",
      branchId: student.branchId?._id || "",
      gender: student.gender || "",
      dob: student.dob?.split("T")[0] || "",
      address: student.address || "",
      city: student.city || "",
      state: student.state || "",
      pincode: student.pincode || "",
      country: student.country || "",
      profile: student.profile || "",
      status: student.status || "active",
      bloodGroup: student.bloodGroup || "",
      emergencyContact: {
        name: student.emergencyContact?.name || "",
        relationship: student.emergencyContact?.relationship || "",
        phone: student.emergencyContact?.phone || "",
      },
    });
    setSelectedStudentId(student._id);
    setIsEditing(true);
    setShowAddForm(true);
  };

  const confirmDelete = async () => {
    try {
      toast.loading("Deleting Student");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      };
      const response = await axiosWrapper.delete(
        `/student/${selectedStudentId}`,
        {
          headers,
        }
      );
      toast.dismiss();
      if (response.data.success) {
        toast.success("Student has been deleted successfully");
        setIsDeleteConfirmOpen(false);
        searchStudents({ preventDefault: () => {} });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error");
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      phone: "",
      semester: "",
      branchId: "",
      gender: "",
      dob: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      profile: "",
      status: "active",
      bloodGroup: "",
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
      },
    });
    setShowAddForm(false);
    setIsEditing(false);
    setSelectedStudentId(null);
    setFile(null);
  };

  return (
    <div className="w-full mx-auto mt-10 flex justify-center items-start flex-col mb-10">
      <div className="flex justify-between items-center w-full">
        <Heading title="Student Management" />
        {branches.length > 0 && (
          <CustomButton onClick={() => setShowAddForm(true)}>
            <IoMdAdd className="text-2xl" />
          </CustomButton>
        )}
      </div>

      {branches.length > 0 && (
        <div className="my-6 mx-auto w-full">
          <form onSubmit={searchStudents} className="flex items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-[90%] mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enrollment Number
                </label>
                <input
                  type="text"
                  name="enrollmentNo"
                  value={searchParams.enrollmentNo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter enrollment number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={searchParams.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter student name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <select
                  name="semester"
                  value={searchParams.semester}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <select
                  name="branch"
                  value={searchParams.branch}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Branch</option>
                  {branches?.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-center w-[10%] mx-auto">
              <CustomButton
                type="submit"
                disabled={dataLoading}
                variant="primary"
              >
                {dataLoading ? "Searching..." : "Search"}
              </CustomButton>
            </div>
          </form>

          {!hasSearched && (
            <div className="text-center mt-8 text-gray-600 flex flex-col items-center justify-center my-10 bg-white p-10 rounded-lg mx-auto w-[40%]">
              <img
                src="/assets/filter.svg"
                alt="Select filters"
                className="w-64 h-64 mb-4"
              />
              Please select at least one filter to search students
            </div>
          )}

          {hasSearched && students.length === 0 && (
            <NoData title="No students found" />
          )}

          {students && students.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Search Results</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-6 py-3 border-b text-left">Profile</th>
                      <th className="px-6 py-3 border-b text-left">Roll No</th>
                      <th className="px-6 py-3 border-b text-left">Name</th>
                      <th className="px-6 py-3 border-b text-left">Sem</th>
                      <th className="px-6 py-3 border-b text-left">Branch</th>
                      <th className="px-6 py-3 border-b text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 border-b">
                          <img
                            src={getMediaSource(student.profile)}
                            alt={`${student.firstName}'s profile`}
                            className="w-12 h-12 object-cover rounded-full"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1744315900478-fa44dc6a4e89?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 border-b font-mono text-xs font-bold text-blue-600">
                          {student.rollNo || "N/A"}
                        </td>
                        <td className="px-6 py-4 border-b font-semibold">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="px-6 py-4 border-b">
                          {student.semester}
                        </td>
                        <td className="px-6 py-4 border-b text-xs">
                          {student.branchId?.name}
                        </td>
                        <td className="px-6 py-4 border-b text-center">
                          <div className="flex justify-center gap-2">
                            <CustomButton
                              variant="primary"
                              className="!p-2 !bg-emerald-600"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowViewModal(true);
                              }}
                            >
                              <RxDashboard title="View Performance" />
                            </CustomButton>
                            <CustomButton
                              variant="secondary"
                              className="!p-2"
                              onClick={() => editStudentHandler(student)}
                            >
                              <MdEdit />
                            </CustomButton>
                            <CustomButton
                              variant="danger"
                              className="!p-2"
                              onClick={() => deleteStudentHandler(student._id)}
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
            </div>
          )}
        </div>
      )}

      {branches.length == 0 && (
        <div className="flex justify-center items-center flex-col w-full mt-24">
          <CgDanger className="w-16 h-16 text-yellow-500 mb-4" />
          <p className="text-center text-lg">
            Please add branches before adding a student.
          </p>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <IoMdClose className="text-2xl" />
            </button>
            <h2 className="text-2xl font-semibold mb-6">
              {isEditing ? "Edit Student" : "Add New Student"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addStudentHandler();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleFormInputChange("firstName", e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) =>
                      handleFormInputChange("middleName", e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleFormInputChange("lastName", e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      handleFormInputChange("phone", e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) =>
                      handleFormInputChange("semester", e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch
                  </label>
                  <select
                    value={formData.branchId}
                    onChange={(e) =>
                      handleFormInputChange("branchId", e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches?.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      handleFormInputChange("gender", e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                      handleFormInputChange("dob", e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) =>
                      handleFormInputChange("bloodGroup", e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Photo
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept="image/*"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address (Login ID)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      handleFormInputChange("email", e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600"
                    placeholder="student@example.com"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      handleFormInputChange("address", e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      handleFormInputChange("city", e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      handleFormInputChange("state", e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) =>
                      handleFormInputChange("pincode", e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      handleFormInputChange("country", e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact.name}
                        onChange={(e) =>
                          handleEmergencyContactChange("name", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact.relationship}
                        onChange={(e) =>
                          handleEmergencyContactChange(
                            "relationship",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.emergencyContact.phone}
                        onChange={(e) =>
                          handleEmergencyContactChange("phone", e.target.value)
                        }
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center gap-4">
                <div>
                  <p className="text-sm">
                    Default login will be{" "}
                    <span className="font-bold">
                      {formData.enrollmentNo || "enrollment_no"}@gmail.com
                    </span>{" "}
                    and password will be{" "}
                    <span className="font-bold">student123</span>
                  </p>
                </div>
                <div className="flex gap-4">
                  <CustomButton
                    type="button"
                    variant="secondary"
                    onClick={resetForm}
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton type="submit" variant="primary">
                    {isEditing ? "Update Student" : "Add Student"}
                  </CustomButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this student?"
      />
      <StudentViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        student={selectedStudent}
      />
    </div>
  );
};

const StudentViewModal = ({ isOpen, onClose, student }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const userToken = localStorage.getItem("userToken");

  useEffect(() => {
    if (isOpen && student) {
      fetchData();
    }
  }, [isOpen, student]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attRes, markRes] = await Promise.all([
        axiosWrapper.get(`attendance/student/${student._id}`, { headers: { Authorization: `Bearer ${userToken}` } }),
        axiosWrapper.get(`marks/student?id=${student._id}`, { headers: { Authorization: `Bearer ${userToken}` } })
      ]);
      if (attRes.data.success) setAttendance(attRes.data.data);
      if (markRes.data.success) setMarks(markRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-blue-600 p-8 text-white flex justify-between items-start">
          <div className="flex gap-6 items-center">
            <img 
              src={getMediaSource(student.profile)}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-lg"
              alt="Profile"
              onError={(e) => e.target.src = "https://images.unsplash.com/photo-1744315900478-fa44dc6a4e89?q=80&w=3087&auto=format&fit=crop"}
            />
            <div>
              <h2 className="text-3xl font-black">{student.firstName} {student.lastName}</h2>
              <div className="flex gap-4 mt-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider">ROLL: {student.rollNo}</span>
                <span className="bg-emerald-400/20 text-emerald-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{student.status}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <IoMdClose className="text-3xl" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {["details", "attendance", "performance"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 font-bold uppercase text-xs tracking-widest transition-all border-b-2 ${
                activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          {activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <DetailCard title="Academic" items={[
                { label: "Branch", value: student.branchId?.name },
                { label: "Current Semester", value: student.semester },
                { label: "Enrollment No", value: student.enrollmentNo },
              ]} />
              <DetailCard title="Contact" items={[
                { label: "Email", value: student.email },
                { label: "Phone", value: student.phone },
                { label: "Address", value: student.address },
              ]} />
              <DetailCard title="Personal" items={[
                { label: "DOB", value: new Date(student.dob).toLocaleDateString() },
                { label: "Gender", value: student.gender },
                { label: "Blood Group", value: student.bloodGroup },
              ]} />
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="space-y-4">
              {loading ? <div className="text-center py-10">Loading...</div> : (
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
                      <tr>
                        <th className="p-4 px-6">Date</th>
                        <th className="p-4 px-6">Subject</th>
                        <th className="p-4 px-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {attendance.length > 0 ? attendance.map((at, i) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="p-4 px-6 font-mono font-medium">{new Date(at.date).toLocaleDateString()}</td>
                          <td className="p-4 px-6 font-bold text-gray-700">{at.subject}</td>
                          <td className="p-4 px-6">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                              at.status === "Present" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            }`}>{at.status}</span>
                          </td>
                        </tr>
                      )) : <tr><td colSpan="3" className="p-10 text-center text-gray-400 italic">No attendance records found</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "performance" && (
            <div className="space-y-4">
               {loading ? <div className="text-center py-10">Loading...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {marks.length > 0 ? marks.map((m, i) => (
                     <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{m.subject?.name || "Exam"}</p>
                        <h4 className="text-2xl font-black text-gray-900 mt-1">{m.marks} <span className="text-sm text-gray-400">/ 100</span></h4>
                        <p className="text-xs text-gray-500 mt-2 font-bold">Sem {m.semester}</p>
                     </div>
                   )) : <div className="col-span-full py-10 text-center text-gray-400 italic bg-white rounded-2xl border">No performance records found</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailCard = ({ title, items }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full">
    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 pb-2 border-b">{title}</h3>
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.label}</p>
          <p className="text-sm font-bold text-gray-800 break-words">{item.value || "N/A"}</p>
        </div>
      ))}
    </div>
  </div>
);

export default Student;
