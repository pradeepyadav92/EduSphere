import React, { useState, useEffect } from "react";
import { FiLogIn, FiMail, FiLock, FiChevronLeft, FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { setUserToken } from "../redux/actions";
import { useDispatch } from "react-redux";
import CustomButton from "../components/CustomButton";
import axiosWrapper from "../utils/AxiosWrapper";
import { RxDashboard } from "react-icons/rx";

const USER_TYPES = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Admin",
};

const LoginForm = ({ selected, onSubmit, formData, setFormData }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="w-full space-y-6" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label
          className="block text-gray-700 text-sm font-semibold ml-1"
          htmlFor="email"
        >
          {selected} Email
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-blue-600 transition-colors">
            <FiMail className="text-gray-400 group-focus-within:text-blue-600" />
          </div>
          <input
            type="email"
            id="email"
            required
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50/50"
            placeholder={`name@${selected.toLowerCase()}.com`}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center ml-1">
          <label
            className="block text-gray-700 text-sm font-semibold"
            htmlFor="password"
          >
            {selected === USER_TYPES.ADMIN ? "Password" : "Date of Birth"}
          </label>
          <Link
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            to="/forget-password"
          >
            Forgot?
          </Link>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-blue-600 transition-colors">
            <FiLock className="text-gray-400 group-focus-within:text-blue-600" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            required
            className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50/50"
            placeholder={
              selected === USER_TYPES.ADMIN
                ? "••••••••"
                : "DDMMYYYY (e.g. 01011990)"
            }
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </div>

      <CustomButton
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-blue-600/20 transition-all flex justify-center items-center gap-2 transform active:scale-[0.98]"
      >
        Sign In
        <FiLogIn className="text-lg" />
      </CustomButton>

    </form>
  );
};

const UserTypeSelector = ({ selected, onSelect }) => (
  <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100/80 rounded-2xl mb-10 border border-gray-200">
    {Object.values(USER_TYPES).map((type) => (
      <button
        key={type}
        onClick={() => onSelect(type)}
        className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${
          selected === type
            ? "bg-white text-blue-600 shadow-sm transform scale-[1.02]"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
        }`}
      >
        {type}
      </button>
    ))}
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [selected, setSelected] = useState(USER_TYPES.STUDENT);

  const handleUserTypeSelect = (type) => {
    const userType = type.toLowerCase();
    setSelected(type);
    setSearchParams({ type: userType });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const response = await axiosWrapper.post(
        `${selected.toLowerCase()}/login`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const { token } = response.data.data;
      localStorage.setItem("userToken", token);
      localStorage.setItem("userType", selected);
      dispatch(setUserToken(token));
      navigate(`/${selected.toLowerCase()}`);
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      navigate(`/${localStorage.getItem("userType").toLowerCase()}`);
    }
  }, [navigate]);

  useEffect(() => {
    if (type) {
      const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
      if (Object.values(USER_TYPES).includes(capitalizedType)) {
        setSelected(capitalizedType);
      }
    }
  }, [type]);

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6 selection:bg-blue-100">
      <div className="w-full max-w-[1100px] flex bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 lg:h-[700px]">
        {/* Left Side - Visuals */}
        <div className="hidden lg:flex lg:w-1/2 bg-blue-600 p-16 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-2xl"></div>
          
          <Link to="/" className="flex items-center gap-3 text-white group z-10 w-fit">
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
              <FiChevronLeft className="text-xl" />
            </div>
            <span className="font-bold tracking-tight">Back to Home</span>
          </Link>

          <div className="space-y-6 z-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl rotate-3">
              <RxDashboard className="text-3xl text-blue-600" />
            </div>
            <h2 className="text-5xl font-extrabold text-white leading-[1.1]">
              Manage your <br />
              <span className="text-blue-200 italic">Academic</span> life effortlessly.
            </h2>
            <p className="text-blue-100 text-lg max-w-sm leading-relaxed font-medium">
              Join thousands of students and faculty using EduSphere to streamline their daily education journey.
            </p>
          </div>

          <div className="flex gap-4 z-10">
             <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <img key={i} className="w-10 h-10 rounded-full border-2 border-blue-600 shadow-sm" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`} alt="User" />
                ))}
             </div>
             <p className="text-blue-100 text-sm font-semibold flex items-center">
               Trusted by 10k+ users
             </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-500 font-medium">Please enter your details to sign in.</p>
            </div>

            <UserTypeSelector selected={selected} onSelect={handleUserTypeSelect} />
            
            <LoginForm
              selected={selected}
              onSubmit={handleSubmit}
              formData={formData}
              setFormData={setFormData}
            />
          </div>
        </div>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
};

export default Login;
