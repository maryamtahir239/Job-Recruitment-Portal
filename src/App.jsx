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
const JobPostings = lazy(() => import("./pages/JobPostings"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const Candidates = lazy(() => import("./pages/Candidates"));
const Applications = lazy(() => import("./pages/Applications"));
const ApplicationDetail = lazy(() => import("./pages/ApplicationDetail"));
const EvaluationPage = lazy(() => import("./pages/EvaluationPage"));
const EvaluationForm = lazy(() => import("./pages/EvaluationForm"));
const CandidateForms = lazy(() => import("./pages/CandidateForms"));
const EvaluatedCandidates = lazy(() => import("./pages/EvaluatedCandidates"));

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

          {/* Public route for candidate form */}
          <Route path="/apply/:token" element={<PublicApplicationWrapper />} />

          {/* All authenticated routes with sidebar/profile go here */}
          <Route path="/*" element={<Layout />}>
            <Route path="dashboard" element={<HRDashboard />} />
            <Route path="hr-dashboard" element={<HRDashboard />} />
            <Route path="job-postings" element={<JobPostings />} />
            <Route path="job-postings/:jobId" element={<JobDetail />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications/:applicationId" element={<ApplicationDetail />} />
            <Route path="superadmin-dashboard" element={<SuperAdminDashboard />} />
            <Route
              path="superadmin-dashboard/hr-interview"
              element={<HrInterviewerPage />}
            />
            <Route path="interviewer-dashboard" element={<InterviewerDashboard />} />
            <Route path="evaluate/:id" element={<EvaluationPage />} />
            <Route path="evaluate/:id/form" element={<EvaluationForm />} />
            <Route path="candidate-forms" element={<CandidateForms />} />
            <Route path="evaluation/evaluated" element={<EvaluatedCandidates />} />
            <Route path="*" element={<Error />} />
          </Route>
        </Routes>
      </Suspense>
    </main>
  );
}

export default App;
