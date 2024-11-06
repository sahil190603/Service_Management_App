import React, { useContext, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AppButton from "../components/Generic/AppButton";
import { Result, Spin } from "antd"; 
import { AuthContext } from "../Context/AuthProvider";
import { useNavigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";


const Login = lazy(() => import("../pages/Login"));
const Myprojects = lazy(() => import("../pages/Myprojects"));
const Employeelist = lazy(() => import("../pages/Employeelist"));
const Tasklist = lazy(() => import("../pages/Tasklist"));
const Helpdesk = lazy(() => import("../pages/Helpdesk"));
const TaskActivitylist = lazy(() => import("../pages/TaskActivitylist"));
const Appointmentlist = lazy(() => import("../pages/Appointmentlist"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Planning = lazy(() => import("../pages/Planning"));
const TaskTansferRequest = lazy(() => import("../pages/TaskTansferRequest"));
const LeaveManagement = lazy(() => import("../pages/LeaveManagement"));

const MainRoute = () => {
  const { role, user } = useContext(AuthContext) ?? {};
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if ((location.pathname === "/login" || location.pathname === "/") && role === "Admin") {
      navigate("/project", { replace: true });
    } else if ((location.pathname === "/login") && role === "User") {
      navigate("/task", { replace: true });
    } else if (!user) {
      navigate("/login");
    }
  }, [location.pathname, role, navigate, user]);

  return (
    <div>
      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',marginTop: "10px", height: '86.8vh', background:"white",               boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          borderRadius: "3px"}}>
          <Spin size="medium" /> 
        </div>
      }>
        <Routes>
          <Route path="login" element={!user && <Login />} />
          <Route path="task" element={<PrivateRoute><Tasklist /></PrivateRoute>} />
          <Route path="activity" element={<PrivateRoute><TaskActivitylist /></PrivateRoute>} />
          <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="appointment" element={<PrivateRoute><Appointmentlist /></PrivateRoute>} />
          <Route path="task-tansfer" element={<PrivateRoute><TaskTansferRequest /></PrivateRoute>} />
          <Route path="leave-Manage" element={<PrivateRoute><LeaveManagement /></PrivateRoute>} />
          {role === "Admin" && (<Route path="project" element={<PrivateRoute><Myprojects /></PrivateRoute>} />)}
          {role === "Admin" && (<Route path="employee" element={<PrivateRoute><Employeelist /></PrivateRoute>} />)}
          {role === "Admin" && (<Route path="help-desk" element={<PrivateRoute><Helpdesk /></PrivateRoute>} />)}
          {role === "Admin" && (<Route path="planning" element={<PrivateRoute><Planning /></PrivateRoute>} />)}
          
          <Route
            path="/unauthorized"
            element={
              <Result
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page."
                extra={
                  <AppButton
                    type="dashed"
                    onClick={() => navigate("/")}
                    label="Back Home"
                  />
                }
              />
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
};

export default MainRoute;
