import React, { useEffect } from "react";
import socket from "./utils/Socket";
import { toast } from "react-hot-toast";
import Login from "./Screens/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import mystore from "./redux/store";
import StudentHome from "./Screens/Student/Home";
import FacultyHome from "./Screens/Faculty/Home";
import AdminHome from "./Screens/Admin/Home";
import Landing from "./Screens/Landing";
import ForgetPassword from "./Screens/ForgetPassword";
import UpdatePassword from "./Screens/UpdatePassword";
import StudentRegistration from "./Screens/StudentRegistration";

const App = () => {
  useEffect(() => {
    socket.on("new-notice", (notice) => {
      toast.success(`New Notice: ${notice.title}`, {
        duration: 5000,
        position: "top-right",
      });
    });

    return () => {
      socket.off("new-notice");
    };
  }, []);

  return (
    <>
      <Provider store={mystore}>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route
              path="/:type/update-password/:resetId"
              element={<UpdatePassword />}
            />
            <Route path="/student" element={<StudentHome />} />
            <Route path="/faculty" element={<FacultyHome />} />
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/register" element={<StudentRegistration />} />
          </Routes>
        </Router>
      </Provider>
    </>
  );
};

export default App;
