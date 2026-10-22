import React, { useState, useMemo, useEffect } from "react";
import { Plus, FileText, Search, Filter, Clock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, User, Sparkles, X, RotateCcw } from "lucide-react";
import ComplaintModal from "./CompaintForm";
import TopNav from "../components/TopNav";
import { useCMS, isSampleComplaint } from "../context/CMSContext";
import { useNavigate } from "react-router-dom";

const UserDash = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    isAuthLoading,
    complaints,
    orgSettings,
    getDepartmentOfficer,
    newlyApprovedAdminWelcomes,
    consumeAdminWelcome,
  } = useCMS();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Check if current user has an accepted admin role request notice
  const pendingWelcome = useMemo(() => {
    if (currentUser?.isNewlyApprovedAdmin) {
      return (
        newlyApprovedAdminWelcomes?.find(
          (w) =>
            w.email?.toLowerCase() === currentUser?.email?.toLowerCase() ||
            w.name?.toLowerCase() === currentUser?.name?.toLowerCase()
        ) || {
          name: currentUser.name,
          email: currentUser.email,
          department: currentUser.department || "General Administration",
        }
      );
    }
    return (
      newlyApprovedAdminWelcomes?.find(
        (w) =>
          w.email?.toLowerCase() === currentUser?.email?.toLowerCase() ||
          w.name?.toLowerCase() === currentUser?.name?.toLowerCase()
      ) || null
    );
  }, [currentUser, newlyApprovedAdminWelcomes]);

  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [welcomeSecondsLeft, setWelcomeSecondsLeft] = useState(10);

  // If user is already an admin or superadmin (and not actively reviewing their celebration welcome banner),
  // automatically direct them to their real administrative dashboard!
  useEffect(() => {
    if (!isAuthLoading && currentUser) {
      const userRole = (currentUser.role || "").toLowerCase();
      if (userRole === "superadmin") {
        navigate("/SuperAdmin/Dashboard", { replace: true });
      } else if (userRole === "admin" && !pendingWelcome && !showWelcomeBanner) {
        navigate("/Admin/Dashboard", { replace: true });
      }
    }
  }, [currentUser, isAuthLoading, pendingWelcome, showWelcomeBanner, navigate]);

  useEffect(() => {
    if (!pendingWelcome) {
      setShowWelcomeBanner(false);
      return;
    }

    setShowWelcomeBanner(true);
    setWelcomeSecondsLeft(10);

    const intervalId = setInterval(() => {
      setWelcomeSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timerId = setTimeout(() => {
      setShowWelcomeBanner(false);
      if (consumeAdminWelcome) {
        consumeAdminWelcome(pendingWelcome.email || pendingWelcome.id || pendingWelcome.name);
      }
      navigate("/Admin/Dashboard");
    }, 10000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timerId);
    };
  }, [pendingWelcome, consumeAdminWelcome, navigate]);

  const handleDismissWelcome = () => {
    setShowWelcomeBanner(false);
    if (consumeAdminWelcome && pendingWelcome) {
      consumeAdminWelcome(pendingWelcome.email || pendingWelcome.id || pendingWelcome.name);
    }
    navigate("/Admin/Dashboard");
  };

  // Filter complaints strictly for current user (rejecting all sample test data)
  const myComplaints = useMemo(() => {
    if (!currentUser) return [];
    return complaints.filter((c) => {
      if (isSampleComplaint(c)) return false;
      const userUid = currentUser.uid || currentUser.id;
      return (
        (userUid && c.userId === userUid) ||
        (currentUser.email && c.email?.toLowerCase() === currentUser.email?.toLowerCase())
      );
    });
  }, [complaints, currentUser]);

  // Statistics
  const { total, active, resolved } = useMemo(() => {
    const list = myComplaints;
    const total = list.length;
    const resolved = list.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED").length;
    const active = total - resolved;
    return { total, active, resolved };
  }, [myComplaints]);

  // Filtered list by status and search
  const displayedComplaints = useMemo(() => {
    const baseList = myComplaints;
    return baseList.filter((c) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? c.status === "OPEN" || c.status === "IN_PROGRESS"
          : statusFilter === "resolved"
          ? c.status === "RESOLVED"
          : statusFilter === "closed"
          ? c.status === "CLOSED"
          : c.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchesSearch =
        !searchQuery.trim() ||
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.department?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [myComplaints, statusFilter, searchQuery]);

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === "RESOLVED") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s === "IN_PROGRESS") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (s === "CLOSED") {
      return "bg-slate-100 text-slate-700 border-slate-200";
    }
    return "bg-sky-50 text-sky-700 border-sky-200";
  };

  const getPriorityBadge = (priority) => {
    if (priority === "Urgent") return "bg-rose-100 text-rose-700 border-rose-200";
    if (priority === "High") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-100 via-white to-indigo-100 font-sans overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-80 w-80 bg-sky-300/80 blur-[90px] rounded-full animate-pulse" />
        <div className="absolute top-40 -right-24 h-96 w-96 bg-indigo-300/80 blur-[100px] rounded-full animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-4rem] left-1/3 h-80 w-80 bg-cyan-200/80 blur-[95px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_transparent_60%)]" />
      </div>

      <div className="relative z-10">
        {/* Reusable Universal TopNav */}
        <TopNav
          pageTitle="Employee Portal"
          actionButton={
            <button
              className="flex items-center justify-center px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-xl shadow-md bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white hover:from-sky-600 hover:via-blue-600 hover:to-indigo-600 transition cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Complaint
            </button>
          }
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* 🌟 CELEBRATORY BANNER: WELCOME TO ADMIN COMMUNITY (10s Auto-Dismiss) */}
          {showWelcomeBanner && pendingWelcome && (
            <div
              className="relative overflow-hidden rounded-3xl p-5 sm:p-6 transition-all duration-500 animate-in fade-in slide-in-from-top-4 shadow-[0_20px_60px_rgba(79,70,229,0.18)]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(238,242,255,0.95) 0%, rgba(255,255,255,0.98) 45%, rgba(224,242,254,0.95) 100%)",
                border: "1px solid rgba(165,180,252,0.85)",
              }}
            >
              {/* Top Vibrant Gradient Line */}
              <div
                className="absolute top-0 inset-x-0 h-1.5"
                style={{
                  background:
                    "linear-gradient(90deg, #38bdf8 0%, #6366f1 35%, #a855f7 70%, #ec4899 100%)",
                }}
              />

              {/* Ambient Glowing Orbs */}
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-60"
                style={{
                  background: "radial-gradient(circle, #818cf8, #38bdf8)",
                  filter: "blur(40px)",
                }}
              />
              <div
                className="pointer-events-none absolute -left-10 -bottom-10 h-36 w-36 rounded-full opacity-40"
                style={{
                  background: "radial-gradient(circle, #c084fc, #93c5fd)",
                  filter: "blur(36px)",
                }}
              />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  {/* Celebration Icon Capsule */}
                  <div className="relative shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-100">
                    <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 animate-spin [animation-duration:8s]" />
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-100/90 text-emerald-800 border border-emerald-300/80 shadow-2xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Role Request Approved & Activated
                    </div>

                    <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                      Welcome to Admin Community!{" "}
                      <span
                        className="text-transparent bg-clip-text"
                        style={{
                          backgroundImage:
                            "linear-gradient(90deg, #4f46e5, #0284c7, #9333ea)",
                        }}
                      >
                        Your request has been accepted.
                      </span>
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                      Congratulations{" "}
                      <span className="font-bold text-slate-900">
                        {pendingWelcome.name || currentUser?.name}
                      </span>
                      ! You are now designated as an Administrator for{" "}
                      <span className="font-semibold text-indigo-700">
                        {pendingWelcome.department || "Organization Administration"}
                      </span>
                      . You have full clearance to review, triage, update status, and resolve organization grievances.
                    </p>
                  </div>
                </div>

                {/* Right controls: countdown timer, action button & dismiss */}
                <div className="flex flex-wrap sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 shrink-0 self-end sm:self-center">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 animate-spin [animation-duration:12s]" />
                      <span>Auto-closes in {welcomeSecondsLeft}s</span>
                    </div>

                    <button
                      onClick={handleDismissWelcome}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 hover:text-slate-800 transition cursor-pointer border border-slate-200"
                      title="Dismiss welcome banner"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      handleDismissWelcome();
                      navigate("/Admin/Dashboard");
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <span>Launch Admin Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 10-Second Countdown Progress Bar */}
              <div className="absolute bottom-0 inset-x-0 h-1 bg-indigo-100/60 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${Math.max(0, (welcomeSecondsLeft / 10) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Hero / Overview Card */}
          <section
            className="relative rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(15,23,42,0.14)]"
            style={{ background: 'linear-gradient(135deg,#e0f2fe 0%,#f8faff 45%,#ede9fe 100%)', border: '1px solid rgba(186,230,253,0.7)' }}
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full opacity-60" style={{ background: 'radial-gradient(circle,#7dd3fc,#a5b4fc)', filter: 'blur(48px)' }} />
            <div className="pointer-events-none absolute -left-14 -bottom-10 h-44 w-44 rounded-full opacity-50" style={{ background: 'radial-gradient(circle,#fde68a,#fbcfe8)', filter: 'blur(44px)' }} />
            <div className="absolute top-0 inset-x-0 h-1 rounded-t-3xl" style={{ background: 'linear-gradient(90deg,#0ea5e9,#6366f1,#8b5cf6)' }} />
            <div className="relative px-6 pt-7 pb-6 sm:px-8 sm:pt-8 sm:pb-7">
              <div className="flex flex-col lg:flex-row gap-7 lg:items-center lg:justify-between">
                <div className="space-y-3 flex-1">
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-wide uppercase"
                    style={{ background: 'rgba(14,165,233,0.10)', border: '1px solid rgba(14,165,233,0.25)', color: '#0369a1' }}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    {orgSettings?.name} · Transparent Grievance Routing
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-[2.4rem] font-extrabold tracking-tight leading-tight text-slate-900">
                    Track & resolve{' '}
                    <span className="relative inline-block">
                      <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#0ea5e9,#6366f1)' }}>
                        your complaints
                      </span>
                      <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full opacity-30" style={{ background: 'linear-gradient(90deg,#0ea5e9,#6366f1)' }} />
                    </span>{' '}
                    effortlessly.
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-lg leading-relaxed">
                    Logged in as{' '}
                    <span className="font-semibold text-slate-800 capitalize px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(14,165,233,0.10)' }}>
                      {currentUser?.name}
                    </span>
                    . Every grievance is auto-assigned to the designated officer with SLA tracking.
                  </p>

                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-[280px]">
                  {/* Total Card */}
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className="group relative overflow-hidden rounded-2xl p-4 text-left cursor-pointer transition-all duration-200 backdrop-blur-xl flex flex-col justify-between border bg-gradient-to-br from-sky-50/90 via-sky-50/40 to-blue-50/70 border-sky-200/75 hover:border-sky-300 shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-800">
                        Total
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-white/80 text-sky-600 flex items-center justify-center transition-transform group-hover:scale-105 border border-sky-200/60 shadow-2xs">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between w-full">
                      <span className="text-3xl font-black text-sky-950 tracking-tight leading-none">
                        {total}
                      </span>
                      <span className="text-[10px] font-semibold text-sky-600/80">All Cases</span>
                    </div>
                  </button>

                  {/* Active Card */}
                  <button
                    type="button"
                    onClick={() => setStatusFilter("active")}
                    className="group relative overflow-hidden rounded-2xl p-4 text-left cursor-pointer transition-all duration-200 backdrop-blur-xl flex flex-col justify-between border bg-gradient-to-br from-amber-50/90 via-amber-50/40 to-orange-50/70 border-amber-200/75 hover:border-amber-300 shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
                        Active
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-white/80 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-105 border border-amber-200/60 shadow-2xs">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between w-full">
                      <span className="text-3xl font-black text-amber-950 tracking-tight leading-none">
                        {active}
                      </span>
                      <span className="text-[10px] font-semibold text-amber-700/80">
                        In Triage
                      </span>
                    </div>
                  </button>

                  {/* Resolved Card */}
                  <button
                    type="button"
                    onClick={() => setStatusFilter("resolved")}
                    className="group relative overflow-hidden rounded-2xl p-4 text-left cursor-pointer transition-all duration-200 backdrop-blur-xl flex flex-col justify-between border bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-teal-50/70 border-emerald-200/75 hover:border-emerald-300 shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                        Resolved
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-white/80 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-105 border border-emerald-200/60 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between w-full">
                      <span className="text-3xl font-black text-emerald-950 tracking-tight leading-none">
                        {resolved}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700/80">
                        Completed
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Controls Bar */}
          <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5 p-1 bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl shadow-sm">
              {[
                { id: "all", label: "All Complaints" },
                { id: "active", label: "Active" },
                { id: "resolved", label: "Resolved" },
                { id: "closed", label: "Closed" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    statusFilter === tab.id
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search complaints, officer or dept..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white/90 border border-slate-200/90 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </section>

          {/* Complaints List Section */}
          <section className="space-y-4">
            {displayedComplaints.length === 0 ? (
              <div className="bg-white/90 border border-white/80 rounded-3xl p-10 sm:p-12 shadow-[0_18px_60px_rgba(15,23,42,0.1)] backdrop-blur-2xl min-h-[260px] flex items-center justify-center">
                <div className="text-center max-w-sm">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50/90 border border-sky-100 flex items-center justify-center mx-auto mb-3 text-sky-500 shadow-2xs">
                    {statusFilter !== "all" || searchQuery.trim() ? (
                      <Filter className="w-7 h-7 text-sky-500" />
                    ) : (
                      <FileText className="w-7 h-7 text-sky-500" />
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                    {statusFilter !== "all" || searchQuery.trim()
                      ? "No Active Data in This Filter"
                      : "No Complaints Found"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed">
                    {searchQuery.trim()
                      ? `No complaints match "${searchQuery.trim()}". Try clearing search keywords.`
                      : statusFilter !== "all"
                      ? `There are no ${statusFilter === "closed" ? "closed" : statusFilter === "resolved" ? "resolved" : statusFilter === "active" ? "active" : ""} complaints matching this filter.`
                      : "You haven't lodged any complaints yet. Submit a new complaint to get started."}
                  </p>

                  {statusFilter !== "all" || searchQuery.trim() ? (
                    <button
                      onClick={() => {
                        setStatusFilter("all");
                        setSearchQuery("");
                      }}
                      className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl shadow-md bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white hover:from-sky-600 hover:via-blue-600 hover:to-indigo-600 transition cursor-pointer active:scale-95 gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Filter & View All</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl shadow-md bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white hover:from-sky-600 hover:via-blue-600 hover:to-indigo-600 transition cursor-pointer active:scale-95 gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Submit New Complaint</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {displayedComplaints.map((complaint) => {
                  const officer = complaint.assignedOfficer || getDepartmentOfficer(complaint.department);

                  return (
                    <div
                      key={complaint.id}
                      className="bg-white/95 border border-white/80 rounded-2xl p-5 shadow-[0_14px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl hover:shadow-[0_20px_55px_rgba(15,23,42,0.18)] hover:-translate-y-[2px] transition cursor-pointer flex flex-col justify-between group"
                      onClick={() => navigate(`/User/ComplaintDetail/${complaint.id}`)}
                    >
                      <div>
                        {/* Tags row */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100/80 text-sky-800 border border-sky-200">
                              #{complaint.id}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {complaint.department || "General"}
                            </span>
                            {complaint.priority && (
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                                  complaint.priority
                                )}`}
                              >
                                {complaint.priority}
                              </span>
                            )}
                          </div>

                          <span
                            className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                              complaint.status
                            )}`}
                          >
                            {complaint.status?.replace("_", " ")}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition line-clamp-2">
                          {complaint.title}
                        </h3>

                        {/* Description */}
                        <p className="text-slate-600 text-xs sm:text-sm mt-2 line-clamp-2 leading-relaxed">
                          {complaint.description}
                        </p>

                        {/* Assigned Officer Pill on the Card */}
                        {officer && (
                          <div className="mt-3 p-2 rounded-xl bg-sky-50/80 border border-sky-100 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <img
                                src={officer.avatar}
                                alt={officer.name}
                                className="w-5 h-5 rounded-full object-cover ring-1 ring-sky-300 flex-shrink-0"
                              />
                              <span className="text-[11px] font-medium text-slate-700 truncate">
                                Officer: <strong className="text-slate-900 font-semibold">{officer.name}</strong>
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-sky-700 flex-shrink-0">
                              ⚡ {officer.sla}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {complaint.submittedDate || complaint.date}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sky-600 font-semibold group-hover:translate-x-1 transition">
                          View Details <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <ComplaintModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default UserDash;
