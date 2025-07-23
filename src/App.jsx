// Frontend/src/App.jsx
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Loading from "@/components/Loading";
import CandidateForms from "./pages/CandidateForms";
import EvaluationPage from "./pages/EvaluationPage";

// Lazy imports
const Login = lazy(() => import("./pages/auth/Login"));
const HRDashboard = lazy(() => import("./pages/dashboard/HRDashboard"));
const SuperAdminDashboard = lazy(() => import("./pages/dashboard/SuperAdminDashboard"));
const InterviewerDashboard = lazy(() => import("./pages/dashboard/InterviewerDashboard"));
const HrInterviewerPage = lazy(() => import("./pages/dashboard/HrInterviewerPage"));
const Error = lazy(() => import("./pages/404"));

// **New Public Application Page**
const PublicApplicationWrapper = lazy(() => import("./pages/hr/PublicApplicationWrapper"));

function App() {
  return (
    <main className="App relative">
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
<<<<<<< HEAD

          {/* Public route for candidate form */}
          <Route path="/apply/:token" element={<PublicApplicationWrapper />} />

          {/* Authenticated routes */}
=======
          <Route path="/evaluate/:id" element={<EvaluationPage />} />
          
          {/* All pages that include sidebar/profile go here */}
>>>>>>> a8adf8bd4c26e4b0246a4ffb257a62bc74add984
          <Route path="/*" element={<Layout />}>
            <Route path="hr-dashboard" element={<HRDashboard />} />
            <Route path="superadmin-dashboard" element={<SuperAdminDashboard />} />
            <Route path="superadmin-dashboard/hr-interview" element={<HrInterviewerPage />} />
            <Route path="interviewer-dashboard" element={<InterviewerDashboard />} />
            <Route path="candidate-forms" element={<CandidateForms />} />
            <Route path="*" element={<Error />} />
          </Route>
        </Routes>
      </Suspense>
    </main>
  );
}

export default App;
