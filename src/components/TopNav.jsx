import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCMS } from "../context/CMSContext";
import { LogOut } from "lucide-react";

export default function TopNav({ pageTitle = "Portal", actionButton = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, orgSettings } = useCMS();

  const handleLogout = () => {
    logout();
    navigate("/Home");
  };

  const getProfileLink = () => {
    if (currentUser?.role === "admin") return "/Admin/Profile";
    if (currentUser?.role === "superadmin") return "/SuperAdmin/Profile";
    return "/User/Profile";
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-2xl bg-white/75 border-b border-white/70 shadow-[0_10px_40px_rgba(15,23,42,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Logo + Branding */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => navigate("/Home")}
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-[0_10px_30px_rgba(59,130,246,0.6)] cursor-pointer hover:scale-105 transition"
            title="Go to Home"
          >
            CMS
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {orgSettings?.name || "Organization CMS"}
              </p>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100/80 text-sky-800 border border-sky-200">
                {pageTitle}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Logged in as <span className="font-semibold text-slate-800 capitalize">{currentUser?.name || "Guest"}</span>
            </p>
          </div>
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center flex-wrap justify-between md:justify-end gap-2 sm:gap-3">

          {/* Action button if provided (e.g. New Complaint) */}
          {actionButton}

          {/* User Profile button */}
          <button
            onClick={() => navigate(getProfileLink())}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition cursor-pointer group shadow-xs ${
              location.pathname.toLowerCase().includes("profile")
                ? "bg-sky-50 border-sky-300 text-sky-800 ring-2 ring-sky-200"
                : "bg-white/90 hover:bg-sky-50 border-slate-200 hover:border-sky-300 text-slate-700"
            }`}
            title="View Profile"
          >
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&h=300&auto=format&fit=crop&crop=faces"}
              alt={currentUser?.name}
              className="w-5 h-5 rounded-full object-cover object-center aspect-square ring-1 ring-sky-300"
            />
            <span className="text-xs font-bold text-slate-800 group-hover:text-sky-700 flex items-center gap-1">
              Profile
            </span>
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 border border-rose-200 rounded-xl bg-rose-50/80 hover:bg-rose-100 transition cursor-pointer"
            title="Logout and return to Home"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

