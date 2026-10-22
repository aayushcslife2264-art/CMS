import React, { createContext, useContext, useState, useEffect } from "react";
import { isConfigured, configSource } from "../firebase/config";
import {
  subscribeComplaints,
  addComplaintToFirestore,
  updateComplaintInFirestore,
  saveUserProfileToFirestore,
  subscribeRoleRequests,
  addRoleRequestToFirestore,
  updateRoleRequestInFirestore,
  subscribeAdmins,
  addAdminToFirestore,
  deleteAdminFromFirestore,
  subscribeOrgSettings,
  updateOrgSettingsInFirestore,
  seedInitialDataToFirestore,
  deleteComplaintFromFirestore,
  purgeSampleComplaintsFromFirestore,
  promoteUserRoleInFirestore,
  purgeAdminFromUserRolesInFirestore,
  migrateAndSyncAllUsersCollection,
} from "../firebase/firestoreService";
import {
  registerUser,
  loginUser,
  logoutUser,
  subscribeToAuthChanges,
} from "../firebase/authService";
import {
  ROLE_AVATARS,
  getDefaultAvatarForRole,
  sanitizeAvatar,
} from "../constants/avatars";

const CMSContext = createContext(null);

const STORAGE_KEYS = {
  USER: "cms_live_user_v2",
  COMPLAINTS: "cms_live_complaints_v2",
  ROLE_REQUESTS: "cms_live_role_requests_v2",
  ORG_SETTINGS: "cms_live_org_settings_v2",
  ADMINS: "cms_live_admin_roster_v2",
  ADMIN_WELCOMES: "cms_live_admin_welcomes_v2",
};

// Check if a complaint is sample testing data
export const isSampleComplaint = (c) => {
  if (!c) return false;
  const title = (c.title || "").toLowerCase();
  const desc = (c.description || "").toLowerCase();
  const date = (c.submittedDate || c.date || "").toString();
  return (
    title.includes("harassment and hostile conduct") ||
    title.includes("delayed overtime reimbursement") ||
    title.includes("hostel mess hygiene") ||
    title.includes("air conditioning failure") ||
    title.includes("hostile work environment") ||
    title.includes("library book requisition") ||
    title.includes("wifi network") ||
    title.includes("gateway outage") ||
    desc.includes("inappropriate and dismissive remarks") ||
    desc.includes("reverse osmosis water filtration") ||
    desc.includes("approved travel allowance claim") ||
    date.includes("2025") ||
    (Number(c.id) >= 1 && Number(c.id) <= 12 && String(c.userId || "").startsWith("usr_00"))
  );
};

