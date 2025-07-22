// Frontend/src/App.jsx
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Loading from "@/components/Loading";

// Lazy imports
const Login = lazy(() => import("./pages/auth/Login"));
const HRDashboard = lazy(() => import("./pages/dashboard/HRDashboard"));
const SuperAdminDashboard = lazy(() => import("./pages/dashboard/SuperAdminDashboard"));
const InterviewerDashboard = lazy(() => import("./pages/dashboard/InterviewerDashboard"));
const HrInterviewerPage = lazy(() => import("./pages/dashboard/HrInterviewerPage"));
const Error = lazy(() => import("./pages/404"));

function App() {
  return (
    <main className="App relative">
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Layout />}>
            <Route path="hr-dashboard" element={<HRDashboard />} />
            <Route path="superadmin-dashboard" element={<SuperAdminDashboard />} />
            <Route
              path="superadmin-dashboard/hr-interview"
              element={<HrInterviewerPage />}
            />
            <Route path="interviewer-dashboard" element={<InterviewerDashboard />} />
            <Route path="*" element={<Error />} />
          </Route>
        </Routes>
      </Suspense>
    </main>
  );
}

export default App;
