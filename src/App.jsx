import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CMSProvider } from "./context/CMSContext";

import AuthForm from "./pages/AuthForm";
import UserDash from "./pages/UserDash";
import UserProfile from "./pages/UserProfile";
import AdminDash from "./pages/AdminDash";
import LandingPage from "./pages/LandingPage";
import U_ComplaintDetail from "./pages/U_ComplaintDetail";
import A_ComplaintDetail from "./pages/A_ComplaintDetail";
import SuperAdmin from "./pages/SuperAdmin";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <CMSProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/Home" replace />} />
          <Route path="/Home" element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/Login" element={<AuthForm />} />
          <Route path="/login" element={<AuthForm />} />

          <Route path="/user" element={<Navigate to="/User/Dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/Admin/Dashboard" replace />} />
          <Route path="/superadmin" element={<Navigate to="/SuperAdmin/Dashboard" replace />} />

          {/* User Routes & Aliases (Requires Login) */}
          <Route
            path="/User/Dashboard"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <UserDash />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <UserDash />
              </ProtectedRoute>
            }
          />
          <Route
            path="/User/Profile"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Profile"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/User/ComplaintDetail/:id"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <U_ComplaintDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/complaintdetail/:id"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                <U_ComplaintDetail />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes & Aliases (Requires Admin or SuperAdmin) */}
          <Route
            path="/Admin/Dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <AdminDash />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <AdminDash />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/Profile"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/ComplaintDetail/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <A_ComplaintDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaintdetail/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <A_ComplaintDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/ComplainDetail/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <A_ComplaintDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaindetail/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <A_ComplaintDetail />
              </ProtectedRoute>
            }
          />

          {/* SuperAdmin Routes & Aliases (Requires SuperAdmin) */}
          <Route
            path="/SuperAdmin/Dashboard"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <SuperAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <SuperAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/SuperAdmin/Profile"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/superadmin/profile"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* 404 Dedicated and Catch-all Route for any nonexistent URL */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </CMSProvider>
  );
}

export default App;