// Department Assigned Grievance Officers Directory
export const DEPARTMENT_OFFICERS = {
  "Information & Technology": {
    name: "Akash Sharma",
    role: "Senior IT Systems Admin & Compliance Officer",
    department: "Information & Technology",
    email: "akash.admin@cms.org",
    phone: "+91 9123456780",
    extension: "Ext #402",
    office: "Tech Hub, 4th Floor, Room 410",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    sla: "Within 12 Hours",
    availability: "Mon - Fri · 09:00 AM - 06:00 PM",
    badge: "Level 3 IT Lead",
  },
  "Human Resources": {
    name: "Anmol Aggarwal",
    role: "HR Ombudsman & Employee Relations Lead",
    department: "Human Resources",
    email: "anmol.hr@cms.org",
    phone: "+91 9811223344",
    extension: "Ext #108",
    office: "Executive Wing, Floor 2, Room 204",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
    sla: "Within 24 Hours",
    availability: "Mon - Fri · 10:00 AM - 05:00 PM",
    badge: "Certified Mediator",
  },
  "Student Affairs": {
    name: "Dr. Meenakshi Sundaram",
    role: "Dean of Student Welfare & Grievance Chairperson",
    department: "Student Affairs",
    email: "dean.student@cms.org",
    phone: "+91 9877001122",
    extension: "Ext #204",
    office: "Student Union Block, Room 101",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
    sla: "Within 24 Hours",
    availability: "Mon - Sat · 09:30 AM - 04:30 PM",
    badge: "Faculty Ombudsman",
  },
  "Facilities & Maintenance": {
    name: "Rajeshwar Nair",
    role: "Chief Infrastructure & Safety Officer",
    department: "Facilities & Maintenance",
    email: "rajeshwar.fac@cms.org",
    phone: "+91 9922334455",
    extension: "Ext #305",
    office: "Facilities Command Center, Ground Floor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    sla: "Emergency: 2h / Standard: 24h",
    availability: "24/7 Operations Duty Officer",
    badge: "Safety Inspector",
  },
  "Finance & Accounts": {
    name: "Sunita Kapoor",
    role: "Financial Comptroller & Audit Officer",
    department: "Finance & Accounts",
    email: "sunita.fin@cms.org",
    phone: "+91 9711556677",
    extension: "Ext #512",
    office: "Accounts Wing, Floor 3, Room 315",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=200&auto=format&fit=crop",
    sla: "Within 48 Hours",
    availability: "Mon - Fri · 10:00 AM - 05:30 PM",
    badge: "Chief Auditor",
  },
  "Legal & Compliance": {
    name: "Adv. Vikram Sethi",
    role: "Chief Legal Counsel & Anti-Harassment Officer",
    department: "Legal & Compliance",
    email: "vikram.legal@cms.org",
    phone: "+91 9844112233",
    extension: "Ext #601",
    office: "Legal Chambers, 5th Floor, Suite 502",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    sla: "Confidential Review: 24h",
    availability: "Mon - Fri · 09:00 AM - 06:00 PM",
    badge: "Ethics Ombudsman",
  },
};

export const INITIAL_ADMINS = [];

export const getDepartmentOfficer = (departmentName) => {
  if (!departmentName) return DEPARTMENT_OFFICERS["Information & Technology"];
  return (
    DEPARTMENT_OFFICERS[departmentName] || {
      name: "Akash Sharma",
      role: "Central Grievance Coordinator",
      department: departmentName,
      email: "grievance.lead@cms.org",
      phone: "+91 9123456780",
      extension: "Ext #100",
      office: "Main Administration Block, Room 102",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
      sla: "Within 24 Hours",
      availability: "Mon - Fri · 09:00 AM - 05:00 PM",
      badge: "Lead Officer",
    }
  );
};

// Default organization seed data
const DEFAULT_ORG = {
  name: "CMS Organisation",
  code: "CMS-HQ",
  departments: [
    "Information & Technology",
    "Human Resources",
    "Student Affairs",
    "Facilities & Maintenance",
    "Finance & Accounts",
    "Legal & Compliance",
  ],
  categories: [
    "Harassment & Workplace Conduct",
    "IT & System Failure",
    "Facilities & Safety Violation",
    "Salary & Compensation",
    "Policy Breach",
    "Administrative Grievance",
    "Other",
  ],
};

export const DEMO_USERS = {
  user: null,
  admin: null,
  superadmin: null,
};

export const INITIAL_COMPLAINTS = [];
export const INITIAL_ROLE_REQUESTS = [];

