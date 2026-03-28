import React, { useState } from "react";
import CustomButton from "../../components/CustomButton";
import UpdatePasswordLoggedIn from "../../components/UpdatePasswordLoggedIn";
import { getMediaSource } from "../../utils/MediaHelper";
import { FiMapPin, FiShield, FiUser } from "react-icons/fi";
import { HiOutlineAcademicCap } from "react-icons/hi";

const DetailSection = ({ title, icon: Icon, subtitle, items }) => (
  <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
    <div className="mb-5 flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-blue-50 text-blue-600">
        <Icon className="text-[20px]" />
      </div>
      <div>
        <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-gray-900 md:text-[1.2rem]">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-[18px] border border-gray-100 bg-gray-50 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">{item.label}</p>
          <p className="mt-2 text-base font-semibold text-gray-900 break-words">{item.value || "N/A"}</p>
        </div>
      ))}
    </div>
  </section>
);

const Profile = ({ profileData }) => {
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  if (!profileData) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fullName = `${profileData.firstName || ""} ${profileData.lastName || ""}`.replace(/\s+/g, " ").trim();
  const salary = profileData.salary ? `Rs ${Number(profileData.salary).toLocaleString()}` : "N/A";

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-2 py-3 md:px-3 md:py-4">
      <section className="rounded-[24px] border border-gray-200 bg-gradient-to-r from-white via-blue-50/40 to-white p-6 shadow-[0_12px_30px_rgba(37,71,154,0.06)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="h-28 w-28 overflow-hidden rounded-full border border-white bg-white shadow-lg">
              <img src={getMediaSource(profileData.profile)} alt="Profile" className="h-full w-full object-cover" />
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600">Faculty Profile</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-gray-900 md:text-[2.1rem]">{fullName}</h1>
              <div className="mt-4 flex flex-wrap gap-2 text-sm font-medium">
                <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-gray-700">
                  Employee ID: {profileData.employeeId || "N/A"}
                </span>
                <span className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-blue-700">
                  {profileData.designation || "Faculty"}
                </span>
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-emerald-700 capitalize">
                  {profileData.status || "Active"}
                </span>
              </div>
            </div>
          </div>

          <CustomButton
            onClick={() => setShowPasswordUpdate(!showPasswordUpdate)}
            variant="primary"
            className="!rounded-[16px] !bg-blue-600 !px-5 !py-3 !shadow-none hover:!translate-y-0 hover:!bg-blue-700"
          >
            {showPasswordUpdate ? "Hide" : "Update Password"}
          </CustomButton>
        </div>
      </section>

      <DetailSection
        title="Personal Information"
        icon={FiUser}
        subtitle="Structured overview with the same admin dashboard styling."
        items={[
          { label: "Email", value: profileData.email },
          { label: "Phone", value: profileData.phone },
          { label: "Gender", value: profileData.gender },
          { label: "Blood Group", value: profileData.bloodGroup },
          { label: "Date Of Birth", value: formatDate(profileData.dob) },
          { label: "Joining Date", value: formatDate(profileData.joiningDate) },
          { label: "Salary", value: salary },
          { label: "Role", value: profileData.designation || "Faculty" },
        ]}
      />

      <DetailSection
        title="Academic Information"
        icon={HiOutlineAcademicCap}
        subtitle="Work assignment details aligned to the same faculty profile layout."
        items={[
          { label: "Employee ID", value: profileData.employeeId },
          { label: "Branch", value: profileData.branchId?.name || profileData.branchId },
          { label: "Status", value: profileData.status || "Active" },
        ]}
      />

      <DetailSection
        title="Address Information"
        icon={FiMapPin}
        subtitle="Residential details arranged with the same spacing and hierarchy."
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
        subtitle="Important family or emergency details in the same card format."
        items={[
          { label: "Name", value: profileData.emergencyContact?.name },
          { label: "Relationship", value: profileData.emergencyContact?.relationship },
          { label: "Phone", value: profileData.emergencyContact?.phone },
        ]}
      />

      {showPasswordUpdate && <UpdatePasswordLoggedIn onClose={() => setShowPasswordUpdate(false)} />}
    </div>
  );
};

export default Profile;
