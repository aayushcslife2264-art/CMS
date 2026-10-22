import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCMS } from "../context/CMSContext";
import {
  Compass,
  ArrowRight,
  Home,
  LayoutDashboard,
  LogIn,
  ShieldAlert,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthLoading, orgSettings } = useCMS();

  // Countdown timer for automatic redirection (5 seconds default)
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [isPaused, setIsPaused] = useState(false);

  // Determine destination based on auth state & role
  const getDestination = () => {
    if (!currentUser) {
      return {
        path: "/Home",
        label: "Landing Page",
        buttonText: "Return to Home Page",
        icon: Home,
      };
    }

    const role = (currentUser.role || "user").toLowerCase();
    if (role === "superadmin") {
      return {
        path: "/SuperAdmin/Dashboard",
        label: "Super Admin Command Center",
        buttonText: "Go to Super Admin Dashboard",
        icon: LayoutDashboard,
      };
    }
    if (role === "admin") {
      return {
        path: "/Admin/Dashboard",
        label: "Department Admin Dashboard",
        buttonText: "Go to Admin Dashboard",
        icon: LayoutDashboard,
      };
    }
    return {
      path: "/User/Dashboard",
      label: "Employee Portal Dashboard",
      buttonText: "Go to My Dashboard",
      icon: LayoutDashboard,
    };
  };

  const destination = getDestination();

  // Automatic countdown and redirect
  useEffect(() => {
    if (isAuthLoading || isPaused) return;

    if (secondsLeft <= 0) {
      navigate(destination.path, { replace: true });
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(destination.path, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, isPaused, isAuthLoading, destination.path, navigate]);

  const DestinationIcon = destination.icon;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-100 via-white to-indigo-100 flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 bg-sky-300/60 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute top-1/2 -right-32 h-96 w-96 bg-indigo-300/60 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5rem] left-1/3 h-80 w-80 bg-cyan-200/50 blur-[90px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Main 404 Glassmorphic Card */}
        <div className="backdrop-blur-2xl bg-white/85 border border-white/90 rounded-3xl p-6 sm:p-10 shadow-[0_25px_70px_rgba(15,23,42,0.12)] text-center">
          
          {/* Top Badge: Organization Branding */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
            <span>{orgSettings?.name || "Organizational CMS"}</span>
          </div>

          {/* Large 404 Graphic Badge */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-indigo-600 rounded-3xl blur-xl opacity-30 transform scale-110" />
            <div className="relative px-7 py-3 rounded-3xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-black text-5xl sm:text-6xl tracking-tight shadow-xl flex items-center gap-3">
              <span>4</span>
              <Compass className="w-12 h-12 sm:w-14 sm:h-14 animate-[spin_10s_linear_infinite] text-sky-200" />
              <span>4</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Page Not Found
          </h1>

          {/* Subtitle / Explanation */}
          <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed max-w-md mx-auto">
            The page requested at{" "}
            <span className="font-mono text-xs sm:text-sm px-2 py-0.5 rounded-md bg-slate-100 text-rose-600 border border-slate-200 font-semibold break-all">
              {location.pathname}
            </span>{" "}
            does not exist, has been removed, or requires authentication.
          </p>

          {/* Redirection Notification & Status */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-sky-50/90 to-indigo-50/90 border border-sky-100 text-left">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-white text-sky-600 flex items-center justify-center shadow-xs border border-sky-100">
                  <DestinationIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Auto-Redirect Active
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Destination: <span className="font-semibold text-sky-700">{destination.label}</span>
                  </p>
                </div>
              </div>

              {/* Pause / Resume Button */}
              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                title={isPaused ? "Resume auto-redirect" : "Pause auto-redirect"}
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
            </div>

            {/* Countdown Progress Bar */}
            <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-indigo-600 h-1.5 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(secondsLeft / 5) * 100}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 mt-2 text-right">
              {isPaused ? (
                <span className="text-amber-600 font-medium">Auto-redirect paused</span>
              ) : (
                <>
                  Redirecting in <span className="font-bold text-slate-800">{secondsLeft}</span> second{secondsLeft !== 1 ? "s" : ""}
                </>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(destination.path, { replace: true })}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl shadow-md bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-semibold text-sm hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 transition active:scale-95 cursor-pointer gap-2"
            >
              <DestinationIcon className="w-4 h-4" />
              <span>{destination.buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!currentUser ? (
              <button
                type="button"
                onClick={() => navigate("/Login")}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition active:scale-95 cursor-pointer gap-2 shadow-xs"
              >
                <LogIn className="w-4 h-4 text-sky-600" />
                <span>Go to Login</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/Home")}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition active:scale-95 cursor-pointer gap-2 shadow-xs"
              >
                <Home className="w-4 h-4 text-slate-500" />
                <span>Visit Landing Page</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-4">
          Need assistance? Contact your designated department administrator or IT helpdesk.
        </p>
      </div>
    </div>
  );
}
