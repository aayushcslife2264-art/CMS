import React, { useState } from "react";
import {
  LogOut,
  User,
  LayoutDashboard,
  Mail,
  Calendar,
  Shield,
  ShieldCheck,
  Phone,
  MapPin,
  Edit2,
  CheckCircle2,
  Send,
  Building2,
  ShieldAlert,
  Clock,
  FileText,
  Bell,
  Lock,
  Camera,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Check,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import TopNav from "../components/TopNav";
import { useCMS } from "../context/CMSContext";
import { ROLE_AVATARS } from "../constants/avatars";
import { sendResetEmail, sendUpdateEmailVerification } from "../firebase/authService";

export default function UserProfile() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const {
    currentUser,
    updateProfile,
    submitRoleRequest,
    roleRequests,
    complaints,
    orgSettings,
    logout,
    getDepartmentOfficer,
  } = useCMS();

  const isAdmin = currentUser?.role === "admin" || routerLocation.pathname.toLowerCase().includes("/admin");
  const isSuperAdmin = currentUser?.role === "superadmin" || routerLocation.pathname.toLowerCase().includes("/superadmin");

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "officer" | "security" | "roles"
  const [isEditing, setIsEditing] = useState(false);

  // Edit states (strictly real user inputs)
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [department, setDepartment] = useState(currentUser?.department || "Information & Technology");

  // Security states
  // Change Password via OTP
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdOtpSent, setPwdOtpSent] = useState(false);
  const [pwdOtpInput, setPwdOtpInput] = useState("");
  const [pwdGeneratedOtp, setPwdGeneratedOtp] = useState("");
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [pwdCooldown, setPwdCooldown] = useState(0);

  React.useEffect(() => {
    let timer;
    if (pwdCooldown > 0) {
      timer = setInterval(() => {
        setPwdCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [pwdCooldown]);

  // Change Email
  const [newEmail, setNewEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [emailMsg, setEmailMsg] = useState({ type: "", text: "" });
  const [savedSettingsMsg, setSavedSettingsMsg] = useState(false);

  // Role Request Modal state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [requestedRole, setRequestedRole] = useState("Admin");
  const [roleReason, setRoleReason] = useState("");
  const [roleSubmitted, setRoleSubmitted] = useState(false);
  const [idProof, setIdProof] = useState(null); // { name, url, type, size }
  const [idProofError, setIdProofError] = useState("");

  const handleIdProofChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setIdProofError("Please select a valid image file (PNG, JPG, JPEG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setIdProofError("Image size must be under 5MB.");
      return;
    }
    setIdProofError("");
    const reader = new FileReader();
    reader.onload = () => {
      setIdProof({
        name: file.name,
        url: reader.result,
        type: file.type,
        size: (file.size / 1024).toFixed(1) + " KB",
      });
    };
    reader.readAsDataURL(file);
  };

  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      setDepartment(currentUser.department || "Information & Technology");
    }
  }, [currentUser]);

  // Auto-dismiss password alerts after 5 seconds
  React.useEffect(() => {
    if (passwordMsg.text) {
      const timer = setTimeout(() => {
        setPasswordMsg({ type: "", text: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [passwordMsg]);

  // Auto-dismiss email alerts after 5 seconds
  React.useEffect(() => {
    if (emailMsg.text) {
      const timer = setTimeout(() => {
        setEmailMsg({ type: "", text: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [emailMsg]);

  const roleAvatars = ROLE_AVATARS[currentUser?.role?.toLowerCase() || "user"] || ROLE_AVATARS.user;

  const myComplaints = (complaints || []).filter(
    (c) =>
      c?.userId === currentUser?.id ||
      (c?.email && currentUser?.email && c.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (c?.submittedBy && currentUser?.name && c.submittedBy.toLowerCase() === currentUser.name.toLowerCase())
  );

  const resolvedCount = myComplaints.filter((c) => c?.status === "RESOLVED" || c?.status === "CLOSED").length;
  const activeCount = Math.max(0, myComplaints.length - resolvedCount);

  // Department officer for current user
  const departmentOfficer =
    getDepartmentOfficer(currentUser?.department || "Information & Technology") || {
      name: "Akash Sharma",
      role: "Central Grievance Coordinator",
      department: currentUser?.department || "Information & Technology",
      email: "grievance.lead@cms.org",
      phone: "+91 9123456780",
      extension: "Ext #100",
      office: "Main Administration Block, Room 102",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
      sla: "Within 24 Hours",
      availability: "Mon - Fri · 09:00 AM - 05:00 PM",
      badge: "Lead Officer",
    };

  // User's past role requests and pending status check
  const myRoleRequests = (roleRequests || []).filter((r) => {
    if (!r) return false;
    const reqEmail = (r.email || "").trim().toLowerCase();
    const currEmail = (currentUser?.email || "").trim().toLowerCase();
    if (currEmail && reqEmail && reqEmail === currEmail) return true;
    if (r.userId && (r.userId === currentUser?.uid || r.userId === currentUser?.id)) return true;
    if (r.name && currentUser?.name && r.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) return true;
    return false;
  });

  const pendingRoleRequest = myRoleRequests.find(
    (r) => (r?.status || "").toLowerCase() === "pending"
  );
  const isRoleUpgradePending = Boolean(pendingRoleRequest);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      phone,
      department,
    });
    setIsEditing(false);
  };

  const handleAvatarSelect = (url) => {
    updateProfile({ avatar: url });
  };

  const handleRoleRequestSubmit = (e) => {
    e.preventDefault();
    if (isRoleUpgradePending) return;
    if (!idProof) {
      setIdProofError("Employee ID Card photo is required. Please upload your identity proof.");
      return;
    }
    submitRoleRequest({
      requestedRole,
      department: currentUser?.department || department || "General",
      reason: roleReason,
      idProof,
    });
    setRoleSubmitted(true);
    setTimeout(() => {
      setRoleSubmitted(false);
      setIsRoleModalOpen(false);
      setRoleReason("");
      setIdProof(null);
      setIdProofError("");
    }, 1800);
  };

  // --- Guard: if no user loaded, show a loading/redirect screen instead of blank ---
  if (!currentUser) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-sky-100 via-white to-indigo-100 flex flex-col items-center justify-center gap-4 font-sans">
        <div className="bg-white/90 rounded-3xl p-8 shadow-lg flex flex-col items-center gap-4 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
            CMS
          </div>
          <h2 className="text-lg font-bold text-slate-900">Profile Unavailable</h2>
          <p className="text-sm text-slate-500">Please log in to view your profile.</p>
          <button
            onClick={() => navigate("/Home")}
            className="mt-2 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl shadow-md transition cursor-pointer"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-100 via-white to-indigo-100 font-sans overflow-hidden">
      {/* Background blobs & effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-16 left-1/4 h-44 w-44 rounded-full bg-sky-200/70 blur-3xl animate-pulse" />
        <div className="absolute top-24 right-10 h-52 w-52 rounded-full bg-indigo-200/70 blur-3xl animate-[pulse_5s_ease-in-out_infinite]" />
        <div className="absolute bottom-8 left-8 h-44 w-44 rounded-full bg-cyan-200/70 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.96)_0,transparent_40%),radial-gradient(circle_at_80%_10%,rgba(191,219,254,0.9)_0,transparent_45%),radial-gradient(circle_at_20%_80%,rgba(221,214,254,0.75)_0,transparent_45%)] opacity-80" />
      </div>

      <div className="relative z-10">
        <TopNav pageTitle={isSuperAdmin ? "SuperAdmin Profile" : isAdmin ? "Admin Profile" : "Member Profile"} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-16">
          {/* Top Hero Banner with Cover Photo */}
          <div className="relative rounded-3xl bg-white/95 border border-white/80 shadow-[0_20px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl overflow-hidden">
            {/* Cover Banner (Clean gradient) */}
            <div className="h-36 sm:h-44 w-full bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/30">
                  {orgSettings?.name}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-white text-xs font-semibold shadow-sm ${
                    isSuperAdmin
                      ? "bg-purple-600"
                      : isAdmin
                      ? "bg-indigo-600"
                      : "bg-emerald-600"
                  }`}
                >
                  {isSuperAdmin
                    ? "Super Administrator"
                    : isAdmin
                    ? "Department Admin"
                    : "Active Member"}
                </span>
              </div>
            </div>

            {/* Profile Info Row below cover */}
            <div className="px-6 sm:px-8 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
                {/* Avatar with status indicator */}
                <div className="relative group">
                  <img
                    src={currentUser?.avatar || ROLE_AVATARS[currentUser?.role || "user"]?.[0]?.url || ROLE_AVATARS.user[0].url}
                    alt={currentUser?.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover object-center aspect-square ring-4 ring-white shadow-xl bg-white"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center text-white text-[10px]" title="Active in portal">
                    ✓
                  </div>
                </div>

                {/* Right action buttons */}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-sky-600" />
                    {isEditing ? "Close Editor" : "Edit Profile"}
                  </button>
                  {isSuperAdmin ? (
                    <button
                      onClick={() => navigate("/SuperAdmin/Dashboard")}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      SuperAdmin Console
                    </button>
                  ) : isAdmin ? (
                    <button
                      onClick={() => navigate("/Admin/Dashboard")}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Admin Dashboard
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate("/User/Dashboard")}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                        title="Go to User Dashboard"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        User Dashboard
                      </button>
                      {isRoleUpgradePending ? (
                        <button
                          type="button"
                          disabled
                          className="px-4 py-2 rounded-xl bg-purple-50/90 border border-purple-200 text-purple-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs opacity-85 cursor-not-allowed select-none transition"
                          title="Your role upgrade application has been submitted and is currently frozen pending SuperAdmin review."
                        >
                          <Clock className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                          Upgrade Request Pending
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsRoleModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Request Role Upgrade
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* User Meta */}
              <div className="mt-4 space-y-2 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{currentUser?.name}</h1>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-sky-700">
                  {currentUser?.roleTitle || "Staff Associate"} · <span className="text-slate-600">{currentUser?.department}</span>
                </p>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    <Mail className="w-3.5 h-3.5 text-sky-600" />
                    {currentUser?.email}
                  </span>
                  {currentUser?.phone && (
                    <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <Phone className="w-3.5 h-3.5 text-sky-600" />
                      {currentUser?.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    <Building2 className="w-3.5 h-3.5 text-sky-600" />
                    {currentUser?.department || "Department"}
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" />
                    Joined {currentUser?.joinedDate}
                  </span>
                </div>

                {/* Pending Role Upgrade Status Alert */}
                {isRoleUpgradePending && (
                  <div className="mt-3 p-3 bg-purple-50/90 border border-purple-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-purple-600 animate-pulse" />
                      </div>
                      <div>
                        <span className="font-bold text-purple-900">Role Upgrade Application Under Review</span>
                        <p className="text-[11px] text-purple-700">
                          Applied for Department Admin ({pendingRoleRequest?.department || currentUser?.department}) · SuperAdmin verification in progress.
                        </p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-200 text-purple-800">
                      FROZEN / PENDING
                    </span>
                  </div>
                )}
              </div>

              {/* Edit Drawer */}
              {isEditing && (
                <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-slate-200/70 space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Update Personal Profile</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Pick Avatar:</span>
                      <div className="flex items-center gap-1.5">
                        {roleAvatars.map((av, i) => (
                          <img
                            key={i}
                            src={av.url}
                            alt={av.label}
                            onClick={() => handleAvatarSelect(av.url)}
                            title={av.label}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover object-center aspect-square cursor-pointer ring-2 transition hover:scale-110 ${
                              currentUser?.avatar === av.url ? "ring-sky-500 scale-105" : "ring-transparent hover:ring-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-400"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-sky-400 cursor-pointer"
                      >
                        {orgSettings?.departments?.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Security Section — 2-column format */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

            {/* Change Password via Email Link */}
            <div className="bg-white/95 border border-white/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Lock className="w-4 h-4 text-sky-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Change Password</h3>
                  <p className="text-xs text-slate-500">
                    A secure password reset link will be sent to your email.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
                  <p className="text-xs text-slate-600 mb-3 text-center">
                    Click the button below to receive an email from Firebase containing a secure link to reset your password.
                  </p>
                  <button
                    onClick={async () => {
                      setPwdOtpSent(true);
                      setPasswordMsg({ type: "info", text: "Sending..." });
                      try {
                        await sendResetEmail(currentUser?.email);
                        setPasswordMsg({ type: "success", text: `Password reset email sent to ${currentUser?.email}!` });
                        setPwdCooldown(300);
                      } catch (err) {
                        setPasswordMsg({ type: "error", text: "Failed to send reset email. " + err.message });
                      } finally {
                        setPwdOtpSent(false);
                      }
                    }}
                    disabled={pwdOtpSent || pwdCooldown > 0}
                    className="w-full px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition cursor-pointer"
                  >
                    {pwdCooldown > 0 
                      ? `Resend link in ${Math.floor(pwdCooldown / 60)}:${(pwdCooldown % 60).toString().padStart(2, '0')}`
                      : "Send Password Reset Link"}
                  </button>
                </div>
                {passwordMsg.text && (
                  <p className={`text-xs font-semibold px-3 py-2 rounded-xl border ${
                    passwordMsg.type === "error"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : passwordMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-sky-50 text-sky-700 border-sky-200"
                  }`}>
                    {passwordMsg.text}
                  </p>
                )}
              </div>
            </div>

            {/* Change Email via Firebase Verification Link */}
            <div className="bg-white/95 border border-white/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Mail className="w-4 h-4 text-sky-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Change Email Address</h3>
                  <p className="text-xs text-slate-500">Current: <span className="font-semibold text-slate-700">{currentUser?.email}</span></p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Email Address</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => { setNewEmail(e.target.value); setOtpSent(false); setEmailMsg({ type: "", text: "" }); }}
                      placeholder="Enter new email address"
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 outline-none"
                      disabled={otpSent}
                    />
                    <button
                      onClick={async () => {
                        if (!newEmail || !newEmail.includes("@")) return setEmailMsg({ type: "error", text: "Please enter a valid email." });
                        setOtpSent(true);
                        setEmailMsg({ type: "info", text: "Sending verification link..." });
                        try {
                          await sendUpdateEmailVerification(newEmail);
                          setEmailMsg({ type: "success", text: `Verification link sent to ${newEmail}!` });
                        } catch (err) {
                          if (err.code === 'auth/requires-recent-login' || err.code === 'auth/user-token-expired') {
                            setEmailMsg({ type: "error", text: "For security, changing email requires a recent login. Please log out and log back in." });
                          } else {
                            setEmailMsg({ type: "error", text: "Failed to send link. " + err.message });
                          }
                        } finally {
                          setOtpSent(false);
                        }
                      }}
                      disabled={otpSent}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap"
                    >
                      Verify New Email
                    </button>
                  </div>
                </div>
                {emailMsg.text && (
                  <p className={`text-xs font-semibold px-3 py-2 rounded-xl border ${
                    emailMsg.type === "error"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : emailMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-sky-50 text-sky-700 border-sky-200"
                  }`}>
                    {emailMsg.text}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Role Escalation Modal */}
        {isRoleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/55 backdrop-blur-md p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-slate-900">Request Role Escalation</h3>
                </div>
                <button
                  onClick={() => setIsRoleModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {roleSubmitted ? (
                <div className="p-6 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                  <p className="text-sm font-bold text-slate-800">Role Upgrade Dispatched!</p>
                  <p className="text-xs text-slate-500">
                    Your request has been routed to the SuperAdmin governance matrix for approval.
                  </p>
                </div>
              ) : isRoleUpgradePending ? (
                <div className="p-4 rounded-2xl bg-purple-50/90 border border-purple-200 text-purple-950 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0 text-purple-700">
                      <Clock className="w-4 h-4 text-purple-700 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">Application Frozen &amp; Under Review</h4>
                      <p className="text-[11px] text-purple-700">Submitted on {pendingRoleRequest?.createdAt || "Recently"}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    You have already applied for a role upgrade to <span className="font-bold text-purple-900">Department Admin ({pendingRoleRequest?.department || currentUser?.department})</span>. Your request is currently locked and awaiting SuperAdmin review.
                  </p>
                  {pendingRoleRequest?.reason && (
                    <div className="p-3 bg-white rounded-xl border border-purple-100 text-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Submitted Justification:</span>
                      <p className="text-slate-700 italic">"{pendingRoleRequest.reason}"</p>
                    </div>
                  )}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsRoleModalOpen(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRoleRequestSubmit} className="space-y-3.5">
                  {/* Role being applied for & Auto-fetched Department from User Account */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/80 border border-purple-100">
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Applying For</p>
                        <p className="text-sm font-bold text-purple-900">Department Admin</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Department</p>
                      <p className="text-xs font-bold text-purple-800">
                        {currentUser?.department || "General"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Justification / Reason <span className="text-rose-500">*</span></label>
                    <textarea
                      required
                      value={roleReason}
                      onChange={(e) => setRoleReason(e.target.value)}
                      placeholder="Explain your responsibility and reason for requiring administrative permissions..."
                      rows="3"
                      className="w-full px-3 py-2 border rounded-xl text-xs resize-none"
                    />
                  </div>

                  {/* ID Card Photo / Employee Identity Proof Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Employee ID Card / Identity Proof Photo <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        Mandatory
                      </span>
                    </div>

                    {!idProof ? (
                      <label
                        className={`flex flex-col items-center justify-center gap-2 p-3.5 border-2 border-dashed rounded-2xl cursor-pointer transition group ${
                          idProofError
                            ? "border-rose-300 bg-rose-50/50 hover:border-rose-400"
                            : "border-purple-200 hover:border-purple-400 bg-purple-50/40 hover:bg-purple-50/80"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                            idProofError
                              ? "bg-rose-100 text-rose-600 group-hover:bg-rose-200"
                              : "bg-purple-100 text-purple-600 group-hover:bg-purple-200"
                          }`}
                        >
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-slate-800">
                            Upload Employee ID Card Photo <span className="text-rose-500">*</span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            PNG, JPG, JPEG, WebP · Mandatory for role verification
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIdProofChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex items-center gap-3 p-2.5 bg-purple-50/70 border border-purple-200 rounded-2xl">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-purple-200 flex-shrink-0 bg-white shadow-2xs">
                          <img
                            src={idProof.url}
                            alt="ID Card proof preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {idProof.name}
                            </p>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {idProof.size} · Identity proof photo attached
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIdProof(null);
                            setIdProofError("");
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          title="Remove attached photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {idProofError && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1">
                        {idProofError}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRoleModalOpen(false);
                        setIdProof(null);
                        setIdProofError("");
                      }}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md"
                    >
                      Submit to SuperAdmin
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
