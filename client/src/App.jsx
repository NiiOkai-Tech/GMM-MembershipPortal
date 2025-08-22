// File: src/App.jsx
// The root component that sets up the application's routing.
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";
import HierarchyPage from "./pages/HierarchyPage";
import MembersPage from "./pages/MembersPage";
import AddMemberPage from "./pages/AddMemberPage";
import MemberDetailsPage from "./pages/MemberDetailsPage";
import EditMemberPage from "./pages/EditMemberPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import ToastContainer from "./components/ui/ToastContainer";
import AttendancePage from "./pages/AttendancePage";
import MeetingAttendancePage from "./pages/MeetingAttendancePage";
import ContributionsPage from "./pages/ContributionsPage";

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hierarchy"
          element={
            <ProtectedRoute>
              <Layout>
                <HierarchyPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <ReportsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Layout>
                <AttendancePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <MeetingAttendancePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contributions"
          element={
            <ProtectedRoute>
              <Layout>
                <ContributionsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Layout>
                <MembersPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/members/new"
          element={
            <ProtectedRoute>
              <Layout>
                <AddMemberPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/members/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <MemberDetailsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/members/:id/edit"
          element={
            <ProtectedRoute>
              <Layout>
                <EditMemberPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
