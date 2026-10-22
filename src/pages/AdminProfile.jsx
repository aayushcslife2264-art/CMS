import React, { useState } from "react";
import {
  UserCog,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Activity,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Settings2,
  LogOut,
  Edit2,
  Building,
  Check,
  FileText,
  Users,
  Shield,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import { useCMS } from "../context/CMSContext";

const AdminProfile = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile, complaints, orgSettings, DEPARTMENT_OFFICERS } = useCMS();

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "roster" | "security"
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [department, setDepartment] = useState(currentUser?.department || "Information & Technology");

  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      setDepartment(currentUser.department || "Information & Technology");
    }
  }, [currentUser]);

  const adminComplaints = complaints.filter(
    (c) => c.department?.toLowerCase() === (currentUser?.department || "").toLowerCase()
  );
  const resolvedCount = adminComplaints.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED").length;
  const activeCount = adminComplaints.length - resolvedCount;

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ name, phone, department });
    setIsEditing(false);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-100 via-white to-indigo-100 font-sans overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-52 w-52 rounded-full bg-sky-200/70 blur-3xl animate-pulse" />
        <div className="absolute top-32 right-10 h-60 w-60 rounded-full bg-indigo-200/70 blur-3xl animate-[pulse_5s_ease-in-out_infinite]" />
        <div className="absolute bottom-10 left-8 h-52 w-52 rounded-full bg-cyan-200/70 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.96)_0,transparent_40%),radial-gradient(circle_at_80%_10%,rgba(191,219,254,0.9)_0,transparent_45%),radial-gradient(circle_at_20%_80%,rgba(221,214,254,0.75)_0,transparent_45%)] opacity-80" />
      </div>

      <div className="relative z-10 w-full">
        <TopNav pageTitle="Admin Profile" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Top Hero Banner with Cover */}
          <div className="relative rounded-3xl bg-white/95 border border-white/80 shadow-[0_20px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl overflow-hidden">
            <div className="h-36 sm:h-44 w-full bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/30">
                  {orgSettings?.name}
                </span>
                <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow-sm">
                  Department Admin
                </span>
              </div>
            </div>

            <div className="px-6 sm:px-8 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
                <div className="relative group">
                  <img
                    src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"}
                    alt={currentUser?.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-white shadow-xl bg-white"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 ring-2 ring-white flex items-center justify-center text-white text-[10px]" title="Admin Level 3">
                    ★
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                    {isEditing ? "Close Editor" : "Edit Details"}
                  </button>
                  <button
                    onClick={() => navigate("/Admin/Dashboard")}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Go to Admin Dashboard
                  </button>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="mt-4 space-y-2 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{currentUser?.name}</h1>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-indigo-700">
                  {currentUser?.roleTitle || "Department Administrator"} · <span className="text-slate-600">{currentUser?.department}</span>
                </p>

                {/* Info row */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    {currentUser?.email}
                  </span>
                  {currentUser?.phone && (
                    <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <Phone className="w-3.5 h-3.5 text-indigo-600" />
                      {currentUser?.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    {currentUser?.department || "Department"}
                  </span>
                </div>
              </div>

              {/* Edit Drawer */}
              {isEditing && (
                <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-slate-200/70 space-y-4 animate-in fade-in duration-200">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Edit Administrator Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Department</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-400 cursor-pointer"
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
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
                    >
                      Save Admin Details
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/90 border border-white/80 shadow-sm text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Department Queue</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{adminComplaints.length}</p>
            </div>
            <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-100 shadow-sm text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Active Investigations</span>
              <p className="text-3xl font-black text-amber-800 mt-1">{activeCount}</p>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50/90 border border-emerald-100 shadow-sm text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Resolved & Closed</span>
              <p className="text-3xl font-black text-emerald-800 mt-1">{resolvedCount}</p>
            </div>
          </div>

          {/* Officer Directory Grid */}
          <div className="bg-white/95 border border-white/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Organization Grievance Officers Roster</h3>
                <p className="text-xs text-slate-500">Authorized personnel handling case resolutions by department.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {Object.entries(DEPARTMENT_OFFICERS).map(([dept, officer], idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 flex items-start gap-3">
                  <img
                    src={officer.avatar}
                    alt={officer.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{officer.name}</p>
                    <p className="text-[11px] font-semibold text-indigo-700 truncate">{officer.department}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{officer.office} · {officer.extension}</p>
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-1">
                      SLA: {officer.sla}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
