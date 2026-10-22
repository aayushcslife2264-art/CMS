import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useCMS } from "../context/CMSContext";
import { ShieldCheck, Loader2 } from "lucide-react";

/**
 * ProtectedRoute Component
 * - Displays a sleek loading spinner while Firebase verifies the auth session
 * - If user is unauthenticated, redirects them directly to /Login
 * - If user lacks the required role, redirects them to their authorized dashboard
 */
export default function ProtectedRoute({ children, allowedRoles = null }) {
  const { currentUser, isAuthLoading, orgSettings } = useCMS();
  const location = useLocation();

  // Show a premium branded loader while Firebase verifies session
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="relative backdrop-blur-xl bg-white/80 border border-white/90 p-8 rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.08)] flex flex-col items-center max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 mb-4 animate-pulse">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {orgSettings?.name || "Organizational CMS"}
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Verifying secure session & access credentials...
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Securing environment</span>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect to /Login
  if (!currentUser) {
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  // Role validation if allowedRoles is specified
  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const userRole = (currentUser.role || "user").toLowerCase();
    const isAuthorized = allowedRoles.map((r) => r.toLowerCase()).includes(userRole);

    if (!isAuthorized) {
      // Redirect to their own permitted dashboard
      if (userRole === "superadmin") {
        return <Navigate to="/SuperAdmin/Dashboard" replace />;
      }
      if (userRole === "admin") {
        return <Navigate to="/Admin/Dashboard" replace />;
      }
      return <Navigate to="/User/Dashboard" replace />;
    }
  }

  return children;
}
