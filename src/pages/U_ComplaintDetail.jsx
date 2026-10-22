import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { useCMS } from "../context/CMSContext";
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  User,
  Mail,
  FileText,
  Send,
  CheckCircle2,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Sparkles,
  AlertCircle,
  ExternalLink,
  X,
} from "lucide-react";
import TopNav from "../components/TopNav";

const U_ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [docModal, setDocModal] = useState(null); // filename string or null
  const { complaints, addComplaintComment, currentUser, getDepartmentOfficer } = useCMS();

  const complaint = complaints.find((c) => c.id === parseInt(id));
  const [newComment, setNewComment] = useState("");
  const [commentAdded, setCommentAdded] = useState(false);

  if (!complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-white to-indigo-100">
        <div className="px-8 py-6 rounded-3xl bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.18)] border border-white/80 text-center space-y-3">
          <p className="font-bold text-slate-800 text-xl">Complaint Not Found</p>
          <p className="text-xs text-slate-500">The ticket #{id} could not be located.</p>
          <button
            onClick={() => navigate("/User/Dashboard")}
            className="px-4 py-2 bg-sky-500 text-white text-xs font-semibold rounded-xl"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const officer = complaint.assignedOfficer || getDepartmentOfficer(complaint.department);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComplaintComment(complaint.id, newComment.trim());
    setNewComment("");
    setCommentAdded(true);
    setTimeout(() => setCommentAdded(false), 2500);
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === "RESOLVED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "IN_PROGRESS") return "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "CLOSED") return "bg-slate-100 text-slate-700 border-slate-200";
    return "bg-sky-50 text-sky-700 border-sky-200";
  };

  return (
    <>
    <div className="relative min-h-screen bg-gradient-to-br from-sky-100 via-white to-indigo-100 font-sans overflow-hidden">
      {/* background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-1/4 h-40 w-40 rounded-full bg-sky-200/70 blur-3xl animate-pulse" />
        <div className="absolute top-24 right-10 h-48 w-48 rounded-full bg-indigo-200/70 blur-3xl animate-[pulse_5s_ease-in-out_infinite]" />
        <div className="absolute bottom-8 left-8 h-40 w-40 rounded-full bg-cyan-200/70 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.95)_0,transparent_40%),radial-gradient(circle_at_80%_10%,rgba(191,219,254,0.9)_0,transparent_45%),radial-gradient(circle_at_20%_80%,rgba(221,214,254,0.7)_0,transparent_45%)] opacity-80" />
      </div>

      <div className="relative z-10">
        <TopNav pageTitle="Ticket Tracking" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header Bar */}
          <header className="flex items-center justify-between bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl shadow-sm px-4 sm:px-5 py-3">
            <button
              className="flex items-center text-slate-700 hover:text-sky-600 text-xs sm:text-sm font-semibold transition cursor-pointer"
              onClick={() => navigate("/User/Dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to Complaints</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Ticket #{complaint.id}</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(complaint.status)}`}>
                {complaint.status?.replace("_", " ")}
              </span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Cols: Main Complaint Body & Timeline */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white/90 border border-white/80 rounded-3xl p-6 sm:p-7 shadow-[0_14px_45px_rgba(15,23,42,0.1)] backdrop-blur-xl space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                      {complaint.department || "General"}
                    </span>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {complaint.category}
                    </span>
                    {complaint.priority && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                        Severity: {complaint.priority}
                      </span>
                    )}
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                    {complaint.title}
                  </h1>

                  <p className="text-xs text-slate-400">
                    Lodged on: {complaint.submittedDate || complaint.date} · Last Updated: {complaint.lastUpdated}
                  </p>
                </div>

                {/* Description Body */}
                <div>
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Incident Details</h3>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                    {complaint.description}
                  </div>
                </div>

                {/* Attachments */}
                {complaint.attachments && complaint.attachments.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Attached Documents</h3>
                    <div className="flex flex-wrap gap-2">
                      {complaint.attachments.map((file, i) => {
                        const name = typeof file === "string" ? file : file.name;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setDocModal(name)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-100 text-xs font-medium text-sky-800 hover:bg-sky-100 hover:border-sky-300 transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}


              </div>

              {/* Timeline Card */}
              <div className="bg-white/90 border border-white/80 rounded-3xl p-6 shadow-[0_14px_45px_rgba(15,23,42,0.1)] backdrop-blur-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  Grievance Progress Timeline
                </h3>

                <div className="space-y-3 border-l-2 border-sky-200 ml-2 pl-4 py-1">
                  {complaint.timeline && complaint.timeline.length > 0 ? (
                    complaint.timeline.map((event, idx) => (
                      <div key={idx} className="relative text-xs space-y-0.5">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-white" />
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-800">{event.action}</p>
                          <span className="text-[10px] text-slate-400">{event.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Actor: {event.by}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No events logged yet.</p>
                  )}
                </div>

                {/* User Follow-up Note Box */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Provide Additional Details or Inquire
                  </h4>

                  {commentAdded && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Your remark has been posted directly to the investigating officer's case feed.
                    </div>
                  )}

                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Type a follow-up remark or question for the officer..."
                      className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Note
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Right 1 Col: 🌟 Assigned Grievance Officer Profile Card */}
            <div className="space-y-4">
              <div className="bg-white/95 border border-white/80 rounded-3xl p-6 shadow-[0_14px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    Assigned Officer
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    On Duty
                  </span>
                </div>

                {/* Officer Avatar & Bio */}
                <div className="text-center space-y-2">
                  <img
                    src={officer.avatar}
                    alt={officer.name}
                    className="w-20 h-20 mx-auto rounded-2xl object-cover ring-4 ring-sky-100 shadow-md"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{officer.name}</h3>
                    <p className="text-xs font-semibold text-sky-700">{officer.role}</p>
                    <p className="text-[11px] text-slate-500">{officer.department}</p>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700 p-2 rounded-xl bg-slate-50">
                    <Clock className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Response SLA</p>
                      <p className="font-semibold text-slate-800">{officer.sla}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-700 p-2 rounded-xl bg-slate-50">
                    <Mail className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Direct Contact</p>
                      <p className="font-medium text-slate-800 truncate">{officer.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-700 p-2 rounded-xl bg-slate-50">
                    <Phone className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Extension & Office</p>
                      <p className="font-medium text-slate-800">{officer.extension} · {officer.office}</p>
                    </div>
                  </div>
                </div>

                {/* 🌟 Clear Escalation & Direct Contact Guidance if no reply within SLA */}
                <div className="pt-2 text-[11px] bg-gradient-to-br from-amber-50/90 via-white to-sky-50/90 p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>No Reply Within Expected Time ({officer.sla})?</span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    If you haven&apos;t received a response within the expected turnaround time, please reach out directly via email or visit the officer&apos;s physical desk:
                  </p>

                  <div className="pt-1 space-y-2">
                    <a
                      href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(officer.email)}&su=${encodeURIComponent(`Follow-up Inquiry: Ticket #${complaint.id} - ${complaint.title}`)}&body=${encodeURIComponent(`Hello ${officer.name},\n\nI am writing regarding complaint #${complaint.id} - "${complaint.title}".\n\nPlease update me on the current status.\n\nThank you.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs transition cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Contact via Email ({officer.email})</span>
                    </a>

                    <div className="flex items-start gap-2 p-2.5 bg-white rounded-xl border border-slate-200 text-[11px]">
                      <MapPin className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                      <div className="text-slate-700 leading-tight">
                        <p className="font-bold text-slate-900">Physical Desk / Office:</p>
                        <p className="text-slate-600">{officer.office}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Hours: {officer.availability}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Document Preview Modal */}
      {docModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(8,12,28,0.78)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={() => setDocModal(null)}
        >
          <div
            className="relative w-full max-w-lg flex flex-col overflow-hidden rounded-2xl shadow-2xl"
            style={{ background: 'linear-gradient(145deg,#f0f9ff 0%,#ffffff 100%)', border: '1px solid #bae6fd', maxHeight: '70vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5" style={{ background: 'linear-gradient(90deg,#0ea5e9,#6366f1)' }}>
              <FileText size={16} className="text-white/80 flex-shrink-0" />
              <h2 className="text-sm font-bold text-white truncate flex-1">{docModal}</h2>
              <button
                onClick={() => setDocModal(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer flex-shrink-0"
              >
                <X size={15} />
              </button>
            </div>
            {/* Body — smart file viewer */}
            <div className="flex-1 overflow-y-auto" style={{ background: 'repeating-linear-gradient(0deg,#f8fafc,#f8fafc 28px,#e2e8f0 28px,#e2e8f0 29px)', minHeight: '200px' }}>
              {(() => {
                const file = complaint?.attachments?.find(f => (typeof f === 'string' ? f : f.name) === docModal);
                const url = file?.url || null;
                const type = file?.type || '';
                if (!url) {
                  // seed data — string filename only
                  return (
                    <div className="flex flex-col items-center justify-center gap-3 p-8 h-full">
                      <div className="flex flex-col items-center gap-3 p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #bae6fd', boxShadow: '0 8px 32px rgba(14,165,233,0.10)' }}>
                        <FileText size={40} className="text-sky-400" />
                        <p className="text-sm font-semibold text-slate-700 text-center">{docModal}</p>
                        <p className="text-xs text-slate-400 text-center">This document is from sample data and cannot be previewed.</p>
                      </div>
                    </div>
                  );
                }
                if (type.startsWith('image/')) {
                  return (
                    <div className="flex items-center justify-center p-4 h-full">
                      <img src={url} alt={docModal} className="max-w-full max-h-full rounded-xl shadow-lg object-contain" style={{ maxHeight: '50vh' }} />
                    </div>
                  );
                }
                if (type === 'application/pdf') {
                  return <iframe src={url} title={docModal} className="w-full" style={{ height: '50vh', border: 'none' }} />;
                }
                // Other file types — show open/download link
                return (
                  <div className="flex flex-col items-center justify-center gap-3 p-8 h-full">
                    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #bae6fd', boxShadow: '0 8px 32px rgba(14,165,233,0.10)' }}>
                      <FileText size={40} className="text-sky-400" />
                      <p className="text-sm font-semibold text-slate-700 text-center">{docModal}</p>
                      <a href={url} download={docModal} className="px-4 py-1.5 rounded-lg text-white text-xs font-semibold cursor-pointer" style={{ background: 'linear-gradient(90deg,#0ea5e9,#6366f1)' }}>Download File</a>
                    </div>
                  </div>
                );
              })()}
            </div>
            {/* Footer */}
            <div className="px-5 py-3 flex justify-end gap-2" style={{ borderTop: '1px solid #e0f2fe', background: '#f0f9ff' }}>
              <button
                onClick={() => setDocModal(null)}
                className="px-4 py-1.5 rounded-lg text-slate-600 text-xs font-medium border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default U_ComplaintDetail;
