import React, { useState } from "react";
import UpdatePasswordLoggedIn from "../../components/UpdatePasswordLoggedIn";
import { getMediaSource } from "../../utils/MediaHelper";
import CustomButton from "../../components/CustomButton";
import { FiMapPin, FiShield, FiUser } from "react-icons/fi";

const DetailSection = ({ title, icon: Icon, items }) => (
  <section className="rounded-[22px] border border-gray-200 bg-white p-5 shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-blue-50 text-blue-600">
        <Icon className="text-[18px]" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-500">Structured overview with the same admin dashboard styling.</p>
      </div>
    </div>

    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-[16px] border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">{item.label}</p>
          <p className="mt-1 text-sm font-semibold text-gray-800 break-words">{item.value || "N/A"}</p>
        </div>
      ))}
    </div>
  </section>
);

const Profile = ({ profileData }) => {
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);

  if (!profileData) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const salary = profileData.salary
    ? `Rs ${Number(profileData.salary).toLocaleString()}`
    : "N/A";

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-1 py-2 md:px-2">
      <section className="rounded-[24px] border border-gray-200 bg-gradient-to-r from-white via-blue-50/50 to-white p-5 shadow-[0_12px_30px_rgba(37,71,154,0.06)] md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="h-28 w-28 overflow-hidden rounded-full border border-white bg-white shadow-lg">
              <img
                src={getMediaSource(profileData.profile)}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600">
                {profileData.isSuperAdmin ? "Super Admin" : "Admin Profile"}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-gray-900">
                {`${profileData.firstName} ${profileData.lastName}`}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-gray-600">
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5">
                  Employee ID: {profileData.employeeId || "N/A"}
                </span>
                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-blue-700">
                  {profileData.designation || "Admin"}
                </span>
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-emerald-700 capitalize">
                  {profileData.status || "active"}
                </span>
              </div>
            </div>
          </div>

          <CustomButton
            onClick={() => setShowUpdatePasswordModal(true)}
            className="!rounded-[14px] !bg-blue-600 !px-5 !py-2.5 !shadow-none hover:!translate-y-0 hover:!bg-blue-700"
          >
            Update Password
          </CustomButton>
        </div>
      </section>

      <DetailSection
        title="Personal Information"
        icon={FiUser}
        items={[
          { label: "Email", value: profileData.email },
          { label: "Phone", value: profileData.phone },
          { label: "Gender", value: profileData.gender },
          { label: "Blood Group", value: profileData.bloodGroup },
          { label: "Date Of Birth", value: formatDate(profileData.dob) },
          { label: "Joining Date", value: formatDate(profileData.joiningDate) },
          { label: "Salary", value: salary },
          { label: "Role", value: profileData.isSuperAdmin ? "Super Admin" : "Admin" },
        ]}
      />

      <DetailSection
        title="Address Information"
        icon={FiMapPin}
        items={[
          { label: "Address", value: profileData.address },
          { label: "City", value: profileData.city },
          { label: "State", value: profileData.state },
          { label: "Pincode", value: profileData.pincode },
          { label: "Country", value: profileData.country },
        ]}
      />

      <DetailSection
        title="Emergency Contact"
        icon={FiShield}
        items={[
          { label: "Name", value: profileData.emergencyContact?.name },
          { label: "Relationship", value: profileData.emergencyContact?.relationship },
          { label: "Phone", value: profileData.emergencyContact?.phone },
        ]}
      />

      {showUpdatePasswordModal && (
        <UpdatePasswordLoggedIn onClose={() => setShowUpdatePasswordModal(false)} />
      )}
    </div>
  );
};

export default Profile;
