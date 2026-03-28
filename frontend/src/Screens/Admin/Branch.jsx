import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MdOutlineDelete, MdEdit } from "react-icons/md";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import CustomButton from "../../components/CustomButton";
import Loading from "../../components/Loading";

const Branch = () => {
  const [data, setData] = useState({
    name: "",
    branchId: "",
  });
  const [branch, setBranch] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    getBranchHandler();
  }, []);

  const getBranchHandler = async () => {
    setDataLoading(true);
    try {
      const response = await axiosWrapper.get(`/branch`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      if (response.data.success) {
        setBranch(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setBranch([]);
        return;
      }
      toast.error(error.response?.data?.message || "Error fetching branches");
    } finally {
      setDataLoading(false);
    }
  };

  const addBranchHandler = async (e) => {
    e.preventDefault();
    if (!data.name || !data.branchId) {
      toast.dismiss();
      toast.error("Please fill all the fields");
      return;
    }
    try {
      toast.loading(isEditing ? "Updating Branch" : "Adding Branch");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      };
      let response;
      if (isEditing) {
        response = await axiosWrapper.patch(`/branch/${selectedBranchId}`, data, {
          headers,
        });
      } else {
        response = await axiosWrapper.post(`/branch`, data, { headers });
      }
      toast.dismiss();
      if (response.data.success) {
        toast.success(response.data.message);
        setData({ name: "", branchId: "" });
        setShowAddForm(false);
        setIsEditing(false);
        setSelectedBranchId(null);
        getBranchHandler();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error updating branch");
    }
  };

  const deleteBranchHandler = (id) => {
    setIsDeleteConfirmOpen(true);
    setSelectedBranchId(id);
  };

  const editBranchHandler = (branchItem) => {
    setData({
      name: branchItem.name,
      branchId: branchItem.branchId,
    });
    setSelectedBranchId(branchItem._id);
    setIsEditing(true);
    setShowAddForm(true);
  };

  const confirmDelete = async () => {
    try {
      toast.loading("Deleting Branch");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      };
      const response = await axiosWrapper.delete(`/branch/${selectedBranchId}`, {
        headers,
      });
      toast.dismiss();
      if (response.data.success) {
        toast.success("Branch has been deleted successfully");
        setIsDeleteConfirmOpen(false);
        getBranchHandler();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error deleting branch");
    }
  };

  const closeModal = () => {
    setShowAddForm(false);
    setIsEditing(false);
    setSelectedBranchId(null);
    setData({ name: "", branchId: "" });
  };

  return (
    <div className="w-full px-1 py-2 md:px-2">
      <div className="flex flex-col gap-4 rounded-[22px] border border-gray-200 bg-white p-5 shadow-[0_12px_30px_rgba(37,71,154,0.06)] md:flex-row md:items-center md:justify-between">
        <Heading title="Branch Details" />
        <CustomButton
          onClick={() => setShowAddForm(true)}
          className="!rounded-[14px] !bg-blue-600 !px-4 !py-2.5 !shadow-none hover:!translate-y-0 hover:!bg-blue-700"
        >
          <IoMdAdd className="mr-2 text-lg" />
          Add Branch
        </CustomButton>
      </div>

      {dataLoading && <Loading />}

      {!dataLoading && (
        <div className="mt-5 overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-gray-800">All Branches</h3>
              <p className="text-sm text-gray-500">Manage departments in the updated admin layout.</p>
            </div>
            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {branch?.length || 0} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#123d8f] text-white">
                <tr>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">Branch Name</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">Branch ID</th>
                  <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em]">Created At</th>
                  <th className="px-5 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {branch && branch.length > 0 ? (
                  branch.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 text-gray-700 transition hover:bg-blue-50/40">
                      <td className="px-5 py-4 font-semibold text-gray-900">{item.name}</td>
                      <td className="px-5 py-4 font-mono text-xs text-blue-700">{item.branchId}</td>
                      <td className="px-5 py-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <CustomButton
                            variant="secondary"
                            className="!rounded-[12px] !bg-slate-600 !p-2.5 !shadow-none hover:!translate-y-0"
                            onClick={() => editBranchHandler(item)}
                          >
                            <MdEdit />
                          </CustomButton>
                          <CustomButton
                            variant="danger"
                            className="!rounded-[12px] !bg-rose-600 !p-2.5 !shadow-none hover:!translate-y-0"
                            onClick={() => deleteBranchHandler(item._id)}
                          >
                            <MdOutlineDelete />
                          </CustomButton>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-5 py-14 text-center text-sm text-gray-500">
                      No branches found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? "Edit Branch" : "Add New Branch"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">Keep the same data, only in a cleaner modal layout.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
              >
                <IoMdClose className="text-xl" />
              </button>
            </div>

            <form onSubmit={addBranchHandler} className="space-y-5 px-6 py-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="w-full rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-blue-300 focus:bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="branchId" className="mb-2 block text-sm font-medium text-gray-700">
                    Branch ID
                  </label>
                  <input
                    type="text"
                    id="branchId"
                    value={data.branchId}
                    onChange={(e) => setData({ ...data, branchId: e.target.value })}
                    className="w-full rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-blue-300 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <CustomButton
                  variant="secondary"
                  onClick={closeModal}
                  className="!rounded-[14px] !bg-gray-100 !px-4 !py-2.5 !text-gray-700 !shadow-none hover:!translate-y-0 hover:!bg-gray-200"
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  variant="primary"
                  type="submit"
                  className="!rounded-[14px] !bg-blue-600 !px-4 !py-2.5 !shadow-none hover:!translate-y-0 hover:!bg-blue-700"
                >
                  {isEditing ? "Update Branch" : "Add Branch"}
                </CustomButton>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this branch?"
      />
    </div>
  );
};

export default Branch;