export const CMSProvider = ({ children }) => {
  // Purge any stale legacy demo keys from previous local testing
  useEffect(() => {
    const legacyKeys = [
      "cms_current_user",
      "cms_complaints_data",
      "cms_role_requests_data",
      "cms_admin_roster",
      "cms_newly_approved_admin_welcomes",
      "cms_complaints_v3",
      "cms_demo_complaints",
      "cms_demo_admins",
      "cms_live_user_v1",
      "cms_live_complaints_v1",
      "cms_live_role_requests_v1",
      "cms_live_admin_roster_v1",
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
    purgeSampleComplaintsFromFirestore();
  }, []);

  // 1. Current User — restored from live storage session or null (strictly preset photo avatars)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.id || parsed.uid) && parsed.role) {
          const cleanAvatar = sanitizeAvatar(parsed.avatar, parsed.role, parsed.email || parsed.name || parsed.id);
          if (parsed.avatar !== cleanAvatar) {
            parsed.avatar = cleanAvatar;
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsed));
          }
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isAuthLoading, setIsAuthLoading] = useState(isConfigured);

  // 2. Complaints List — live complaints strictly filtered against any sample data
  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((c) => !isSampleComplaint(c));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // 3. Role Requests — live role requests (empty by default)
  const [roleRequests, setRoleRequests] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROLE_REQUESTS);
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  // 4. Org Settings
  const [orgSettings, setOrgSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORG_SETTINGS);
      if (saved) {
        return JSON.parse(saved);
      }
      return DEFAULT_ORG;
    } catch {
      return DEFAULT_ORG;
    }
  });

  // 5. Active Admins Roster — live admins
  const [adminUsers, setAdminUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMINS);
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  // 6. Newly Approved Admin Welcomes (to notify newly accepted admins upon login/dashboard view)
  const [newlyApprovedAdminWelcomes, setNewlyApprovedAdminWelcomes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_WELCOMES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const consumeAdminWelcome = (identifier) => {
    if (!identifier) return;
    setNewlyApprovedAdminWelcomes((prev) => {
      const updated = prev.filter(
        (item) =>
          item.email?.toLowerCase() !== identifier?.toLowerCase() &&
          item.id !== identifier &&
          item.name?.toLowerCase() !== identifier?.toLowerCase()
      );
      localStorage.setItem(STORAGE_KEYS.ADMIN_WELCOMES, JSON.stringify(updated));
      return updated;
    });

    setCurrentUser((prev) => {
      if (!prev || !prev.isNewlyApprovedAdmin) return prev;
      const next = { ...prev };
      delete next.isNewlyApprovedAdmin;
      return next;
    });
  };

  // Sync to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE_REQUESTS, JSON.stringify(roleRequests));
  }, [roleRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORG_SETTINGS, JSON.stringify(orgSettings));
  }, [orgSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_WELCOMES, JSON.stringify(newlyApprovedAdminWelcomes));
  }, [newlyApprovedAdminWelcomes]);

  // Real-time Firestore synchronization when Firebase is configured
  useEffect(() => {
    if (!isConfigured) return;

    console.log("[Firebase Sync] Attaching Firestore real-time listeners...");
    // Auto-migrate and synchronize 'all_users' master collection and purge legacy 'user_roles'
    migrateAndSyncAllUsersCollection().catch(() => {});

    // 1. Complaints Listener (strictly live complaints; automatically prunes any sample documents)
    const unsubComplaints = subscribeComplaints(
      (remoteComplaints) => {
        const cleanComplaints = (remoteComplaints || []).filter((c) => {
          if (isSampleComplaint(c)) {
            // Asynchronously delete sample testing document from Firestore so it never returns
            deleteComplaintFromFirestore(c.id);
            return false;
          }
          return true;
        });
        setComplaints(cleanComplaints);
      },
      (err) => console.error("[Firebase Sync] Complaints error:", err)
    );

    // 2. Role Requests Listener
    const unsubRoles = subscribeRoleRequests(
      (remoteRoles) => {
        if (remoteRoles && remoteRoles.length > 0) {
          setRoleRequests(remoteRoles);
        }
      },
      (err) => console.error("[Firebase Sync] Roles error:", err)
    );

    // 3. Admins Roster Listener
    const unsubAdmins = subscribeAdmins(
      (remoteAdmins) => {
        if (remoteAdmins && remoteAdmins.length > 0) {
          setAdminUsers(remoteAdmins);
          // Automatically purge any admins from 'user_roles' and 'users' collections in Firestore
          remoteAdmins.forEach((admin) => {
            const adminId = admin.uid || admin.id || admin.email;
            if (adminId) {
              purgeAdminFromUserRolesInFirestore(adminId, admin.email).catch(() => {});
            }
          });
        }
      },
      (err) => console.error("[Firebase Sync] Admins error:", err)
    );

    // 4. Org Settings Listener
    const unsubOrg = subscribeOrgSettings(
      (remoteOrg) => {
        if (remoteOrg) {
          setOrgSettings(remoteOrg);
        }
      },
      (err) => console.error("[Firebase Sync] Org error:", err)
    );

    // 5. Auth State Listener
    const unsubAuth = subscribeToAuthChanges((authUserProfile) => {
      if (authUserProfile) {
        setCurrentUser(authUserProfile);
      } else {
        if (isConfigured) {
          setCurrentUser(null);
        }
      }
      setIsAuthLoading(false);
    });

    return () => {
      unsubComplaints();
      unsubRoles();
      unsubAdmins();
      unsubOrg();
      unsubAuth();
    };
  }, []);

  // Quick Login dummy for backwards compatibility
  const quickLogin = () => null;

  // Switch specifically between department admins
  const switchAdminDesk = (adminIdOrDept) => {
    const found = adminUsers.find(
      (a) =>
        a.id === adminIdOrDept ||
        a.department?.toLowerCase() === adminIdOrDept?.toLowerCase() ||
        a.email?.toLowerCase() === adminIdOrDept?.toLowerCase()
    );
    if (found) {
      const fullAdmin = {
        id: found.id,
        uid: found.id,
        name: found.name,
        email: found.email,
        role: "admin",
        roleTitle: found.roleTitle || `${found.department} Administrator`,
        department: found.department,
        phone: found.phone || "",
        avatar: found.avatar,
        joinedDate: found.joinedDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      setCurrentUser(fullAdmin);
      return fullAdmin;
    }
    return null;
  };

  // Real Live Login via Firebase Authentication
  const login = async (email, password, roleHint = null) => {
    if (isConfigured && password && password.length >= 6) {
      try {
        const fbProfile = await loginUser(email, password);
        if (fbProfile) {
          setCurrentUser(fbProfile);
          return fbProfile;
        }
      } catch (authErr) {
        console.error("[CMS Auth] Firebase login attempt failed:", authErr);
        throw authErr;
      }
    }
    throw new Error("Invalid login credentials. Please check your email and password.");
  };

  // Register helper (creates real Firebase user if configured, plus saves profile to Firestore)
  const register = async ({ name, email, phone, department, role = "user", password }) => {
    let createdUser = null;

    if (isConfigured && password && password.length >= 6) {
      try {
        createdUser = await registerUser({
          name,
          email,
          password,
          phone,
          department,
          role,
        });
      } catch (fbErr) {
        console.error("[CMS Auth] Firebase register error:", fbErr);
        throw fbErr;
      }
    }

    if (!createdUser) {
      createdUser = {
        id: `usr_${Date.now()}`,
        uid: `usr_${Date.now()}`,
        name: name || "New User",
        email: email.trim(),
        phone: phone || "",
        department: department || "General Staff",
        role: role,
        roleTitle: role === "admin" ? "Department Admin" : role === "superadmin" ? "Super Administrator" : "Staff Associate",
        avatar: getDefaultAvatarForRole(role, email || name),
        joinedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
    }

    setCurrentUser(createdUser);
    return createdUser;
  };

  // Logout helper — resets currentUser to null for clean production auth
  const logout = async () => {
    if (isConfigured) {
      try {
        await logoutUser();
      } catch (err) {
        console.warn("[CMS Auth] Firebase sign out error:", err);
      }
    }
    localStorage.removeItem(STORAGE_KEYS.USER);
    setCurrentUser(null);
  };

  // Add new complaint with automatic designated department officer assignment!
  const addComplaint = ({ title, category, department, description, priority = "Medium", files = [] }) => {
    const dateNow = new Date();
    const formattedDate = `${String(dateNow.getDate()).padStart(2, "0")}/${String(dateNow.getMonth() + 1).padStart(2, "0")}/${dateNow.getFullYear()}`;
    const formattedTime = dateNow.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const targetDept = department || currentUser?.department || "Information & Technology";
    const assignedOfficer = getDepartmentOfficer(targetDept);

    const fileObjects = files.map((f) =>
      typeof f === "string"
        ? f
        : { name: f.name || "Attachment", url: URL.createObjectURL(f), type: f.type || "" }
    );
    const newId = complaints.length > 0 ? Math.max(...complaints.map((c) => Number(c.id) || 0)) + 1 : 1;

    const newComplaint = {
      id: newId,
      title,
      category: category || "Other",
      department: targetDept,
      priority,
      description,
      submittedDate: formattedDate,
      status: "OPEN",
      statusLabel: "OPEN",
      submittedBy: currentUser?.name || "Anonymous Member",
      userId: currentUser?.uid || currentUser?.id || "usr_guest",
      email: currentUser?.email || "anonymous@cms.org",
      lastUpdated: formattedTime,
      attachments: fileObjects.length > 0 ? fileObjects : ["Complaint_Details.pdf"],
      assignedOfficer: assignedOfficer,
      adminNotes: [],
      timeline: [
        {
          date: formattedTime,
          action: "Complaint Lodged",
          by: currentUser?.name || "User",
        },
        {
          date: formattedTime,
          action: `Auto-Assigned to ${assignedOfficer.name} (${assignedOfficer.role})`,
          by: "Intelligent Routing Engine",
        },
      ],
    };

    setComplaints((prev) => [newComplaint, ...prev]);

    // Persist to Cloud Firestore if connected
    if (isConfigured) {
      addComplaintToFirestore(newComplaint).catch((err) =>
        console.error("[Firestore] addComplaint error:", err)
      );
    }

    return newComplaint;
  };

  // Update complaint status or add note (Admin/SuperAdmin)
  const updateComplaintStatus = (id, newStatus, adminNoteText = "", assignedDept = null) => {
    const formattedTime = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const normalizedStatus = newStatus.toUpperCase().replace(" ", "_");
    let updatedPayload = null;

    setComplaints((prev) =>
      prev.map((item) => {
        if (item.id === parseInt(id) || String(item.id) === String(id)) {
          const updatedNotes = [...(item.adminNotes || [])];
          if (adminNoteText.trim()) {
            updatedNotes.push({
              date: formattedTime,
              author: currentUser?.name ? `${currentUser.name} (${currentUser.role})` : "Admin",
              note: adminNoteText.trim(),
              statusChange: normalizedStatus,
            });
          }

          const targetDept = assignedDept || item.department;
          const assignedOfficer = getDepartmentOfficer(targetDept);

          const updatedTimeline = [
            ...(item.timeline || []),
            {
              date: formattedTime,
              action: `Status updated to ${normalizedStatus.replace("_", " ")}`,
              by: currentUser?.name || "Admin",
            },
          ];

          if (assignedDept && assignedDept !== item.department) {
            updatedTimeline.push({
              date: formattedTime,
              action: `Reassigned to ${targetDept} (${assignedOfficer.name})`,
              by: currentUser?.name || "Admin",
            });
          }

          updatedPayload = {
            ...item,
            status: normalizedStatus,
            statusLabel: normalizedStatus.replace("_", " "),
            department: targetDept,
            assignedOfficer: assignedOfficer,
            lastUpdated: formattedTime,
            adminNotes: updatedNotes,
            timeline: updatedTimeline,
          };
          return updatedPayload;
        }
        return item;
      })
    );

    // Sync to Cloud Firestore
    if (isConfigured && updatedPayload) {
      updateComplaintInFirestore(id, {
        status: updatedPayload.status,
        statusLabel: updatedPayload.statusLabel,
        department: updatedPayload.department,
        assignedOfficer: updatedPayload.assignedOfficer,
        lastUpdated: updatedPayload.lastUpdated,
        adminNotes: updatedPayload.adminNotes,
        timeline: updatedPayload.timeline,
      }).catch((err) => console.error("[Firestore] updateComplaint error:", err));
    }
  };

  // Add user comment/note to complaint
  const addComplaintComment = (id, commentText) => {
    const formattedTime = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let newTimeline = null;

    setComplaints((prev) =>
      prev.map((item) => {
        if (item.id === parseInt(id) || String(item.id) === String(id)) {
          const updatedTimeline = [
            ...(item.timeline || []),
            {
              date: formattedTime,
              action: `User Remark: "${commentText}"`,
              by: currentUser?.name || "User",
            },
          ];
          newTimeline = updatedTimeline;
          return {
            ...item,
            timeline: updatedTimeline,
            lastUpdated: formattedTime,
          };
        }
        return item;
      })
    );

    if (isConfigured && newTimeline) {
      updateComplaintInFirestore(id, {
        timeline: newTimeline,
        lastUpdated: formattedTime,
      }).catch((err) => console.error("[Firestore] addComplaintComment error:", err));
    }
  };

  // Update role request status (Super Admin)
  const updateRoleRequest = (requestId, action) => {
    setRoleRequests((prev) =>
      prev.map((req) =>
        req.id === requestId || String(req.id) === String(requestId)
          ? {
              ...req,
              status: action === "approve" ? "approved" : "rejected",
            }
          : req
      )
    );

    if (isConfigured) {
      updateRoleRequestInFirestore(requestId, {
        status: action === "approve" ? "approved" : "rejected",
      }).catch((err) => console.error("[Firestore] updateRoleRequest error:", err));
    }

    // If approved, add to adminUsers roster and register welcome banner notice
    if (action === "approve") {
      const req = roleRequests.find((r) => r.id === requestId || String(r.id) === String(requestId));
      if (req) {
        // Register welcome banner notice for when admin logs in / views dashboard
        const welcomeNotice = {
          id: req.id,
          name: req.name,
          email: req.email,
          department: req.department,
          approvedAt: Date.now(),
        };

        setNewlyApprovedAdminWelcomes((prev) => {
          const filtered = prev.filter((p) => p.email?.toLowerCase() !== req.email?.toLowerCase());
          const updated = [...filtered, welcomeNotice];
          localStorage.setItem(STORAGE_KEYS.ADMIN_WELCOMES, JSON.stringify(updated));
          return updated;
        });

        // Upgrade currentUser immediately if matching
        if (
          currentUser &&
          (currentUser.email?.toLowerCase() === req.email?.toLowerCase() ||
           currentUser.name?.toLowerCase() === req.name?.toLowerCase() ||
           (req.userId && (currentUser.uid === req.userId || currentUser.id === req.userId)))
        ) {
          setCurrentUser((prev) => ({
            ...prev,
            role: "admin",
            department: req.department,
            roleTitle: `Department Admin · ${req.department}`,
            isNewlyApprovedAdmin: true,
          }));
        }

        const adminId = req.userId || req.uid || `adm_${Date.now()}`;
        const newAdminDoc = {
          id: adminId,
          uid: adminId,
          name: req.name,
          role: "admin",
          roleTitle: `Department Admin · ${req.department}`,
          department: req.department,
          email: req.email,
          phone: req.phone || "+91 9876543210",
          office: `${req.department} Admin Desk`,
          avatar: getDefaultAvatarForRole("admin", req.email || req.name),
          sla: "Within 24 Hours",
          joinedDate: "Recently Appointed",
          status: "Active",
          badge: "Appointed Admin",
        };

        setAdminUsers((prev) => {
          if (prev.some((a) => a.email.toLowerCase() === req.email.toLowerCase())) {
            return prev.map((a) =>
              a.email.toLowerCase() === req.email.toLowerCase() ? { ...a, ...newAdminDoc } : a
            );
          }
          return [...prev, newAdminDoc];
        });

        if (isConfigured) {
          // Permanently promote in Firestore: moves to 'admins', updates 'user_roles', and removes from 'users'
          promoteUserRoleInFirestore(
            req.userId || req.uid || req.email,
            "admin",
            req.department,
            newAdminDoc
          ).catch((err) =>
            console.error("[Firestore] promoteUserRoleInFirestore error:", err)
          );
        }
      }
    }
  };

  // Remove / Revoke Admin Access (Super Admin feature)
  const removeAdmin = (adminId) => {
    setAdminUsers((prev) => prev.filter((a) => a.id !== adminId && String(a.id) !== String(adminId)));
    if (isConfigured) {
      deleteAdminFromFirestore(adminId).catch((err) =>
        console.error("[Firestore] deleteAdmin error:", err)
      );
    }
  };

  // Appoint Admin
  const appointAdmin = (adminData) => {
    const newAdmin = {
      id: `adm_${Date.now()}`,
      name: adminData.name,
      roleTitle: adminData.roleTitle || `Department Admin · ${adminData.department}`,
      department: adminData.department,
      email: adminData.email,
      phone: adminData.phone || "+91 9876543210",
      extension: adminData.extension || "Ext #100",
      office: adminData.office || "Department Office",
      avatar: sanitizeAvatar(adminData.avatar, "admin", adminData.email || adminData.name),
      sla: "Within 24 Hours",
      joinedDate: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Active",
      badge: "Appointed Admin",
    };
    setAdminUsers((prev) => [newAdmin, ...prev]);

    if (isConfigured) {
      addAdminToFirestore(newAdmin).catch((err) =>
        console.error("[Firestore] appointAdmin error:", err)
      );
    }

    return newAdmin;
  };

  // Submit role escalation request (User)
  const submitRoleRequest = ({ requestedRole, department, reason, idProof }) => {
    // Prevent duplicate pending requests for the same user
    const currEmail = (currentUser?.email || "").trim().toLowerCase();
    const currUid = currentUser?.uid || currentUser?.id;
    const isAlreadyPending = roleRequests.some((r) => {
      if ((r?.status || "").toLowerCase() !== "pending") return false;
      const reqEmail = (r?.email || "").trim().toLowerCase();
      if (currEmail && reqEmail && reqEmail === currEmail) return true;
      if (currUid && r?.userId && r.userId === currUid) return true;
      return false;
    });

    if (isAlreadyPending) {
      console.warn("[CMS] Active role upgrade request is already pending.");
      return null;
    }

    const newReq = {
      id: roleRequests.length > 0 ? Math.max(...roleRequests.map((r) => Number(r.id) || 0)) + 1 : 1,
      userId: currentUser?.uid || currentUser?.id || null,
      name: currentUser?.name || "Employee",
      email: currentUser?.email || "user@cms.org",
      department: department || currentUser?.department || "General",
      currentRole: currentUser?.role || "User",
      requestedRole: requestedRole || "Admin",
      reason: reason || "Need department administrative view for case handling.",
      idProof: idProof || null,
      createdAt: `${new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })} • ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
      status: "pending",
    };

    setRoleRequests((prev) => [newReq, ...prev]);

    if (isConfigured) {
      addRoleRequestToFirestore(newReq).catch((err) =>
        console.error("[Firestore] submitRoleRequest error:", err)
      );
    }

    return newReq;
  };

  // Update profile with avatar sanitization
  const updateProfile = (updatedFields) => {
    setCurrentUser((prev) => {
      const sanitizedFields = { ...updatedFields };
      if (sanitizedFields.avatar) {
        sanitizedFields.avatar = sanitizeAvatar(
          sanitizedFields.avatar,
          prev?.role || "user",
          prev?.email || prev?.name
        );
      }
      const updated = {
        ...prev,
        ...sanitizedFields,
      };
      if (isConfigured && (updated.uid || updated.id)) {
        saveUserProfileToFirestore(updated.uid || updated.id, sanitizedFields).catch((err) =>
          console.error("[Firestore] updateProfile error:", err)
        );
      }
      return updated;
    });
  };

  return (
    <CMSContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthLoading,
        DEMO_USERS,
        DEPARTMENT_OFFICERS,
        getDepartmentOfficer,
        adminUsers,
        removeAdmin,
        appointAdmin,
        quickLogin,
        switchAdminDesk,
        login,
        register,
        logout,
        complaints,
        addComplaint,
        updateComplaintStatus,
        addComplaintComment,
        roleRequests,
        updateRoleRequest,
        submitRoleRequest,
        orgSettings,
        setOrgSettings,
        updateProfile,
        newlyApprovedAdminWelcomes,
        consumeAdminWelcome,
        // Firebase backend attributes
        isFirebaseConfigured: isConfigured,
        seedInitialDataToFirestore,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};


export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error("useCMS must be used within a CMSProvider");
  }
  return context;
};
