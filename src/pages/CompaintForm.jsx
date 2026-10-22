import React, { useState } from "react";
import { X, Paperclip, ChevronDown, CheckCircle, ShieldCheck, Clock, User, Phone, MapPin } from "lucide-react";
import { useCMS } from "../context/CMSContext";

const ComplaintModal = ({ isOpen, onClose, onSubmitted = null }) => {
  if (!isOpen) return null;

  const { addComplaint, orgSettings, currentUser, getDepartmentOfficer } = useCMS();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(orgSettings?.categories?.[0] || "Harassment & Workplace Conduct");
  const [department, setDepartment] = useState(currentUser?.department || orgSettings?.departments?.[0] || "Information & Technology");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOfficer, setSubmittedOfficer] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileUpload = (e) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const designatedOfficer = getDepartmentOfficer(department);

      const created = addComplaint({
        title,
        category,
        department,
        priority,
        description,
        files,
      });

      setSubmittedOfficer(designatedOfficer);
      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setTitle("");
        setDescription("");
        setFiles([]);
        onClose();
        if (onSubmitted) onSubmitted(created);
      }, 2000);
    }, 450);
  };

  // Reusable sleek input classes with single crisp blue border on focus (no double ring)
  const fieldClasses =
    "w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl outline-none focus:outline-none focus:ring-0 focus:border-sky-500 focus:bg-white text-sm text-slate-800 placeholder-slate-400 transition-colors duration-150";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/55 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      {/* Outer modal container */}
      <div className="w-full max-w-xl mx-auto rounded-3xl bg-white shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white">
          <div className="relative flex justify-between items-start gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold mb-1">
                <span>{orgSettings?.name}</span> · Grievance Filing
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Submit Formal Complaint
              </h2>
              <p className="text-xs text-sky-50/90 mt-0.5 max-w-sm">
                Confidential grievance registration. Your ticket will be dispatched to the suitable department officer.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-4 bg-gradient-to-b from-white to-sky-50/60">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Complaint Lodged Successfully!</h3>
              <p className="text-xs text-slate-500">Your complaint has been assigned to the department officer below:</p>
            </div>

            {submittedOfficer && (
              <div className="w-full max-w-md p-4 bg-white rounded-2xl shadow-md border border-emerald-100 flex items-center gap-3.5 text-left">
                <img
                  src={submittedOfficer.avatar}
                  alt={submittedOfficer.name}
                  className="w-13 h-13 rounded-2xl object-cover ring-2 ring-emerald-300 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{submittedOfficer.name}</p>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      ⚡ {submittedOfficer.sla}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 font-semibold truncate">{submittedOfficer.role}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {submittedOfficer.office} · {submittedOfficer.extension}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Form without preview before submission */
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4 bg-white max-h-[82vh] overflow-y-auto"
          >
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Complaint Subject / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unresolved payroll discrepancy in Q3 allowance"
                className={fieldClasses}
                required
              />
            </div>

            {/* Department + Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={`${fieldClasses} pr-8 cursor-pointer font-medium appearance-none`}
                  >
                    {orgSettings?.departments?.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`${fieldClasses} pr-8 cursor-pointer appearance-none`}
                  >
                    {orgSettings?.categories?.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Priority Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Severity / Urgency Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "Low", color: "border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100", active: "bg-slate-700 text-white border-slate-700" },
                  { id: "Medium", color: "border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100/60", active: "bg-blue-600 text-white border-blue-600" },
                  { id: "High", color: "border-amber-200 text-amber-700 bg-amber-50/50 hover:bg-amber-100/60", active: "bg-amber-600 text-white border-amber-600" },
                  { id: "Urgent", color: "border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100/60", active: "bg-rose-600 text-white border-rose-600" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                      priority === p.id ? p.active : p.color
                    }`}
                  >
                    {p.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the incident, specific dates, parties involved, and the required outcome..."
                rows="4"
                className={`${fieldClasses} resize-none`}
                required
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supporting Documentation (Optional)
              </label>
              <div
                className="flex flex-col items-center justify-center p-3 border border-dashed border-sky-300 bg-sky-50/40 hover:bg-sky-50 rounded-2xl text-slate-500 hover:border-sky-400 hover:text-sky-600 transition cursor-pointer"
                onClick={() => document.getElementById("complaint-modal-file-upload")?.click()}
              >
                <input
                  type="file"
                  id="complaint-modal-file-upload"
                  className="hidden"
                  multiple
                  onChange={handleFileUpload}
                />
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-white shadow-xs text-sky-600">
                    <Paperclip className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium">Click to attach photos, incident reports, or receipts</span>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1"
                    >
                      <span className="truncate max-w-xs text-slate-700">📄 {file.name || "Evidence_file"}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-rose-500 hover:text-rose-700 font-bold ml-2 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs sm:text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 hover:from-sky-600 hover:via-blue-600 hover:to-indigo-600 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Routing..." : "Submit Complaint"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ComplaintModal;
