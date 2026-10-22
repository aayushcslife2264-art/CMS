import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ShieldCheck,
  Mail,
  CheckCircle2,
  XCircle,
  UserX,
  Phone,
  MapPin,
  Users,
  Shield,
  User,
  CreditCard,
  Eye,
  X,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import { useCMS } from "../context/CMSContext";

export default function SuperAdmin() {
  const navigate = useNavigate();
  const {
    roleRequests,
    updateRoleRequest,
    adminUsers,
    removeAdmin,
    orgSettings,
  } = useCMS();

  const [activeTab, setActiveTab] = useState("requests"); // "requests" | "admins"
  const [adminSearchQuery, setAdminSearchQuery] = useState("");

  // Remove admin confirmation modal state
  const [adminToRemove, setAdminToRemove] = useState(null);
  const [feedbackAlert, setFeedbackAlert] = useState("");
  // ID proof modal state
  const [selectedIdModal, setSelectedIdModal] = useState(null);

  const pendingRequests = useMemo(() => {
    return roleRequests.filter((r) => r.status === "pending");
  }, [roleRequests]);

  const filteredAdmins = useMemo(() => {
    if (!adminUsers) return [];
    if (!adminSearchQuery.trim()) return adminUsers;
    const q = adminSearchQuery.toLowerCase().trim();
    return adminUsers.filter((admin) => {
      return (
        admin.name?.toLowerCase().includes(q) ||
        admin.email?.toLowerCase().includes(q) ||
        admin.department?.toLowerCase().includes(q) ||
        admin.roleTitle?.toLowerCase().includes(q) ||
        admin.office?.toLowerCase().includes(q) ||
        admin.badge?.toLowerCase().includes(q) ||
        String(admin.phone || "").toLowerCase().includes(q)
      );
    });
  }, [adminUsers, adminSearchQuery]);

  const handleAction = (id, action, name) => {
    updateRoleRequest(id, action);
    const msg =
      action === "approve"
        ? `Approved ${name} as Department Admin.`
        : `Rejected Admin request for ${name}.`;
    setFeedbackAlert(msg);
    setTimeout(() => setFeedbackAlert(""), 3000);
  };

  const handleConfirmRemoveAdmin = () => {
    if (adminToRemove) {
      removeAdmin(adminToRemove.id);
      setFeedbackAlert(`Removed admin access for ${adminToRemove.name}.`);
      setAdminToRemove(null);
      setTimeout(() => setFeedbackAlert(""), 3000);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-100 via-white to-indigo-100 font-sans overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-1/4 h-44 w-44 rounded-full bg-sky-200/70 blur-3xl animate-pulse" />
        <div className="absolute top-24 right-10 h-52 w-52 rounded-full bg-indigo-200/70 blur-3xl animate-[pulse_5s_ease-in-out_infinite]" />
        <div className="absolute bottom-8 left-8 h-44 w-44 rounded-full bg-cyan-200/70 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.96)_0,transparent_40%),radial-gradient(circle_at_80%_10%,rgba(191,219,254,0.9)_0,transparent_45%),radial-gradient(circle_at_20%_80%,rgba(221,214,254,0.75)_0,transparent_45%)] opacity-80" />
      </div>

      <div className="relative z-10">
        <TopNav pageTitle="SuperAdmin" />

        <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header Banner - Rich Glassmorphism App Theme */}
          <section
            className="relative rounded-3xl overflow-hidden shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(243,232,255,0.75) 0%, rgba(255,255,255,0.92) 48%, rgba(224,242,254,0.75) 100%)',
              border: '1px solid rgba(216,180,254,0.7)',
            }}
          >
            {/* Ambient Lighting Orbs */}
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-60"
              style={{ background: 'radial-gradient(circle,#c084fc,#818cf8)', filter: 'blur(40px)' }}
            />
            <div
              className="pointer-events-none absolute -left-10 -bottom-10 h-44 w-44 rounded-full opacity-45"
              style={{ background: 'radial-gradient(circle,#7dd3fc,#c7d2fe)', filter: 'blur(36px)' }}
            />

            {/* Gradient Top Accent Bar */}
            <div
              className="absolute top-0 inset-x-0 h-[3px] rounded-t-3xl"
              style={{ background: 'linear-gradient(90deg, #9333ea, #6366f1, #0ea5e9)' }}
            />

            <div className="relative px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase mb-1"
                    style={{
                      background: 'rgba(147,51,234,0.08)',
                      border: '1px solid rgba(147,51,234,0.22)',
                      color: '#7e22ce',
                    }}
                  >
                    <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                    <span>SuperAdmin Authority Matrix</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                    Admin Governance <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#9333ea,#6366f1,#0ea5e9)' }}>Console</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
                    Authorize or revoke administrative jurisdiction privileges and review verified credential proofs across departments.
                  </p>
                </div>

                {/* Ambient Stat Capsules in Header */}
                {/* Ambient Stat Capsules in Header */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-[280px]">
                  <div className="rounded-2xl p-4 bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_25px_rgba(15,23,42,0.09)] transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Pending Requests</span>
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-100/60 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline justify-between">
                      <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">{pendingRequests.length}</span>
                      <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Awaiting Action
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_25px_rgba(15,23,42,0.09)] transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Active Admins</span>
                      <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-100/60 flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline justify-between">
                      <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">{adminUsers?.length || 0}</span>
                      <span className="text-[10px] font-semibold text-purple-600 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                        Authorized Roster
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Feedback Toast */}
          {feedbackAlert && (
            <div className="p-4 bg-emerald-50/95 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in duration-200 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{feedbackAlert}</span>
              </div>
              <button
                onClick={() => setFeedbackAlert("")}
                className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Clean Segmented Tab Switcher with Right-Side Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="inline-flex gap-1.5 p-1.5 bg-white/85 backdrop-blur-xl border border-white/90 rounded-2xl shadow-sm self-start">
              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "requests"
                    ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Active Admin Requests</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === "requests" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {pendingRequests.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("admins")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "admins"
                    ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Active Admins</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === "admins" ? "bg-white/20 text-white" : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {adminUsers?.length || 0}
                </span>
              </button>
            </div>

            {/* Right side search bar for Active Admins */}
            {activeTab === "admins" && (
              <div className="relative w-full sm:w-72 flex items-center bg-white/95 backdrop-blur-xl border border-slate-200/90 hover:border-purple-300 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-200/60 rounded-2xl shadow-sm transition-all">
                <Search className="w-4 h-4 text-purple-500 ml-3.5 flex-shrink-0 pointer-events-none" />
                <input
                  type="text"
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  placeholder="Search admin, dept, email..."
                  className="w-full pl-2.5 pr-8 py-2 text-xs sm:text-sm bg-transparent text-slate-800 placeholder:text-slate-400 font-medium outline-none rounded-2xl"
                />
                {adminSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setAdminSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 🌟 VIEW 1: APPROVE & REJECT ADMIN REQUESTS */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Pending Admin Requests Awaiting Your Decision ({pendingRequests.length})
                  </h3>
                </div>

                {pendingRequests.length === 0 ? (
                  <div className="p-10 bg-white/85 backdrop-blur-xl rounded-3xl border border-white/90 text-center shadow-sm space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">Governance Queue Cleared</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      There are currently no pending role requests. All submitted requests have been processed.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="group relative bg-white/90 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 overflow-hidden"
                      >
                        {/* Top Accent line on card */}
                        <div
                          className="absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'linear-gradient(90deg, #9333ea, #6366f1, #0ea5e9)' }}
                        />

                        <div className="space-y-3 flex-1 min-w-0">
                          {/* User Header Info */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                              {req.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-base font-extrabold text-slate-900 tracking-tight">{req.name}</span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-bold">
                                  Dept: {req.department}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-purple-500" />
                                  {req.email}
                                </span>
                                <span>•</span>
                                <span>Submitted on {req.createdAt}</span>
                              </div>
                            </div>
                          </div>

                          {/* Reason Quote Block */}
                          <p className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60 italic leading-relaxed">
                            "{req.reason}"
                          </p>

                          {/* ID Proof photo trigger */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {req.idProof ? (
                              <button
                                type="button"
                                onClick={() => setSelectedIdModal({ ...req.idProof, applicant: req })}
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 active:scale-95 border border-purple-200 text-xs font-bold text-purple-800 transition cursor-pointer shadow-xs group/btn"
                              >
                                <div className="p-1 rounded-lg bg-white shadow-2xs group-hover/btn:scale-110 transition-transform">
                                  <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                                </div>
                                <span>View Employee ID Proof</span>
                                <span className="text-[10px] text-purple-600 font-medium max-w-[140px] truncate bg-white/80 px-2 py-0.5 rounded-md border border-purple-100">
                                  {req.idProof.name}
                                </span>
                              </button>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400 font-medium">
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                <span>No ID Proof attached</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons: APPROVE & REJECT */}
                        <div className="flex items-center gap-2.5 flex-shrink-0 self-end lg:self-center">
                          <button
                            onClick={() => handleAction(req.id, "approve", req.name)}
                            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve as Admin</span>
                          </button>
                          <button
                            onClick={() => handleAction(req.id, "reject", req.name)}
                            className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 🌟 VIEW 2: ACTIVE ADMINS LIST */}
          {activeTab === "admins" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Current Active Department Administrators ({filteredAdmins.length}{adminSearchQuery.trim() ? ` of ${adminUsers?.length || 0}` : ""})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    You can revoke administrative jurisdiction privileges for any department administrator below.
                  </p>
                </div>
              </div>

              {filteredAdmins.length === 0 ? (
                <div className="p-10 bg-white/85 backdrop-blur-xl rounded-3xl border border-white/90 text-center shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">No Administrators Found</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No active administrator matched "{adminSearchQuery}". Try another keyword or department name.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAdminSearchQuery("")}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition cursor-pointer mt-2"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAdmins.map((admin) => (
                    <div
                      key={admin.id}
                      className="p-5 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)] transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={admin.avatar}
                              alt={admin.name}
                              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-200 group-hover:scale-105 transition-transform"
                            />
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-900">{admin.name}</h4>
                              <p className="text-xs font-bold text-purple-700">{admin.department}</p>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80">
                            {admin.badge || "Admin"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 font-medium">
                          {admin.roleTitle}
                        </p>

                        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                            <span className="truncate">{admin.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                            <span>{admin.phone} ({admin.extension})</span>
                          </div>
                          <div className="flex items-center gap-2 truncate">
                            <MapPin className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                            <span className="truncate">{admin.office}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar: REMOVE ADMIN BUTTON */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Joined {admin.joinedDate}</span>
                        <button
                          onClick={() => setAdminToRemove(admin)}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-rose-200/80 shadow-2xs"
                          title="Revoke and remove admin privileges"
                        >
                          <UserX className="w-3.5 h-3.5 text-rose-600" />
                          <span>Remove Admin</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* 🌟 CONFIRMATION MODAL: REMOVE ADMIN */}
        {adminToRemove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/55 backdrop-blur-md p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                  <UserX className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Remove Administrator?</h3>
                  <p className="text-xs text-slate-500">SuperAdmin Action</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <p>You are removing administrator privileges for:</p>
                <p className="font-bold text-slate-900 text-sm">{adminToRemove.name}</p>
                <p className="text-slate-500">{adminToRemove.department} · {adminToRemove.email}</p>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Once removed, this user will lose all admin permissions and cannot triage or resolve grievances.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdminToRemove(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleConfirmRemoveAdmin}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Confirm Remove Admin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🌟 POP-UP MODAL: EMPLOYEE IDENTITY PROOF / ID CARD (Matches support doc popup) */}
        {selectedIdModal &&
          createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
              style={{
                backgroundColor: "rgba(8,12,28,0.78)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
              onClick={() => setSelectedIdModal(null)}
            >
              <div
                className="relative w-full max-w-xl flex flex-col overflow-hidden rounded-2xl shadow-2xl"
                style={{
                  background: "linear-gradient(145deg,#faf5ff 0%,#ffffff 100%)",
                  border: "1px solid #d8b4fe",
                  maxHeight: "85vh",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div
                  className="flex items-center gap-3 px-5 py-3.5"
                  style={{ background: "linear-gradient(90deg,#7e22ce,#4f46e5)" }}
                >
                  <ShieldCheck size={18} className="text-white/90 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-bold text-white truncate">
                      Employee Identity Verification
                    </h2>
                    <p className="text-[11px] text-purple-200 truncate">
                      {selectedIdModal.applicant?.name} · {selectedIdModal.applicant?.department}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedIdModal(null)}
                    className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Meta details bar */}
                <div className="px-5 py-2.5 bg-purple-50/70 border-b border-purple-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {selectedIdModal.applicant?.name}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-purple-700 font-medium">
                      {selectedIdModal.applicant?.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                      Dept Admin Application
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {selectedIdModal.name}
                    </span>
                  </div>
                </div>

                {/* Body — smart file / image viewer with ledger background */}
                <div
                  className="flex-1 overflow-y-auto flex items-center justify-center p-6 min-h-[220px]"
                  style={{
                    background:
                      "repeating-linear-gradient(0deg,#f8fafc,#f8fafc 28px,#e2e8f0 28px,#e2e8f0 29px)",
                  }}
                >
                  {selectedIdModal.url ? (
                    <div className="flex flex-col items-center gap-3 max-w-full">
                      <img
                        src={selectedIdModal.url}
                        alt={selectedIdModal.name || "Employee ID Card"}
                        className="max-w-full max-h-[50vh] object-contain rounded-2xl shadow-xl border-2 border-white ring-1 ring-purple-200 bg-white"
                      />
                      <div className="flex items-center gap-2">
                        <a
                          href={selectedIdModal.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-700 hover:text-purple-700 text-xs font-semibold shadow-xs border border-slate-200 transition cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                          <span>Open Full Size</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 p-8">
                      <div
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl"
                        style={{
                          background: "rgba(255,255,255,0.95)",
                          border: "1px solid #e9d5ff",
                          boxShadow: "0 8px 32px rgba(147,51,234,0.10)",
                        }}
                      >
                        <FileText size={40} className="text-purple-400" />
                        <p className="text-sm font-semibold text-slate-700 text-center">
                          {selectedIdModal.name || "ID Card Document"}
                        </p>
                        <p className="text-xs text-slate-400 text-center">
                          Preview is not available for this record.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer with decision actions */}
                <div
                  className="px-5 py-3 flex items-center justify-between gap-3"
                  style={{ borderTop: "1px solid #e9d5ff", background: "#fbf8ff" }}
                >
                  <button
                    onClick={() => setSelectedIdModal(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Close
                  </button>

                  {selectedIdModal.applicant && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const req = selectedIdModal.applicant;
                          handleAction(req.id, "reject", req.name);
                          setSelectedIdModal(null);
                        }}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject Request
                      </button>
                      <button
                        onClick={() => {
                          const req = selectedIdModal.applicant;
                          handleAction(req.id, "approve", req.name);
                          setSelectedIdModal(null);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve as Admin
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
}
