import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  AlertCircle,
  Flame,
  Layers,
  Sparkles,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import { useCMS, isSampleComplaint } from "../context/CMSContext";

const FILTERS = [
  { id: "all", label: "All Cases" },
  { id: "OPEN", label: "Open" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "RESOLVED", label: "Resolved" },
  { id: "CLOSED", label: "Closed" },
];

const AdminDash = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    complaints,
    orgSettings,
    getDepartmentOfficer,
    newlyApprovedAdminWelcomes,
    consumeAdminWelcome,
  } = useCMS();

  const isSuperAdmin = currentUser?.role === "superadmin";
  const adminDept = currentUser?.department || "Information & Technology";
  const officerInfo = getDepartmentOfficer ? getDepartmentOfficer(adminDept) : null;

  const [activeFilter, setActiveFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState(isSuperAdmin ? "all" : adminDept);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Check if current logged in user has a pending "Welcome to Admin Community" acceptance notice
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
          department: currentUser.department || adminDept,
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
  }, [currentUser, newlyApprovedAdminWelcomes, adminDept]);

  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [welcomeSecondsLeft, setWelcomeSecondsLeft] = useState(10);

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
    }, 10000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timerId);
    };
  }, [pendingWelcome, consumeAdminWelcome]);

  const handleDismissWelcome = () => {
    setShowWelcomeBanner(false);
    if (consumeAdminWelcome && pendingWelcome) {
      consumeAdminWelcome(pendingWelcome.email || pendingWelcome.id || pendingWelcome.name);
    }
  };

  // Base complaints: Strictly scoped to the logged-in admin's department (SuperAdmin sees all)
  const scopedComplaints = useMemo(() => {
    const cleanList = complaints.filter((c) => !isSampleComplaint(c));
    if (isSuperAdmin) {
      if (departmentFilter === "all") return cleanList;
      return cleanList.filter(
        (c) => (c.department || "").toLowerCase().trim() === departmentFilter.toLowerCase().trim()
      );
    }

    // Regular Department Admin only sees tickets belonging strictly to their assigned department
    return cleanList.filter(
      (c) => (c.department || "").toLowerCase().trim() === adminDept.toLowerCase().trim()
    );
  }, [complaints, isSuperAdmin, adminDept, departmentFilter]);

  // Real-time counts strictly scoped to this admin's department
  const stats = useMemo(() => {
    const total = scopedComplaints.length;
    const open = scopedComplaints.filter((c) => c.status === "OPEN").length;
    const inProgress = scopedComplaints.filter((c) => c.status === "IN_PROGRESS").length;
    const resolved = scopedComplaints.filter((c) => c.status === "RESOLVED").length;
    const closed = scopedComplaints.filter((c) => c.status === "CLOSED").length;

    return [
      {
        id: "total",
        filterValue: "all",
        label: "Total Queue",
        sublabel: isSuperAdmin ? "All Departments" : `${adminDept.split(" ")[0]} Dept`,
        count: total,
        icon: FileText,
        iconColor: "text-sky-600",
        iconBg: "bg-white/80 text-sky-600 border border-sky-200/60 shadow-2xs",
        cardBg: "bg-gradient-to-br from-sky-50/90 via-sky-50/40 to-blue-50/70 border-sky-200/75 hover:border-sky-300",
        labelColor: "text-sky-800",
        countColor: "text-sky-950",
        sublabelColor: "text-sky-600/80",
      },
      {
        id: "open",
        filterValue: "OPEN",
        label: "Open Triage",
        sublabel: "Needs Review",
        count: open,
        icon: Clock,
        iconColor: "text-blue-600",
        iconBg: "bg-white/80 text-blue-600 border border-blue-200/60 shadow-2xs",
        cardBg: "bg-gradient-to-br from-blue-50/90 via-blue-50/40 to-indigo-50/70 border-blue-200/75 hover:border-blue-300",
        labelColor: "text-blue-800",
        countColor: "text-blue-950",
        sublabelColor: "text-blue-600/80",
      },
      {
        id: "in_progress",
        filterValue: "IN_PROGRESS",
        label: "In Progress",
        sublabel: "Investigation",
        count: inProgress,
        icon: ArrowRight,
        iconColor: "text-amber-600",
        iconBg: "bg-white/80 text-amber-600 border border-amber-200/60 shadow-2xs",
        cardBg: "bg-gradient-to-br from-amber-50/90 via-amber-50/40 to-orange-50/70 border-amber-200/75 hover:border-amber-300",
        labelColor: "text-amber-800",
        countColor: "text-amber-950",
        sublabelColor: "text-amber-700/80",
      },
      {
        id: "resolved",
        filterValue: "RESOLVED",
        label: "Resolved",
        sublabel: "Action Complete",
        count: resolved,
        icon: CheckCircle,
        iconColor: "text-emerald-600",
        iconBg: "bg-white/80 text-emerald-600 border border-emerald-200/60 shadow-2xs",
        cardBg: "bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-teal-50/70 border-emerald-200/75 hover:border-emerald-300",
        labelColor: "text-emerald-800",
        countColor: "text-emerald-950",
        sublabelColor: "text-emerald-700/80",
      },
      {
        id: "closed",
        filterValue: "CLOSED",
        label: "Closed Cases",
        sublabel: "Archived",
        count: closed,
        icon: XCircle,
        iconColor: "text-slate-600",
        iconBg: "bg-white/80 text-slate-600 border border-slate-200/80 shadow-2xs",
        cardBg: "bg-gradient-to-br from-slate-100/90 via-slate-50/50 to-zinc-100/70 border-slate-200/90 hover:border-slate-300",
        labelColor: "text-slate-700",
        countColor: "text-slate-900",
        sublabelColor: "text-slate-500",
      },
    ];
  }, [scopedComplaints, isSuperAdmin, adminDept]);

  // Filtered complaints within scoped list
  const filteredComplaints = useMemo(() => {
    return scopedComplaints.filter((c) => {
      const matchesStatus =
        activeFilter === "all"
          ? true
          : c.status?.toUpperCase() === activeFilter.toUpperCase();

      const matchesCategory =
        categoryFilter === "all"
          ? true
          : (c.category || "").toLowerCase() === categoryFilter.toLowerCase();

      const matchesSearch =
        !searchQuery.trim() ||
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.submittedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(c.id).includes(searchQuery.trim());

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [scopedComplaints, activeFilter, categoryFilter, searchQuery]);

  // Unique categories within this department's complaints
  const availableCategories = useMemo(() => {
    const set = new Set(scopedComplaints.map((c) => c.category).filter(Boolean));
    return Array.from(set);
  }, [scopedComplaints]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-100 via-white to-indigo-100 font-sans overflow-hidden">
      {/* background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-1/4 h-44 w-44 rounded-full bg-sky-200/70 blur-3xl animate-pulse" />
        <div className="absolute top-24 right-10 h-52 w-52 rounded-full bg-indigo-200/70 blur-3xl animate-[pulse_5s_ease-in-out_infinite]" />
        <div className="absolute bottom-8 left-8 h-44 w-44 rounded-full bg-cyan-200/70 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.96)_0,transparent_40%),radial-gradient(circle_at_80%_10%,rgba(191,219,254,0.9)_0,transparent_45%),radial-gradient(circle_at_20%_80%,rgba(221,214,254,0.75)_0,transparent_45%)] opacity-80" />
      </div>

      <div className="relative z-10">
        {/* Reusable Header */}
        <TopNav pageTitle={isSuperAdmin ? "Super Admin Matrix" : `${adminDept} Admin`} />

        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
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
                        {pendingWelcome.department || adminDept}
                      </span>
                      . You have full clearance to review, triage, update status, and resolve organization grievances.
                    </p>
                  </div>
                </div>

                {/* Right controls: countdown timer & dismiss */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 shrink-0 self-end sm:self-center">
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

          {/* Header Banner - Rich Theme Glassmorphism */}
          <section
            className="relative rounded-3xl overflow-hidden shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(224,242,254,0.75) 0%, rgba(255,255,255,0.92) 48%, rgba(237,233,254,0.75) 100%)',
              border: '1px solid rgba(186,230,253,0.8)',
            }}
          >
            {/* Ambient Lighting Orbs */}
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full opacity-60"
              style={{ background: 'radial-gradient(circle,#7dd3fc,#a5b4fc)', filter: 'blur(40px)' }}
            />
            <div
              className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full opacity-45"
              style={{ background: 'radial-gradient(circle,#bfdbfe,#c7d2fe)', filter: 'blur(36px)' }}
            />

            {/* Gradient Top Accent Bar */}
            <div
              className="absolute top-0 inset-x-0 h-[3px] rounded-t-3xl"
              style={{ background: 'linear-gradient(90deg, #0ea5e9, #6366f1, #8b5cf6)' }}
            />

            <div className="relative px-6 py-5 sm:px-8 sm:py-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl lg:text-[1.7rem] font-black text-slate-900 tracking-tight">
                    {isSuperAdmin ? (
                      <>Organization Grievance <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#0ea5e9,#6366f1)' }}>Console</span></>
                    ) : (
                      <>{adminDept} <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#0ea5e9,#6366f1)' }}>Overview</span></>
                    )}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Track, triage, and resolve grievance tickets in real time.
                  </p>
                </div>

                {/* Sleek Theme Status Capsule */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <div
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold"
                    style={{
                      background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(16,185,129,0.25)',
                      color: '#047857',
                      boxShadow: '0 2px 10px rgba(16,185,129,0.08)',
                    }}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span>Active Redressal</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5 Stats Cards — Decent Harmonious Colors, No Active Indicator, Smooth Click Filtering */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {stats.map((stat) => {
              return (
                <button
                  type="button"
                  key={stat.id}
                  onClick={() => setActiveFilter(stat.filterValue)}
                  className={`group relative overflow-hidden flex flex-col justify-between p-4.5 rounded-2xl backdrop-blur-xl transition-all duration-200 text-left cursor-pointer border shadow-xs hover:shadow-md hover:-translate-y-0.5 ${stat.cardBg}`}
                  title={`Filter by ${stat.label}`}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span
                      className={`text-[11px] font-extrabold uppercase tracking-wider transition-colors ${stat.labelColor}`}
                    >
                      {stat.label}
                    </span>
                    <div
                      className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${stat.iconBg}`}
                    >
                      <stat.icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className={`text-3xl font-black tracking-tight leading-none ${stat.countColor}`}>
                      {stat.count}
                    </div>
                    <div
                      className={`mt-1.5 text-[11px] font-medium transition-colors ${stat.sublabelColor}`}
                    >
                      {stat.sublabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </section>

          {/* Filters and Controls Row */}
          <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Status Filter buttons with Scoped Counts */}
            <div className="inline-flex flex-wrap gap-1.5 bg-white/85 backdrop-blur-xl border border-white/80 rounded-2xl p-1.5 shadow-sm">
              {FILTERS.map((filter) => {
                const count =
                  filter.id === "all"
                    ? scopedComplaints.length
                    : scopedComplaints.filter((c) => c.status === filter.id).length;

                return (
                  <button
                    key={filter.id}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition border cursor-pointer flex items-center gap-1.5 ${
                      activeFilter === filter.id
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white border-blue-500 shadow-sm"
                        : "bg-white/90 text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                    onClick={() => setActiveFilter(filter.id)}
                  >
                    <span>{filter.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        activeFilter === filter.id
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Department Scope / Category Filter + Search */}
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              {isSuperAdmin && (
                /* SuperAdmin has clearance across all departments */
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 bg-white/90 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer shadow-sm"
                >
                  <option value="all">All Departments (Global)</option>
                  {orgSettings?.departments?.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              )}

              {/* Category Filter within Department */}
              {availableCategories.length > 1 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 bg-white/90 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer shadow-sm"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}

              {/* Search bar */}
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search submitter or issue..."
                  className="w-full pl-9 pr-3 py-2 bg-white/90 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-sm"
                />
              </div>
            </div>
          </section>

          {/* Departmental Complaints List */}
          <section className="space-y-3.5">
            {filteredComplaints.length === 0 ? (
              <div className="flex items-center justify-center bg-white/90 border border-white/80 rounded-3xl p-12 shadow-[0_18px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center mx-auto mb-3 text-sky-500">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    No Complaints in {isSuperAdmin ? "Selected View" : `${adminDept} Queue`}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {activeFilter !== "all" || categoryFilter !== "all" || searchQuery.trim()
                      ? "There are no tickets matching your active filters in this department. Try clearing filters or changing search keywords."
                      : `Great job! There are currently no pending grievances or requests under the ${adminDept} jurisdiction.`}
                  </p>
                  {(activeFilter !== "all" || categoryFilter !== "all" || searchQuery.trim()) && (
                    <button
                      onClick={() => {
                        setActiveFilter("all");
                        setCategoryFilter("all");
                        setSearchQuery("");
                      }}
                      className="mt-4 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                    >
                      Clear Active Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    onClick={() => navigate(`/Admin/ComplaintDetail/${complaint.id}`)}
                    className="bg-white/95 border border-white/80 rounded-2xl p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl hover:shadow-[0_18px_50px_rgba(15,23,42,0.14)] hover:-translate-y-[2px] transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      {/* Top Badges Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                            #{complaint.id}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                            {complaint.department || "Department"}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500">
                            {complaint.category}
                          </span>
                          {complaint.priority && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                complaint.priority === "Urgent"
                                  ? "bg-rose-100 text-rose-700"
                                  : complaint.priority === "High"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {complaint.priority}
                            </span>
                          )}
                        </div>

                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${
                            complaint.status === "RESOLVED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : complaint.status === "IN_PROGRESS"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : complaint.status === "CLOSED"
                              ? "bg-slate-100 text-slate-700 border-slate-200"
                              : "bg-sky-50 text-sky-700 border-sky-200"
                          }`}
                        >
                          {complaint.status?.replace("_", " ")}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition line-clamp-2 leading-snug">
                        {complaint.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {complaint.description}
                      </p>
                    </div>

                    {/* Bottom Metadata & Action Row */}
                    <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-400">
                      <div className="min-w-0 flex items-center gap-2 truncate">
                        <span className="truncate">
                          By: <strong className="text-slate-700 font-medium">{complaint.submittedBy || complaint.employee}</strong>
                        </span>
                        <span>•</span>
                        <span className="shrink-0">{complaint.submittedDate || complaint.date}</span>
                        {complaint.attachments && complaint.attachments.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-sky-600 font-medium shrink-0">
                              📎 {complaint.attachments.length}
                            </span>
                          </>
                        )}
                      </div>

                      <span className="text-xs font-semibold text-sky-600 group-hover:translate-x-1 transition flex items-center gap-1 shrink-0">
                        Take Action <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDash;
