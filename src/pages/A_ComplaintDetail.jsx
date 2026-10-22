import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { useCMS } from "../context/CMSContext";
import { ArrowLeft, Clock, Shield, CheckCircle2, User, Mail, Building, FileText, Send, AlertTriangle, X } from "lucide-react";
import TopNav from "../components/TopNav";

const AdminComplaintDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { complaints, updateComplaintStatus, currentUser } = useCMS();

  const complaint = complaints.find((c) => c.id === parseInt(id));

  const [newStatus, setNewStatus] = useState(complaint ? complaint.status : "OPEN");
  const [adminNote, setAdminNote] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [docModal, setDocModal] = useState(null);

  if (!complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-white to-indigo-100">
        <div className="px-8 py-6 rounded-3xl bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.18)] border border-white/80 text-center space-y-3">
          <p className="font-bold text-slate-800 text-xl">Complaint Not Found</p>
          <p className="text-xs text-slate-500">The ticket #{id} does not exist or was removed.</p>
          <button
            onClick={() => navigate("/Admin/Dashboard")}
            className="px-4 py-2 bg-sky-500 text-white text-xs font-semibold rounded-xl"
          >
            Return to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = (e) => {
    e.preventDefault();
    updateComplaintStatus(complaint.id, newStatus, adminNote, complaint.department);
    setAdminNote("");
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
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
      {/* Pastel background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-1/4 h-40 w-40 rounded-full bg-sky-200/70 blur-3xl animate-pulse" />
        <div className="absolute top-24 right-10 h-48 w-48 rounded-full bg-indigo-200/70 blur-3xl animate-[pulse_5s_ease-in-out_infinite]" />
        <div className="absolute bottom-8 left-8 h-40 w-40 rounded-full bg-cyan-200/70 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.95)_0,transparent_40%),radial-gradient(circle_at_80%_10%,rgba(191,219,254,0.9)_0,transparent_45%),radial-gradient(circle_at_20%_80%,rgba(221,214,254,0.7)_0,transparent_45%)] opacity-80" />
      </div>

      <div className="relative z-10">
        <TopNav pageTitle="Triage & Action" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header Bar */}
          <header className="flex items-center justify-between bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl shadow-sm px-4 sm:px-5 py-3">
            <button
              className="flex items-center text-slate-700 hover:text-sky-600 text-xs sm:text-sm font-semibold transition cursor-pointer"
              onClick={() => navigate("/Admin/Dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to Admin Dashboard</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Case ID: #{complaint.id}</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(complaint.status)}`}>
                {complaint.status?.replace("_", " ")}
              </span>
            </div>
          </header>

          {/* Jurisdiction banner for cross-department review */}
          {currentUser?.role === "admin" &&
            complaint.department?.toLowerCase() !== currentUser?.department?.toLowerCase() && (
              <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800 shadow-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Jurisdiction Notice:</strong> This grievance is cataloged under <strong>{complaint.department}</strong>. You are reviewing under <strong>{currentUser.department}</strong> administrative credentials.
                </span>
              </div>
            )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Cols: Complaint Info & Timeline */}
            <div className="lg:col-span-2 space-y-5">
              {/* Primary Complaint Card */}
              <div className="bg-white/90 border border-white/80 rounded-3xl p-6 sm:p-7 shadow-[0_14px_45px_rgba(15,23,42,0.1)] backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                    {complaint.department}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {complaint.category}
                  </span>
                  {complaint.priority && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                      Priority: {complaint.priority}
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {complaint.title}
                </h1>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {complaint.description}
                </div>

                {/* Submitter Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                    <User className="w-4 h-4 text-sky-600" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Lodged By</p>
                      <p className="text-xs font-semibold text-slate-800">{complaint.submittedBy || complaint.employee || "Employee"}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-sky-600" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Email Address</p>
                      <p className="text-xs font-semibold text-slate-800">{complaint.email || "user@cms.org"}</p>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                {complaint.attachments && complaint.attachments.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Attached Documentation</h3>
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

              {/* Resolution & Audit Timeline Card */}
              <div className="bg-white/90 border border-white/80 rounded-3xl p-6 shadow-[0_14px_45px_rgba(15,23,42,0.1)] backdrop-blur-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-600" />
                  Audit Trail & Case History
                </h3>

                <div className="space-y-3">
                  {complaint.timeline && complaint.timeline.length > 0 ? (
                    complaint.timeline.map((event, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-sky-500 mt-1 ring-4 ring-sky-100 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800">{event.action}</span>
                            <span className="text-[11px] text-slate-400">{event.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">By: {event.by}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No previous events logged.</p>
                  )}
                </div>

                {/* Administrative Notes */}
                {complaint.adminNotes && complaint.adminNotes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-800">Official Administrative Remarks</h4>
                    {complaint.adminNotes.map((note, idx) => (
                      <div key={idx} className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-indigo-950">
                          <span>{note.author}</span>
                          <span className="text-[10px] text-indigo-500">{note.date}</span>
                        </div>
                        <p className="text-slate-700">{note.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right 1 Col: Admin Triage Action Box */}
            <div className="space-y-4">
              <div className="bg-white/95 border border-white/80 rounded-3xl p-6 shadow-[0_14px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Admin Action Center</h3>
                </div>

                {isSaved && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Status and admin remarks updated!
                  </div>
                )}

                <form onSubmit={handleStatusUpdate} className="space-y-4">
                  {/* Status update */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Update Ticket Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-400 cursor-pointer shadow-sm"
                    >
                      <option value="OPEN">OPEN (Under Initial Review)</option>
                      <option value="IN_PROGRESS">IN PROGRESS (Assigned / Investigating)</option>
                      <option value="RESOLVED">RESOLVED (Resolution Dispatched)</option>
                      <option value="CLOSED">CLOSED (Archived)</option>
                    </select>
                  </div>

                  {/* Admin Note */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Administrative Remark / Action Taken
                    </label>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="e.g. Investigation completed, replacement unit deployed to Room 302."
                      rows="4"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-sky-400 shadow-sm outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white font-semibold text-xs shadow-md hover:from-sky-600 hover:via-blue-600 hover:to-indigo-600 transition cursor-pointer"
                  >
                    Commit Status & Note
                  </button>
                </form>
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
            <div className="flex-1 overflow-y-auto" style={{ background: 'repeating-linear-gradient(0deg,#f8fafc,#f8fafc 28px,#e2e8f0 28px,#e2e8f0 29px)', minHeight: '200px' }}>
              {(() => {
                const file = complaint?.attachments?.find(f => (typeof f === 'string' ? f : f.name) === docModal);
                const url = file?.url || null;
                const type = file?.type || '';
                if (!url) {
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
            <div className="px-5 py-3 flex justify-end" style={{ borderTop: '1px solid #e0f2fe', background: '#f0f9ff' }}>
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

export default AdminComplaintDetails;
