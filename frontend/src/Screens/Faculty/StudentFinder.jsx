import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";
import axiosWrapper from "../../utils/AxiosWrapper";
import CustomButton from "../../components/CustomButton";
import NoData from "../../components/NoData";
import { getMediaSource } from "../../utils/MediaHelper";

const StudentFinder = () => {
  const [searchParams, setSearchParams] = useState({
    enrollmentNo: "",
    name: "",
    semester: "",
    branch: "",
  });
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const userToken = localStorage.getItem("userToken");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        toast.loading("Loading branches...");
        const response = await axiosWrapper.get("branch", {
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
          toast.error(
            error.response?.data?.message || "Failed to load branches"
          );
        }
      } finally {
        toast.dismiss();
      }
    };
    fetchBranches();
  }, [userToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const searchStudents = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setDataLoading(true);
    setHasSearched(true);
    toast.loading("Searching students...");
    setStudents([]);
    try {
      const response = await axiosWrapper.post(`student/search`, searchParams, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      toast.dismiss();
      if (response.data.success) {
        if (response.data.data.length === 0) {
          toast.error("No students found!");
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
      toast.error(error.response?.data?.message || "Error searching students");
      console.error("Search error:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleRowClick = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const detailsSections = selectedStudent
    ? [
        {
          title: "Academic Information",
          items: [
            { label: "Enrollment No", value: selectedStudent.enrollmentNo },
            { label: "Branch", value: selectedStudent.branchId?.name },
            { label: "Semester", value: selectedStudent.semester },
          ],
        },
        {
          title: "Contact Information",
          items: [
            { label: "Email", value: selectedStudent.email },
            { label: "Phone", value: selectedStudent.phone },
            { label: "Address", value: selectedStudent.address },
          ],
        },
        {
          title: "Location Details",
          items: [
            { label: "City", value: selectedStudent.city },
            { label: "State", value: selectedStudent.state },
            { label: "Pincode", value: selectedStudent.pincode },
            { label: "Country", value: selectedStudent.country },
          ],
        },
        {
          title: "Emergency Contact",
          items: [
            { label: "Name", value: selectedStudent.emergencyContact?.name },
            {
              label: "Relationship",
              value: selectedStudent.emergencyContact?.relationship,
            },
            { label: "Phone", value: selectedStudent.emergencyContact?.phone },
          ],
        },
      ]
    : [];

  const personalDetails = selectedStudent
    ? [
        {
          label: "Full Name",
          value: `${selectedStudent.firstName} ${selectedStudent.middleName} ${selectedStudent.lastName}`.replace(
            /\s+/g,
            " "
          ).trim(),
        },
        { label: "Gender", value: selectedStudent.gender },
        {
          label: "Date of Birth",
          value: new Date(selectedStudent.dob).toLocaleDateString(),
        },
        { label: "Blood Group", value: selectedStudent.bloodGroup },
      ]
    : [];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-3 py-4 md:px-5 md:py-6">
      <div className="flex w-full items-center justify-between">
        <Heading title="Student Finder" />
      </div>

      <div className="my-6 mx-auto w-full">
        <form
          onSubmit={searchStudents}
          className="rounded-[22px] border border-gray-200 bg-white p-6 shadow-[0_12px_30px_rgba(37,71,154,0.06)]"
        >
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
                Enrollment Number
              </label>
              <input
                type="text"
                name="enrollmentNo"
                value={searchParams.enrollmentNo}
                onChange={handleInputChange}
                className="w-full rounded-[16px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-300"
                placeholder="Enter enrollment number"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={searchParams.name}
                onChange={handleInputChange}
                className="w-full rounded-[16px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-300"
                placeholder="Enter student name"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
                Semester
              </label>
              <div className="relative">
                <select
                  name="semester"
                  value={searchParams.semester}
                  onChange={handleInputChange}
                  className="w-full appearance-none rounded-[16px] border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 outline-none focus:border-blue-300"
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  v
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
                Branch
              </label>
              <div className="relative">
                <select
                  name="branch"
                  value={searchParams.branch}
                  onChange={handleInputChange}
                  className="w-full appearance-none rounded-[16px] border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 outline-none focus:border-blue-300"
                >
                  <option value="">Select Branch</option>
                  {branches?.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  v
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <CustomButton
              type="submit"
              disabled={dataLoading}
              variant="primary"
              className="rounded-[16px] bg-blue-600 px-10 py-3 font-medium text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] hover:bg-blue-700"
            >
              {dataLoading ? "Searching..." : "Search"}
            </CustomButton>
          </div>
        </form>

        {!hasSearched && (
          <div className="mx-auto my-10 flex w-full max-w-xl flex-col items-center justify-center rounded-[22px] border border-gray-200 bg-white p-10 text-center text-gray-600 shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
            <img
              src="/assets/filter.svg"
              alt="Select filters"
              className="mb-4 h-40 w-40"
            />
            Please select at least one filter to search students
          </div>
        )}

        {hasSearched && students.length === 0 && <NoData title="No students found" />}

        {students.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Search Results</h2>
            <div className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white text-sm">
                  <thead>
                    <tr className="bg-[#123d8f] text-white">
                      <th className="px-6 py-4 text-left font-semibold">Profile</th>
                      <th className="px-6 py-4 text-left font-semibold">Name</th>
                      <th className="px-6 py-4 text-left font-semibold">Enrollment No</th>
                      <th className="px-6 py-4 text-left font-semibold">Semester</th>
                      <th className="px-6 py-4 text-left font-semibold">Branch</th>
                      <th className="px-6 py-4 text-left font-semibold">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map((student) => (
                      <tr
                        key={student._id}
                        className="cursor-pointer transition-colors hover:bg-blue-50/40"
                        onClick={() => handleRowClick(student)}
                      >
                        <td className="px-6 py-4">
                          <img
                            src={getMediaSource(student.profile)}
                            alt={`${student.firstName}'s profile`}
                            className="h-12 w-12 rounded-[12px] object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1744315900478-fa44dc6a4e89?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {student.firstName} {student.middleName} {student.lastName}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{student.enrollmentNo}</td>
                        <td className="px-6 py-4 text-gray-600">{student.semester}</td>
                        <td className="px-6 py-4 text-gray-600">{student.branchId?.name}</td>
                        <td className="px-6 py-4 text-gray-600">{student.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {showModal && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[28px] border border-gray-200 bg-[#f8fafc] p-4 shadow-[0_30px_70px_rgba(15,23,42,0.18)] md:p-5">
              <div className="rounded-[24px] border border-gray-200 bg-gradient-to-r from-white via-blue-50/40 to-white p-6 shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="h-28 w-28 overflow-hidden rounded-full border border-white bg-white shadow-lg">
                      <img
                        src={getMediaSource(selectedStudent.profile)}
                        alt={`${selectedStudent.firstName}'s profile`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1744315900478-fa44dc6a4e89?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                        }}
                      />
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600">
                        Student Dashboard View
                      </p>
                      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-gray-900">
                        {`${selectedStudent.firstName} ${selectedStudent.middleName || ""} ${selectedStudent.lastName}`.replace(/\s+/g, " ").trim()}
                      </h2>
                      <div className="mt-4 flex flex-wrap gap-2 text-sm font-medium">
                        <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-gray-700">
                          Enrollment No: {selectedStudent.enrollmentNo || "N/A"}
                        </span>
                        <span className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-blue-700">
                          {selectedStudent.branchId?.name || "Department Pending"}
                        </span>
                        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-emerald-700 capitalize">
                          Semester {selectedStudent.semester || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <CustomButton
                    onClick={() => setShowModal(false)}
                    variant="secondary"
                    className="!rounded-[16px] !bg-gray-100 !px-5 !py-3 !text-gray-700 !shadow-none hover:!translate-y-0 hover:!bg-gray-200"
                  >
                    Close
                  </CustomButton>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5">
                <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
                  <h3 className="mb-4 text-[1.05rem] font-semibold tracking-[-0.02em] text-gray-900 md:text-[1.2rem]">
                    Personal Information
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {personalDetails.map((item) => (
                      <div key={item.label} className="rounded-[18px] border border-gray-100 bg-gray-50 px-5 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                          {item.label}
                        </p>
                        <p className="mt-2 text-base font-semibold text-gray-900 break-words">
                          {item.value || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {detailsSections.map((section) => (
                    <div
                      key={section.title}
                      className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_12px_30px_rgba(37,71,154,0.06)]"
                    >
                      <h3 className="mb-4 text-[1.05rem] font-semibold tracking-[-0.02em] text-gray-900">
                        {section.title}
                      </h3>
                      <div className="grid gap-4">
                        {section.items.map((item) => (
                          <div key={item.label} className="rounded-[18px] border border-gray-100 bg-gray-50 px-5 py-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                              {item.label}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900 break-words">
                              {item.value || "N/A"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFinder;
