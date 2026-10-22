import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useCMS } from "../context/CMSContext";
import { Shield, User, ShieldCheck, ArrowRight, Building2, CheckCircle, Sparkles, X, RefreshCw } from "lucide-react";

const AuthForm = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthLoading, login, register, orgSettings } = useCMS();

  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState("user");
  const [policyModal, setPolicyModal] = useState(null); // 'terms' | 'confidentiality' | null
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // If user is already authenticated, redirect them directly to their role dashboard
  React.useEffect(() => {
    if (currentUser && !isAuthLoading) {
      const role = (currentUser.role || "user").toLowerCase();
      if (role === "superadmin") {
        navigate("/SuperAdmin/Dashboard", { replace: true });
      } else if (role === "admin") {
        navigate("/Admin/Dashboard", { replace: true });
      } else {
        navigate("/User/Dashboard", { replace: true });
      }
    }
  }, [currentUser, isAuthLoading, navigate]);

  const policyContent = {
    terms: {
      title: "Terms of Service",
      sections: [
        { heading: "1. Acceptance of Terms", body: "By accessing or using this CMS platform, you agree to be bound by these Terms of Service. If you do not agree, please refrain from using the system." },
        { heading: "2. Authorized Use", body: "This platform is intended solely for authorized personnel of the organization. You may not share credentials or grant access to unauthorized individuals." },
        { heading: "3. User Responsibilities", body: "You are responsible for maintaining the confidentiality of your login credentials and for all activities conducted under your account." },
        { heading: "4. Data Integrity", body: "Users must ensure that all data entered into the system is accurate and up-to-date. Deliberate entry of false information may result in account suspension." },
        { heading: "5. Prohibited Activities", body: "You may not use this platform to distribute malware, perform unauthorized data extraction, or engage in any activity that disrupts system operations." },
        { heading: "6. Modifications", body: "The organization reserves the right to modify these terms at any time. Continued use of the platform constitutes acceptance of the revised terms." },
        { heading: "7. Termination", body: "Accounts may be suspended or terminated at the discretion of the administration for violations of these terms or organizational policy." },
      ],
    },
    confidentiality: {
      title: "Confidentiality Policy",
      sections: [
        { heading: "1. Purpose", body: "This policy establishes the obligations of all users to protect sensitive organizational and personal data accessed through this platform." },
        { heading: "2. Scope", body: "This policy applies to all employees, contractors, and authorized users who have access to the CMS system and its associated data." },
        { heading: "3. Confidential Information", body: "All data within the CMS — including complaints, user profiles, department records, and administrative actions — is considered confidential and must not be disclosed externally." },
        { heading: "4. Data Handling", body: "Users must handle all data with care, ensuring it is not exported, shared, or stored outside of approved organizational channels without explicit authorization." },
        { heading: "5. Data Breach Reporting", body: "Any suspected or actual data breach must be reported immediately to the system administrator or the designated data protection officer." },
        { heading: "6. Compliance", body: "All users are required to comply with applicable data protection laws and organizational data governance policies." },
        { heading: "7. Consequences of Violation", body: "Breach of confidentiality may result in disciplinary action, account termination, and potential legal proceedings depending on the severity of the violation." },
      ],
    },
  };

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regDepartment, setRegDepartment] = useState("Information & Technology");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");

  const buttonActiveClasses =
    "w-1/2 py-2.5 px-4 rounded-xl text-sm font-semibold text-sky-800 bg-white shadow-md ring-1 ring-sky-300 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-98";
  const buttonInactiveClasses =
    "w-1/2 py-2.5 px-4 rounded-xl text-sm font-medium text-sky-900/80 bg-sky-50/80 hover:bg-sky-100 hover:text-sky-950 transition-all duration-200 cursor-pointer active:scale-98";
  const inputClasses =
    "appearance-none block w-full px-3.5 py-2.5 border border-slate-200 bg-white/90 hover:border-slate-300 hover:bg-white rounded-xl shadow-xs placeholder-slate-400 text-slate-700 outline-none focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-500 sm:text-sm transition-all duration-200";
  const labelClasses = "block text-sm font-medium text-slate-700 text-left";
  const primaryButtonClasses =
    "w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 hover:from-sky-600 hover:via-blue-600 hover:to-indigo-600 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 focus:ring-offset-sky-50 cursor-pointer transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed";

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!loginEmail.trim()) {
      setLoginError("Please enter your organization email address.");
      return;
    }

    setIsLoadingAuth(true);
    try {
      const user = await login(loginEmail, loginPassword, selectedRole);
      if (user.role === "superadmin") {
        navigate("/SuperAdmin/Dashboard");
      } else if (user.role === "admin") {
        navigate("/Admin/Dashboard");
      } else {
        navigate("/User/Dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
      let msg = "Invalid login credentials. Please check your email and password.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        msg = "No account found with this email, or password was incorrect.";
      } else if (err.code === "auth/wrong-password") {
        msg = "Incorrect password. Please verify your credentials.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      } else if (err.message) {
        msg = err.message;
      }
      setLoginError(msg);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError("");
    if (!regEmail.trim() || !regName.trim()) {
      setRegError("Please provide your name and email address.");
      return;
    }
    if (regPassword && regPassword.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }

    setIsLoadingAuth(true);
    try {
      const user = await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        department: regDepartment,
        role: "user",
        password: regPassword,
      });

      navigate("/User/Dashboard");
    } catch (err) {
      console.error("Registration failed:", err);
      let msg = "Registration failed. Please check your details.";
      if (err.code === "auth/email-already-in-use") {
        msg = "This email is already registered. Please sign in instead.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters.";
      } else if (err.message) {
        msg = err.message;
      }
      setRegError(msg);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const Header = () => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate("/Home")}
          className="text-xs text-sky-600 hover:text-sky-800 font-medium inline-flex items-center gap-1 transition"
        >
          ← Back to Overview
        </button>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
          {orgSettings.code}
        </span>
      </div>
      <h2 className="mt-1 text-left text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        {isLogin ? "Welcome Back 👋" : "Join Your Organization"}
      </h2>
      <p className="mt-1.5 text-left text-xs sm:text-sm text-slate-600">
        {isLogin
          ? `Sign in to access and track complaints in ${orgSettings.name}.`
          : `Create your account to submit and manage department grievances.`}
      </p>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-200 via-white to-indigo-200 flex items-center justify-center px-4 sm:px-6 lg:px-10 py-8 overflow-hidden">
      {/* Strong gradient + blur effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-16 h-72 w-72 bg-sky-300/70 blur-[80px] rounded-full animate-pulse" />
        <div className="absolute top-32 -right-20 h-80 w-80 bg-indigo-300/70 blur-[90px] rounded-full animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-3rem] left-1/4 h-72 w-72 bg-cyan-200/70 blur-[85px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_transparent_60%)]" />
      </div>

      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-24 items-center">
        {/* Left Info Panel (Seamless on same background, generous spacing) */}
        <div className="hidden lg:flex flex-col justify-between py-4 pr-2 xl:pr-6 relative">
          <div className="space-y-6 sm:space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-sky-800 border border-white/80 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {orgSettings.name} · CMS Portal
            </div>

            <div>
              <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Fair, transparent &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600">
                  actionable resolution.
                </span>
              </h1>
              <p className="mt-3 text-sm text-slate-600 max-w-md leading-relaxed">
                A centralized portal for staff, faculty, administrators, and leadership to submit, assign, track, and resolve grievances with complete auditability.
              </p>
            </div>

            {/* Enterprise Governance Highlights - Restored in styled container box with interactive hover effects */}
            <div className="mt-4 p-4.5 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50/90 via-sky-50/60 to-indigo-50/80 border border-sky-100/90 shadow-sm space-y-3.5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  Secure Grievance Governance
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200/60 shadow-2xs hover:scale-105 transition-transform duration-200 cursor-default">
                  Active Cloud
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                {/* Confidential Submission Card */}
                <div className="group flex items-start gap-3 p-3 rounded-xl bg-white/95 border border-slate-200/70 hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 group-hover:bg-sky-200 transition-all duration-200">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 group-hover:text-sky-700 transition-colors duration-200">
                      Confidential Submission
                    </p>
                    <p className="text-[11px] text-slate-500">
                      End-to-end tracked lifecycle for every raised grievance
                    </p>
                  </div>
                </div>

                {/* Direct Department Routing Card */}
                <div className="group flex items-start gap-3 p-3 rounded-xl bg-white/95 border border-slate-200/70 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 group-hover:bg-indigo-200 transition-all duration-200">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors duration-200">
                      Direct Department Routing
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Auto-assigned SLA workflows for designated officers
                    </p>
                  </div>
                </div>

                {/* Super Administrator Oversight Card */}
                <div className="group flex items-start gap-3 p-3 rounded-xl bg-white/95 border border-slate-200/70 hover:border-purple-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 group-hover:bg-purple-200 transition-all duration-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors duration-200">
                      Super Administrator Oversight
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Organization-wide audit trails, analytics & role controls
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Tags with Hover Effects */}
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 pt-1">
              <span className="px-3 py-1 rounded-full bg-white/80 hover:bg-white border border-slate-200 hover:border-sky-300 text-slate-600 hover:text-sky-700 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                Role-based workflows
              </span>
              <span className="px-3 py-1 rounded-full bg-white/80 hover:bg-white border border-slate-200 hover:border-sky-300 text-slate-600 hover:text-sky-700 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                Real-time SLA tracking
              </span>
              <span className="px-3 py-1 rounded-full bg-white/80 hover:bg-white border border-slate-200 hover:border-sky-300 text-slate-600 hover:text-sky-700 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                Confidential Audit Trail
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                CMS
              </div>
              <div>
                <p className="font-semibold text-slate-800">
                  {orgSettings.name}
                </p>
                <p className="text-[11px]">
                  Internal Complaint & Grievance Redressal
                </p>
              </div>
            </div>
            <p className="text-[10px]">
              © {new Date().getFullYear()} CMS Portal.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-lg bg-white/95 border border-white/90 rounded-3xl shadow-[0_20px_70px_rgba(15,23,42,0.16)] hover:shadow-[0_25px_80px_rgba(15,23,42,0.2)] backdrop-blur-2xl p-6 sm:p-8 transition-shadow duration-300">
            <Header />

            <div className="mt-5">
              <div className="flex bg-sky-50 p-1.5 rounded-2xl mb-6 border border-sky-100 shadow-sm gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setLoginError("");
                  }}
                  className={isLogin ? buttonActiveClasses : buttonInactiveClasses}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setLoginError("");
                  }}
                  className={!isLogin ? buttonActiveClasses : buttonInactiveClasses}
                >
                  Register
                </button>
              </div>

              {loginError && (
                <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {loginError}
                </div>
              )}

              {isLogin ? (
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <div>
                    <label htmlFor="login-email" className={labelClasses}>
                      Organization Email
                    </label>
                    <div className="mt-1">
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className={inputClasses}
                        placeholder="e.g. akash.admin@cms.org or anmol.hr@cms.org"
                      />
                    </div>

                  </div>

                  <div>
                    <label htmlFor="login-password" className={labelClasses}>
                      Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="login-password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={inputClasses}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>



                  <div className="pt-2">
                    <button type="submit" disabled={isLoadingAuth} className={primaryButtonClasses}>
                      {isLoadingAuth ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                        </span>
                      ) : (
                        `Sign In to ${orgSettings.name}`
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form className="space-y-3.5" onSubmit={handleRegisterSubmit}>
                  {regError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                      {regError}
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className={labelClasses}>Full Name</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className={inputClasses}
                      placeholder="Your Full Name"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClasses}>Email Address</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className={inputClasses}
                        placeholder="you@cms.org"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className={labelClasses}>
                        Contact Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className={inputClasses}
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>



                  {/* Department Dropdown */}
                  <div>
                    <label className={labelClasses}>Department</label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className={`${inputClasses} cursor-pointer`}
                    >
                      {orgSettings.departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Password */}
                  <div>
                    <label className={labelClasses}>Create Password</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className={inputClasses}
                      placeholder="•••••••• (Min. 6 chars)"
                    />
                  </div>

                  <div className="pt-2">
                    <button type="submit" disabled={isLoadingAuth} className={primaryButtonClasses}>
                      {isLoadingAuth ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" /> Creating Account...
                        </span>
                      ) : (
                        "Create Account & Proceed"
                      )}
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-5 text-[11px] text-slate-500 text-center">
                By continuing, you agree to our{" "}
                <span
                  className="text-sky-600 font-medium hover:underline cursor-pointer"
                  onClick={() => setPolicyModal("terms")}
                >
                  Terms of Service
                </span>{" "}
                and{" "}
                <span
                  className="text-sky-600 font-medium hover:underline cursor-pointer"
                  onClick={() => setPolicyModal("confidentiality")}
                >
                  Confidentiality Policy
                </span>
                .
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Modal — rendered via portal so it truly covers the full screen */}
      {policyModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
          style={{ backgroundColor: "rgba(10,15,30,0.70)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          onClick={() => setPolicyModal(null)}
        >
          <div
            className="relative w-full max-w-md flex flex-col overflow-hidden rounded-2xl shadow-2xl"
            style={{ maxHeight: "52vh", background: "linear-gradient(145deg,#f0f9ff 0%,#ffffff 100%)", border: "1px solid #bae6fd" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5" style={{ background: "linear-gradient(90deg,#0ea5e9 0%,#38bdf8 100%)" }}>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {policyContent[policyModal].title}
              </h2>
              <button
                onClick={() => setPolicyModal(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
            {/* Body */}
            <div className="overflow-y-auto px-5 py-4 space-y-3 text-xs text-slate-600" style={{ flex: 1 }}>
              {policyContent[policyModal].sections.map((sec) => (
                <div key={sec.heading}>
                  <p className="font-semibold text-sky-800 mb-0.5 text-[11px] uppercase tracking-wide">{sec.heading}</p>
                  <p className="leading-relaxed text-slate-600">{sec.body}</p>
                </div>
              ))}
            </div>
            {/* Footer */}
            <div className="px-5 py-3 flex justify-end" style={{ borderTop: "1px solid #e0f2fe", background: "#f0f9ff" }}>
              <button
                onClick={() => setPolicyModal(null)}
                className="px-5 py-1.5 rounded-lg text-white text-xs font-semibold transition-colors cursor-pointer"
                style={{ background: "linear-gradient(90deg,#0ea5e9,#38bdf8)" }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AuthForm;
