// File: src/App.jsx
// The root component that sets up the application's routing.
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";

function App() {
  return (
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
      {/* Add other routes here within the Layout as needed */}
      {/* Example:
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
      */}
    </Routes>
  );
}

export default App;
