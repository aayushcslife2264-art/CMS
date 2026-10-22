// src/pages/LandingPage.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  Gavel,
  Shield,
  Users,
} from "lucide-react";

const OrbitDot = ({ delay }) => (
  <motion.div
    initial={{ rotate: 0 }}
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 8, ease: "linear", delay }}
    className="absolute inset-0"
  >
    <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
  </motion.div>
);

const FloatingStat = ({ label, value, top, bottom, left, right }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    className="absolute rounded-full bg-white/80 backdrop-blur-md 
      px-3 py-1 text-[11px] border border-white/80 shadow-lg hidden md:block"
    style={{ top, bottom, left, right }}
  >
    <span className="font-semibold text-slate-900">{label}: </span>
    <span className="text-sky-700 font-bold">{value}</span>
  </motion.div>
);

const LandingPage = () => {
  const navigate = useNavigate();

  // Rotating hero quotes
  const quotes = [
    "Where every concern becomes a clear outcome.",
    "Accountability isn’t optional — it’s built in.",
    "Because transparency should never be a privilege.",
    "Silence fails — structured voice prevails.",
    "A trusted pathway from issue → impact.",
  ];

  const [quoteIndex, setQuoteIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <div className="relative flex min-h-screen w-full items-center overflow-hidden bg-gradient-to-br from-sky-100 via-white to-indigo-200">
      {/* floating BG particles */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-[6px] w-[6px] rounded-full bg-sky-400/50"
          initial={{ opacity: 0.3 }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 4 + (i % 3),
            delay: i * 0.4,
          }}
          style={{
            top: `${(i * 17) % 90}%`,
            left: `${(i * 13) % 95}%`,
          }}
        />
      ))}

      {/* MAIN CONTAINER */}
      <div
        className="
          relative z-10 mx-auto flex w-full max-w-[1400px]
          flex-col md:flex-row md:items-center md:justify-between
          px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 2xl:px-24
          py-10 lg:py-12
          gap-10 lg:gap-16
        "
      >
        {/* LEFT SIDE – TEXT */}
        <div className="w-full max-w-[640px] flex flex-col gap-6">
          {/* Logo + tagline */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white text-[10px] sm:text-xs font-bold shadow-[0_12px_40px_rgba(37,99,235,0.7)]">
              CMS
            </div>
            <div>
              <p className="text-slate-900 font-semibold text-xs sm:text-sm md:text-base">
                Complaint Matrix
              </p>
              <small className="text-slate-500 text-[10px] sm:text-[11px] md:text-xs">
                A calm workspace for outcomes.
              </small>
            </div>
          </div>

          {/* Heading */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="
              text-[1.8rem] 
              sm:text-[2.3rem] 
              lg:text-[3rem] 
              leading-tight 
              font-extrabold 
              text-slate-900
              mb-5
            "
          >
            

            Design for Fair Resolution{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">
              Signal over noise. Always.
            </span>
          </motion.h1>

          {/* Rotating animated quote */}
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-[13px] sm:text-[14px] md:text-[15px] md:font-semibold leading-relaxed min-h-[60px] sm:min-h-[40px] "
            >
              <span className="bg-gradient-to-r from-slate-700 via-slate-900 to-slate-700 bg-clip-text text-transparent">
                {quotes[quoteIndex]}
              </span>
            </motion.p>
          </AnimatePresence>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-3 text-[11px] sm:text-xs md:text-sm ">
            {/* Anonymous or named */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 shadow-sm border border-slate-100 hover:shadow-[0_12px_30px_rgba(15,23,42,0.18)] hover:-translate-y-[2px] transition">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-50 border border-sky-100">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <span className="font-medium text-slate-800">
                Anonymous or named
              </span>
            </div>

            {/* Smart routing */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 shadow-sm border border-slate-100 hover:shadow-[0_12px_30px_rgba(15,23,42,0.18)] hover:-translate-y-[2px] transition">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <span className="font-medium text-slate-800">Smart routing</span>
            </div>

            {/* Traceable outcomes */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 shadow-sm border border-slate-100 hover:shadow-[0_12px_30px_rgba(15,23,42,0.18)] hover:-translate-y-[2px] transition">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <span className="font-medium text-slate-800">
                Traceable outcomes
              </span>
            </div>
          </div>

          {/* CTA button */}
          <div className="pt-2">
            <button
              onClick={() => navigate("/Login")}
              className="mt-3 px-8 sm:px-10 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold shadow-[0_20px_60px_rgba(37,99,235,0.6)] hover:shadow-[0_28px_90px_rgba(37,99,235,0.8)] hover:-translate-y-1 transition"
            >
              Let’s Begin →
            </button>
          </div>
        </div>

        {/* RIGHT — Orbit Engine */}
        <div className="relative mt-8 md:mt-0 md:right-6 lg:right-10 flex justify-center w-full md:w-auto">
          {/* GLOWING RESOLUTION CORE */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="
              relative 
              h-[220px] w-[220px]
              sm:h-[260px] sm:w-[260px]
              lg:h-[320px] lg:w-[320px]
              xl:h-[360px] xl:w-[360px]
              flex items-center justify-center
            "
          >
            {/* outer soft halo */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-100 via-blue-100 to-indigo-100 shadow-[0_0_120px_rgba(59,130,246,0.45)]" />

            {/* big blurred glow */}
            <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-500 opacity-70 blur-[26px]" />

            {/* main circular plate */}
            <div className="relative z-10 h-[160px] w-[160px] sm:h-[200px] sm:w-[200px] lg:h-[240px] lg:w-[240px] xl:h-[260px] xl:w-[260px] rounded-full bg-white/95 border border-sky-100 shadow-[0_18px_55px_rgba(15,23,42,0.22)] flex items-center justify-center">
              {/* subtle inner ring */}
              <div className="h-[125px] w-[125px] sm:h-[155px] sm:w-[155px] lg:h-[190px] lg:w-[190px] xl:h-[205px] xl:w-[205px] rounded-full border border-sky-100/70" />

              {/* text core */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6">
                <p className="text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-slate-400 mb-1">
                  Core loop
                </p>
                <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-slate-900">
                  Raise &nbsp;→&nbsp; Route &nbsp;→&nbsp; Resolve
                </p>
                <p className="mt-1 text-[9px] sm:text-[10px] md:text-[11px] text-slate-500">
                  The Architecture of Trust Begins Here.
                </p>
              </div>
            </div>

            {/* orbit paths (thin rings) */}
            <div className="absolute h-[200px] w-[200px] sm:h-[240px] sm:w-[240px] lg:h-[290px] lg:w-[290px] xl:h-[310px] xl:w-[310px] rounded-full border border-sky-200/60" />
            <div className="absolute h-[220px] w-[220px] sm:h-[270px] sm:w-[270px] lg:h-[310px] lg:w-[310px] xl:h-[330px] xl:w-[330px] rounded-full border border-indigo-200/40" />

            {/* rotating white dots on the orbit */}
            <OrbitDot delay={0} />
            <OrbitDot delay={0.9} />

            {/* Pills: Users / Admins / Integrity / Resolution */}
            <div className="absolute -top-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/95 border border-slate-100 px-2.5 py-1 text-[10px] sm:text-[11px] shadow-sm">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-600" strokeWidth={2.2} />
              <span className="text-slate-700 font-medium">Users</span>
            </div>

            <div className="absolute top-1/2 -left-8 flex -translate-y-1/2 items-center gap-1 rounded-full bg-white/95 border border-slate-100 px-2.5 py-1 text-[10px] sm:text-[11px] shadow-sm">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500" strokeWidth={2.2} />
              <span className="text-slate-700 font-medium">Admins</span>
            </div>

            <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/95 border border-slate-100 px-2.5 py-1 text-[10px] sm:text-[11px] shadow-sm">
              <Gavel className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" strokeWidth={2.2} />
              <span className="text-slate-700 font-medium">Integrity</span>
            </div>

            <div className="absolute top-1/2 -right-12 flex -translate-y-1/2 items-center gap-1 rounded-full bg-white/95 border border-slate-100 px-2.5 py-1 text-[10px] sm:text-[11px] shadow-sm">
              <CheckCircle2
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500"
                strokeWidth={2.2}
              />
              <span className="text-slate-700 font-medium">Resolution</span>
            </div>
          </motion.div>

          {/* Floating Text Stats (desktop / tablet) */}
          <FloatingStat label="Open" value="34" top="10%" left="-5%" />
          <FloatingStat label="In-review" value="8" top="8%" right="-10%" />
          <FloatingStat label="Cleared" value="12" bottom="-12%" right="5%" />
        </div>
      </div>

      {/* Compact stats row on very small screens */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 md:hidden text-[11px] font-semibold text-slate-700 px-4">
        <span>
          Open: <span className="text-sky-700 font-bold">34</span>
        </span>
        <span>
          In-review: <span className="text-sky-700 font-bold">8</span>
        </span>
        <span>
          Cleared: <span className="text-sky-700 font-bold">12</span>
        </span>
      </div>
    </div>
  );
};

export default LandingPage;
