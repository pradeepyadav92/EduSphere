import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Notice from "../Notice";
import Student from "./Student";
import Faculty from "./Faculty";
import Subjects from "./Subject";
import Admin from "./Admin";
import Branch from "./Branch";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/actions";
import axiosWrapper from "../../utils/AxiosWrapper";
import Profile from "./Profile";
import Fees from "./Fees";
import StudentApplications from "./StudentApplications";
import Library from "./Library";
import Exam from "../Exam";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiBookOpen,
  FiCreditCard,
  FiFileText,
  FiFolder,
  FiGrid,
  FiLogOut,
  FiSearch,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { HiOutlineDocumentText, HiOutlineUsers } from "react-icons/hi";
import { MdOutlineAccountTree, MdOutlineLibraryBooks } from "react-icons/md";
import { PiExamBold } from "react-icons/pi";
import { RxDashboard } from "react-icons/rx";
import { clearStoredSession } from "../../utils/auth";
import { getMediaSource } from "../../utils/MediaHelper";

const MENU_ITEMS = [
  { id: "home", label: "Home", component: Profile },
  { id: "student", label: "Student", component: Student },
  { id: "faculty", label: "Faculty", component: Faculty },
  { id: "branch", label: "Branch", component: Branch },
  { id: "notice", label: "Notice", component: Notice },
  { id: "exam", label: "Exam", component: Exam },
  { id: "subjects", label: "Subjects", component: Subjects },
  { id: "fees", label: "Fees", component: Fees },
  { id: "library", label: "Library", component: Library },
  { id: "admin", label: "Admin", component: Admin },
  { id: "applications", label: "Approvals", component: StudentApplications },
];

const MENU_ICONS = {
  home: FiGrid,
  student: HiOutlineUsers,
  faculty: FiUsers,
  branch: MdOutlineAccountTree,
  notice: FiFileText,
  exam: PiExamBold,
  subjects: FiBookOpen,
  fees: FiCreditCard,
  library: MdOutlineLibraryBooks,
  admin: FiUser,
  applications: HiOutlineDocumentText,
};

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const userToken = localStorage.getItem("userToken");

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axiosWrapper.get(`/admin/my-details`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.data.success) {
        setProfileData(response.data.data);
        dispatch(setUserData(response.data.data));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching user details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [dispatch, userToken]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const pathMenuId = urlParams.get("page") || "home";
    const validMenu = MENU_ITEMS.find((item) => item.id === pathMenuId);
    setSelectedMenu(validMenu ? validMenu.id : "home");
  }, [location.search]);

  const handleMenuClick = (menuId) => {
    setSelectedMenu(menuId);
    navigate(`/admin?page=${menuId}`);
  };

  const handleLogout = () => {
    clearStoredSession();
    navigate("/");
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex h-64 items-center justify-center text-sm font-medium text-gray-500">Loading...</div>;
    }

    const MenuItem = MENU_ITEMS.find((item) => item.id === selectedMenu)?.component;

    if (selectedMenu === "home" && profileData) {
      return <Profile profileData={profileData} />;
    }

    return MenuItem ? <MenuItem /> : null;
  };

  const pageTitle = MENU_ITEMS.find((item) => item.id === selectedMenu)?.label || "Home";
  const fullName = profileData
    ? `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim()
    : "Admin";

  return (
    <>
      <div className="h-screen overflow-hidden bg-[#f8fafc] p-2 md:p-3">
        <div className="mx-auto flex h-full max-w-[1600px] overflow-hidden rounded-[24px] border border-gray-200 bg-[#f9fafb] shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <aside className="hidden h-full w-[230px] shrink-0 border-r border-gray-200 bg-white px-2.5 py-3 lg:flex lg:flex-col lg:overflow-hidden">
            <div className="mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-blue-50 text-blue-600">
                  <RxDashboard className="text-[16px]" />
                </div>
                <div>
                  <p className="text-[1.28rem] font-semibold leading-none tracking-[-0.03em] text-gray-800">
                    EduSphere
                  </p>
                  <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.18em] text-blue-600">
                    Institutional Intelligence
                  </p>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {MENU_ITEMS.map((item) => {
                const Icon = MENU_ICONS[item.id] || FiFolder;
                const isSelected = selectedMenu.toLowerCase() === item.id.toLowerCase();

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleMenuClick(item.id)}
                    className={`flex w-full items-center gap-2 rounded-[12px] border px-2.5 py-1.5 text-left text-[11px] font-medium transition-all duration-200 ${
                      isSelected
                        ? "border-blue-200 bg-blue-50 text-blue-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                        : "border-transparent bg-transparent text-gray-600 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-[9px] ${
                        isSelected ? "bg-white text-blue-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon className="text-[13px]" />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-[12px] border border-dashed border-blue-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-blue-700 transition hover:bg-blue-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-blue-50">
                  <FiLogOut className="text-[13px]" />
                </span>
                <span>Logout</span>
              </button>
            </div>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <header className="shrink-0 border-b border-gray-200 bg-white/90 px-5 py-3 backdrop-blur md:px-7">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-[1.55rem] font-semibold tracking-[-0.03em] text-gray-800 md:text-[1.85rem]">
                    {pageTitle === "Home" ? "Admin Control Center" : pageTitle}
                  </p>
                  <p className="mt-1 text-[13px] text-gray-500">
                    Manage the institution with the same clean workspace used across the student and faculty panels.
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="relative min-w-[220px] flex-1 md:flex-initial">
                    <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search modules or records..."
                      className="w-full rounded-[14px] border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-[13px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-300"
                    />
                  </div>

                  <div className="flex items-center gap-3 rounded-[14px] border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
                    {profileData?.profile ? (
                      <img
                        src={getMediaSource(profileData.profile)}
                        alt={fullName}
                        className="h-9 w-9 rounded-[10px] object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-blue-50 text-blue-600">
                        <FiUser className="text-[15px]" />
                      </div>
                    )}
                    <div className="pr-1">
                      <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-gray-400">
                        Admin
                      </p>
                      <p className="text-[12px] font-semibold text-gray-800">{fullName}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                {MENU_ITEMS.map((item) => {
                  const isSelected = selectedMenu.toLowerCase() === item.id.toLowerCase();

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleMenuClick(item.id)}
                      className={`whitespace-nowrap rounded-[16px] px-4 py-2.5 text-sm font-medium transition ${
                        isSelected ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </header>

            <div
              className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5"
              style={{
                scrollbarGutter: "stable both-edges",
                overflowAnchor: "none",
                overscrollBehavior: "contain",
              }}
            >
              <div className="min-h-full rounded-[22px] border border-gray-200 bg-white p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] md:p-3">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
      <Toaster position="bottom-center" />
    </>
  );
};

export default Home;
