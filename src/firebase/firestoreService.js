import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, isConfigured } from "./config";

const COLLECTIONS = {
  COMPLAINTS: "complaints",
  USERS: "users", // Regular staff/employee accounts only
  ADMINS: "admins", // Department administrators
  SUPERADMINS: "superadmins", // Super administrators
  ALL_USERS: "all_users", // Master collection with all users (superadmin, admin, user)
  USER_ROLES: "user_roles", // Legacy index to replace & purge
  ROLE_REQUESTS: "roleRequests",
  ORG_SETTINGS: "orgSettings",
};

// Helper to determine target collection from role
export const getCollectionForRole = (role) => {
  if (role === "superadmin") return COLLECTIONS.SUPERADMINS;
  if (role === "admin") return COLLECTIONS.ADMINS;
  return COLLECTIONS.USERS;
};

// -------------------------------------------------------------
// SEEDING HELPER: Only seeds org settings if missing, leaves complaints empty for real data
// -------------------------------------------------------------
export const seedInitialDataToFirestore = async (initialData = {}) => {
  if (!isConfigured || !db) {
    return false;
  }

  try {
    const { orgSettings = null } = initialData;

    // Only ensure base Organization Settings exist if not already configured
    if (orgSettings) {
      const orgRef = doc(db, COLLECTIONS.ORG_SETTINGS, "default");
      const orgSnap = await getDoc(orgRef);
      if (!orgSnap.exists()) {
        console.log("[Firestore] Initializing clean default organization settings...");
        await setDoc(orgRef, {
          ...orgSettings,
          updatedAt: serverTimestamp(),
        });
      }
    }

    return true;
  } catch (error) {
    console.error("[Firestore] Error initializing org settings:", error);
    return false;
  }
};

// -------------------------------------------------------------
// COMPLAINTS
// -------------------------------------------------------------
export const subscribeComplaints = (onData, onError) => {
  if (!isConfigured || !db) return () => {};

  try {
    const q = query(collection(db, COLLECTIONS.COMPLAINTS));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            ...data,
            id: isNaN(Number(docSnap.id)) ? docSnap.id : Number(docSnap.id),
          });
        });
        // Sort newest first by id or submittedDate
        items.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
        onData(items);
      },
      (error) => {
        console.error("[Firestore] Complaints listener error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error("[Firestore] Failed to attach complaints listener:", err);
    return () => {};
  }
};

export const addComplaintToFirestore = async (complaint) => {
  if (!isConfigured || !db) return null;
  try {
    const docId = String(complaint.id || Date.now());
    const docRef = doc(db, COLLECTIONS.COMPLAINTS, docId);
    await setDoc(docRef, {
      ...complaint,
      createdAt: serverTimestamp(),
    });
    return { ...complaint, id: isNaN(Number(docId)) ? docId : Number(docId) };
  } catch (err) {
    console.error("[Firestore] Error adding complaint:", err);
    throw err;
  }
};

export const updateComplaintInFirestore = async (complaintId, updates) => {
  if (!isConfigured || !db) return;
  try {
    const docRef = doc(db, COLLECTIONS.COMPLAINTS, String(complaintId));
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[Firestore] Error updating complaint:", err);
    throw err;
  }
};

export const deleteComplaintFromFirestore = async (complaintId) => {
  if (!isConfigured || !db) return;
  try {
    const docRef = doc(db, COLLECTIONS.COMPLAINTS, String(complaintId));
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("[Firestore] Error deleting complaint:", err);
  }
};

export const purgeSampleComplaintsFromFirestore = async () => {
  if (!isConfigured || !db) return;
  try {
    const q = query(collection(db, COLLECTIONS.COMPLAINTS));
    const snap = await getDocs(q);
    const demoKeywords = [
      "harassment and hostile conduct",
      "delayed overtime reimbursement",
      "hostel mess hygiene",
      "air conditioning failure",
      "hostile work environment",
      "library book requisition",
      "wifi network",
      "wifi connectivity",
    ];

    for (const d of snap.docs) {
      const data = d.data();
      const titleLower = (data.title || "").toLowerCase();
      const descLower = (data.description || "").toLowerCase();
      const isSample =
        demoKeywords.some((kw) => titleLower.includes(kw) || descLower.includes(kw)) ||
        data.submittedDate?.includes("2025") ||
        (Number(d.id) >= 1 && Number(d.id) <= 12 && String(data.userId || "").startsWith("usr_00"));

      if (isSample) {
        console.log(`[Firestore] Purging sample document: ${d.id}`);
        await deleteDoc(doc(db, COLLECTIONS.COMPLAINTS, d.id));
      }
    }
  } catch (err) {
    console.warn("[Firestore] Error sweeping sample complaints:", err);
  }
};

// -------------------------------------------------------------
// USER PROFILES (Clean minimal schema: only real user inputs & system IDs)
// -------------------------------------------------------------
export const cleanUserProfile = (raw = {}) => {
  const role = (raw.role || "user").toLowerCase();
  const roleTitle =
    raw.roleTitle ||
    (role === "superadmin"
      ? "Super Administrator"
      : role === "admin"
      ? `${raw.department || "Department"} Administrator`
      : "Staff Associate");

  const targetCollection = getCollectionForRole(role);
  const uid = raw.uid || raw.id;

  return {
    uid: uid || "",
    id: uid || "",
    name: (raw.name || "").trim(),
    email: (raw.email || "").trim(),
    phone: (raw.phone || "").trim(),
    department: raw.department || "Information & Technology",
    role,
    roleTitle,
    avatar: raw.avatar || "",
    joinedDate: raw.joinedDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    collectionName: targetCollection,
  };
};

export const saveUserProfileToFirestore = async (uid, userData) => {
  if (!isConfigured || !db || !uid) return;
  try {
    const cleanData = cleanUserProfile({ ...userData, uid });
    const targetCollection = cleanData.collectionName;

    // 1. Overwrite document in role-specific collection (users, admins, or superadmins)
    const roleDocRef = doc(db, targetCollection, uid);
    await setDoc(roleDocRef, {
      ...cleanData,
      updatedAt: serverTimestamp(),
    });

    // 2. Save to 'all_users' master collection (contains ALL users: superadmin, admin, user)
    const allUsersRef = doc(db, COLLECTIONS.ALL_USERS, uid);
    await setDoc(allUsersRef, {
      ...cleanData,
      updatedAt: serverTimestamp(),
    });

    // 3. Purge from legacy 'user_roles' so user_roles is completely replaced by all_users
    try {
      const legacyRef = doc(db, COLLECTIONS.USER_ROLES, uid);
      await deleteDoc(legacyRef);
    } catch {
      // non-blocking
    }

    // 4. Ensure 'users' collection strictly contains ONLY staff and employees
    if (cleanData.role === "admin" || cleanData.role === "superadmin") {
      try {
        const userRef = doc(db, COLLECTIONS.USERS, uid);
        await deleteDoc(userRef);
      } catch {
        // non-blocking
      }
    }

    // 5. Clean up from other role collections if role changed
    const otherCollections = [COLLECTIONS.USERS, COLLECTIONS.ADMINS, COLLECTIONS.SUPERADMINS].filter(
      (c) => c !== targetCollection
    );
    for (const otherColl of otherCollections) {
      try {
        const otherRef = doc(db, otherColl, uid);
        const checkSnap = await getDoc(otherRef);
        if (checkSnap.exists()) {
          await deleteDoc(otherRef);
        }
      } catch {
        // non-blocking cleanup
      }
    }
  } catch (err) {
    console.error("[Firestore] Error saving user profile:", err);
    throw err;
  }
};

export const getUserProfileFromFirestore = async (uid, email = null) => {
  if (!isConfigured || !db || (!uid && !email)) return null;
  try {
    const sanitizeAndPrune = async (rawProfile, sourceColl = null) => {
      if (!rawProfile) return null;
      const clean = cleanUserProfile(rawProfile);
      const expectedColl = getCollectionForRole(clean.role);
      const actualUid = clean.uid || uid || rawProfile.id;

      // Always mirror into 'all_users' master collection
      try {
        const allUsersRef = doc(db, COLLECTIONS.ALL_USERS, actualUid);
        await setDoc(allUsersRef, {
          ...clean,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // non-blocking
      }

      // Purge from legacy 'user_roles'
      try {
        const legacyRef = doc(db, COLLECTIONS.USER_ROLES, actualUid);
        await deleteDoc(legacyRef);
      } catch {
        // non-blocking
      }

      // If document was found in wrong role collection, migrate and delete old
      if (sourceColl && sourceColl !== expectedColl && sourceColl !== COLLECTIONS.ALL_USERS) {
        try {
          await saveUserProfileToFirestore(actualUid, clean);
          const oldRef = doc(db, sourceColl, actualUid);
          await deleteDoc(oldRef);
        } catch (migErr) {
          console.warn(`[Firestore] Migration from ${sourceColl} to ${expectedColl} warning:`, migErr);
        }
      } else {
        // Ensure 'users' collection strictly contains ONLY staff and employees
        if (clean.role === "admin" || clean.role === "superadmin") {
          try {
            const userRef = doc(db, COLLECTIONS.USERS, actualUid);
            await deleteDoc(userRef);
          } catch {
            // non-blocking
          }
        }
      }

      return clean;
    };

    // 0. Check superadmins collection by UID
    if (uid) {
      const superAdminRef = doc(db, COLLECTIONS.SUPERADMINS, uid);
      const superAdminSnap = await getDoc(superAdminRef);
      if (superAdminSnap.exists()) {
        const data = superAdminSnap.data();
        return await sanitizeAndPrune({
          ...data,
          role: "superadmin",
          roleTitle: data.roleTitle || "Super Administrator",
        }, COLLECTIONS.SUPERADMINS);
      }

      // 1. Check admins collection by UID
      const adminRef = doc(db, COLLECTIONS.ADMINS, uid);
      const adminSnap = await getDoc(adminRef);
      if (adminSnap.exists()) {
        const data = adminSnap.data();
        return await sanitizeAndPrune({
          ...data,
          role: "admin",
        }, COLLECTIONS.ADMINS);
      }

      // 2. Check users collection by UID
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        return await sanitizeAndPrune(data, COLLECTIONS.USERS);
      }

      // 3. Check 'all_users' master collection by UID
      const allUsersRef = doc(db, COLLECTIONS.ALL_USERS, uid);
      const allUsersSnap = await getDoc(allUsersRef);
      if (allUsersSnap.exists()) {
        const data = allUsersSnap.data();
        const targetColl = getCollectionForRole(data.role);
        return await sanitizeAndPrune(data, targetColl);
      }
    }

    // 4. Fallback search by email across superadmins, admins, all_users, and users
    const emailToSearch = (
      email || (typeof uid === "string" && uid.includes("@") ? uid : "")
    ).trim().toLowerCase();

    if (emailToSearch && emailToSearch.includes("@")) {
      for (const coll of [COLLECTIONS.SUPERADMINS, COLLECTIONS.ADMINS, COLLECTIONS.ALL_USERS, COLLECTIONS.USERS]) {
        try {
          const q = query(collection(db, coll), where("email", "==", emailToSearch));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const docFound = snap.docs[0];
            const foundData = docFound.data();
            const actualDocId = docFound.id;
            const targetRole = (foundData.role || (coll === COLLECTIONS.SUPERADMINS ? "superadmin" : coll === COLLECTIONS.ADMINS ? "admin" : "user")).toLowerCase();
            const targetColl = getCollectionForRole(targetRole);

            // If found under an older ID (like 'adm_...'), migrate permanently to the user's Auth UID
            if (uid && !uid.includes("@") && actualDocId !== uid) {
              const cleanData = cleanUserProfile({ ...foundData, uid, role: targetRole });
              await setDoc(doc(db, targetColl, uid), { ...cleanData, updatedAt: serverTimestamp() });
              await setDoc(doc(db, COLLECTIONS.ALL_USERS, uid), { ...cleanData, updatedAt: serverTimestamp() });
              try { await deleteDoc(docFound.ref); } catch {}
              if (targetRole === "admin" || targetRole === "superadmin") {
                try { await deleteDoc(doc(db, COLLECTIONS.USERS, uid)); } catch {}
                try { await deleteDoc(doc(db, COLLECTIONS.USERS, actualDocId)); } catch {}
              }
              return cleanData;
            }

            return await sanitizeAndPrune({ ...foundData, role: targetRole }, targetColl);
          }
        } catch {
          // non-blocking
        }
      }
    }

    return null;
  } catch (err) {
    console.error("[Firestore] Error fetching user profile:", err);
    return null;
  }
};

/**
 * Promotes or updates a user's role across Firestore:
 * - Writes clean profile to target collection ('admins', 'superadmins', or 'users')
 * - Updates user_roles index with { role, collectionName }
 * - Deletes the document from all previous collections so user is cleanly removed from 'users'
 */
export const promoteUserRoleInFirestore = async (userIdOrEmail, newRole, department = "", extraData = {}) => {
  if (!isConfigured || !db || !userIdOrEmail) return null;
  try {
    const role = (newRole || "user").toLowerCase();
    const targetColl = getCollectionForRole(role);
    const idStr = String(userIdOrEmail).trim();

    // 1. Locate existing document across collections
    let existingProfile = null;
    let actualUid = idStr;
    let foundColl = null;

    for (const coll of [COLLECTIONS.SUPERADMINS, COLLECTIONS.ADMINS, COLLECTIONS.USERS]) {
      const docRef = doc(db, coll, idStr);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        existingProfile = snap.data();
        actualUid = snap.id;
        foundColl = coll;
        break;
      }
    }

    // If not found by ID, search by email
    if (!existingProfile && idStr.includes("@")) {
      for (const coll of [COLLECTIONS.SUPERADMINS, COLLECTIONS.ADMINS, COLLECTIONS.USERS]) {
        try {
          const q = query(collection(db, coll), where("email", "==", idStr.toLowerCase()));
          const snap = await getDocs(q);
          if (!snap.empty) {
            existingProfile = snap.docs[0].data();
            actualUid = snap.docs[0].id;
            foundColl = coll;
            break;
          }
        } catch {
          // ignore
        }
      }
    }

    const dept = department || existingProfile?.department || extraData.department || "Information & Technology";
    const roleTitle =
      role === "superadmin"
        ? "Super Administrator"
        : role === "admin"
        ? `Department Admin · ${dept}`
        : "Staff Associate";

    const cleanData = cleanUserProfile({
      ...(existingProfile || {}),
      ...extraData,
      uid: actualUid,
      role,
      roleTitle,
      department: dept,
    });

    // 2. Write to target collection
    const targetRef = doc(db, targetColl, actualUid);
    await setDoc(targetRef, {
      ...cleanData,
      updatedAt: serverTimestamp(),
    });

    // 3. Save to 'all_users' master collection (holds all users regardless of role)
    const allUsersRef = doc(db, COLLECTIONS.ALL_USERS, actualUid);
    await setDoc(allUsersRef, {
      ...cleanData,
      updatedAt: serverTimestamp(),
    });

    // 4. Automatically purge from legacy 'user_roles' collection
    try {
      const indexRef = doc(db, COLLECTIONS.USER_ROLES, actualUid);
      await deleteDoc(indexRef);
    } catch {
      // non-blocking
    }
    if (idStr && idStr !== actualUid) {
      try {
        const oldIndexRef = doc(db, COLLECTIONS.USER_ROLES, idStr);
        await deleteDoc(oldIndexRef);
      } catch {
        // non-blocking
      }
    }

    // 5. Ensure 'users' collection strictly contains ONLY staff and employees
    if (role === "admin" || role === "superadmin") {
      try {
        const userRef = doc(db, COLLECTIONS.USERS, actualUid);
        await deleteDoc(userRef);
      } catch {
        // non-blocking
      }
      if (idStr && idStr !== actualUid) {
        try {
          const oldUserRef = doc(db, COLLECTIONS.USERS, idStr);
          await deleteDoc(oldUserRef);
        } catch {
          // non-blocking
        }
      }
    }

    // 6. Delete document from all other role collections
    const otherCollections = [COLLECTIONS.USERS, COLLECTIONS.ADMINS, COLLECTIONS.SUPERADMINS].filter(
      (c) => c !== targetColl
    );
    for (const otherColl of otherCollections) {
      try {
        const otherRef = doc(db, otherColl, actualUid);
        await deleteDoc(otherRef);
      } catch {
        // ignore
      }
    }

    if (foundColl && foundColl !== targetColl && idStr !== actualUid) {
      try {
        const oldRef = doc(db, foundColl, idStr);
        await deleteDoc(oldRef);
      } catch {
        // ignore
      }
    }

    return cleanData;
  } catch (err) {
    console.error("[Firestore] Error promoting user role:", err);
    throw err;
  }
};

/**
 * Master migration: Ensures 'all_users' contains EVERY registered user (superadmin, admin, user),
 * ensures 'users' contains ONLY staff and employees, and completely empties legacy 'user_roles'.
 */
export const migrateAndSyncAllUsersCollection = async () => {
  if (!isConfigured || !db) return;
  try {
    // 1. Sync superadmins -> all_users
    try {
      const snapSuper = await getDocs(collection(db, COLLECTIONS.SUPERADMINS));
      for (const d of snapSuper.docs) {
        const data = cleanUserProfile({ ...d.data(), uid: d.id, role: "superadmin" });
        await setDoc(doc(db, COLLECTIONS.ALL_USERS, d.id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
        try { await deleteDoc(doc(db, COLLECTIONS.USERS, d.id)); } catch {}
        try { await deleteDoc(doc(db, COLLECTIONS.USER_ROLES, d.id)); } catch {}
      }
    } catch {
      // non-blocking
    }

    // 2. Sync admins -> all_users
    try {
      const snapAdmins = await getDocs(collection(db, COLLECTIONS.ADMINS));
      for (const d of snapAdmins.docs) {
        const data = cleanUserProfile({ ...d.data(), uid: d.id, role: "admin" });
        await setDoc(doc(db, COLLECTIONS.ALL_USERS, d.id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
        try { await deleteDoc(doc(db, COLLECTIONS.USERS, d.id)); } catch {}
        try { await deleteDoc(doc(db, COLLECTIONS.USER_ROLES, d.id)); } catch {}
      }
    } catch {
      // non-blocking
    }

    // 3. Sync users -> all_users, ensuring 'users' collection contains ONLY staff & employees
    try {
      const snapUsers = await getDocs(collection(db, COLLECTIONS.USERS));
      for (const d of snapUsers.docs) {
        const raw = d.data();
        const role = (raw.role || "user").toLowerCase();
        if (role === "admin") {
          const clean = cleanUserProfile({ ...raw, uid: d.id, role: "admin" });
          await setDoc(doc(db, COLLECTIONS.ADMINS, d.id), { ...clean, updatedAt: serverTimestamp() });
          await setDoc(doc(db, COLLECTIONS.ALL_USERS, d.id), { ...clean, updatedAt: serverTimestamp() });
          try { await deleteDoc(d.ref); } catch {}
        } else if (role === "superadmin") {
          const clean = cleanUserProfile({ ...raw, uid: d.id, role: "superadmin" });
          await setDoc(doc(db, COLLECTIONS.SUPERADMINS, d.id), { ...clean, updatedAt: serverTimestamp() });
          await setDoc(doc(db, COLLECTIONS.ALL_USERS, d.id), { ...clean, updatedAt: serverTimestamp() });
          try { await deleteDoc(d.ref); } catch {}
        } else {
          // Regular staff/employee
          const clean = cleanUserProfile({ ...raw, uid: d.id, role: "user" });
          await setDoc(doc(db, COLLECTIONS.ALL_USERS, d.id), { ...clean, updatedAt: serverTimestamp() });
        }
        try { await deleteDoc(doc(db, COLLECTIONS.USER_ROLES, d.id)); } catch {}
      }
    } catch {
      // non-blocking
    }

    // 4. Purge all leftover documents from legacy user_roles
    try {
      const snapRoles = await getDocs(collection(db, COLLECTIONS.USER_ROLES));
      for (const d of snapRoles.docs) {
        try { await deleteDoc(d.ref); } catch {}
      }
    } catch {
      // non-blocking
    }
  } catch (err) {
    console.warn("[Firestore] migrateAndSyncAllUsersCollection warning:", err);
  }
};

/**
 * Real-time listener for the master 'all_users' collection
 */
export const subscribeAllUsers = (onData, onError) => {
  if (!isConfigured || !db) return () => {};
  try {
    const q = query(collection(db, COLLECTIONS.ALL_USERS));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) => {
          items.push({
            ...docSnap.data(),
            id: docSnap.id,
            uid: docSnap.id,
          });
        });
        onData(items);
      },
      (error) => {
        console.error("[Firestore] All users listener error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error("[Firestore] Failed to attach all_users listener:", err);
    return () => {};
  }
};

/**
 * Purges an admin or superadmin from 'user_roles' and 'users' collections
 * so they only exist in 'admins' or 'superadmins'.
 */
export const purgeAdminFromUserRolesInFirestore = async (uidOrId, email = "") => {
  if (!isConfigured || !db) return;
  const toClean = [uidOrId, email].filter(Boolean);
  for (const id of toClean) {
    try {
      const roleRef = doc(db, COLLECTIONS.USER_ROLES, String(id));
      await deleteDoc(roleRef);
    } catch {
      // ignore
    }
    try {
      const userRef = doc(db, COLLECTIONS.USERS, String(id));
      await deleteDoc(userRef);
    } catch {
      // ignore
    }
  }

  // Also query user_roles and users by email to ensure clean deletion
  if (email && email.includes("@")) {
    try {
      const qRole = query(collection(db, COLLECTIONS.USER_ROLES), where("email", "==", email.toLowerCase()));
      const snapRole = await getDocs(qRole);
      for (const d of snapRole.docs) {
        await deleteDoc(d.ref);
      }
    } catch {
      // ignore
    }
    try {
      const qUser = query(collection(db, COLLECTIONS.USERS), where("email", "==", email.toLowerCase()));
      const snapUser = await getDocs(qUser);
      for (const d of snapUser.docs) {
        await deleteDoc(d.ref);
      }
    } catch {
      // ignore
    }
  }
};

// -------------------------------------------------------------
// ROLE REQUESTS
// -------------------------------------------------------------
export const subscribeRoleRequests = (onData, onError) => {
  if (!isConfigured || !db) return () => {};
  try {
    const q = query(collection(db, COLLECTIONS.ROLE_REQUESTS));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            ...data,
            id: isNaN(Number(docSnap.id)) ? docSnap.id : Number(docSnap.id),
          });
        });
        items.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
        onData(items);
      },
      (error) => {
        console.error("[Firestore] Role requests listener error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error("[Firestore] Failed to attach role requests listener:", err);
    return () => {};
  }
};

export const addRoleRequestToFirestore = async (request) => {
  if (!isConfigured || !db) return null;
  try {
    const docId = String(request.id || Date.now());
    const docRef = doc(db, COLLECTIONS.ROLE_REQUESTS, docId);
    await setDoc(docRef, {
      ...request,
      createdAt: serverTimestamp(),
    });
    return request;
  } catch (err) {
    console.error("[Firestore] Error adding role request:", err);
    throw err;
  }
};

export const updateRoleRequestInFirestore = async (requestId, updates) => {
  if (!isConfigured || !db) return;
  try {
    const docRef = doc(db, COLLECTIONS.ROLE_REQUESTS, String(requestId));
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[Firestore] Error updating role request:", err);
    throw err;
  }
};

// -------------------------------------------------------------
// ADMINS ROSTER
// -------------------------------------------------------------
export const subscribeAdmins = (onData, onError) => {
  if (!isConfigured || !db) return () => {};
  try {
    const q = query(collection(db, COLLECTIONS.ADMINS));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) => {
          items.push({
            ...docSnap.data(),
            id: docSnap.id,
          });
        });
        onData(items);
      },
      (error) => {
        console.error("[Firestore] Admins listener error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error("[Firestore] Failed to attach admins listener:", err);
    return () => {};
  }
};

export const addAdminToFirestore = async (admin) => {
  if (!isConfigured || !db) return null;
  try {
    const docId = String(admin.id || `adm_${Date.now()}`);
    const docRef = doc(db, COLLECTIONS.ADMINS, docId);
    await setDoc(docRef, {
      ...admin,
      id: docId,
      createdAt: serverTimestamp(),
    });
    return { ...admin, id: docId };
  } catch (err) {
    console.error("[Firestore] Error adding admin:", err);
    throw err;
  }
};

export const deleteAdminFromFirestore = async (adminId) => {
  if (!isConfigured || !db) return;
  try {
    const docRef = doc(db, COLLECTIONS.ADMINS, String(adminId));
    await deleteDoc(docRef);
  } catch (err) {
    console.error("[Firestore] Error deleting admin:", err);
    throw err;
  }
};

// -------------------------------------------------------------
// ORG SETTINGS
// -------------------------------------------------------------
export const subscribeOrgSettings = (onData, onError) => {
  if (!isConfigured || !db) return () => {};
  try {
    const docRef = doc(db, COLLECTIONS.ORG_SETTINGS, "default");
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onData(snapshot.data());
        }
      },
      (error) => {
        console.error("[Firestore] Org settings listener error:", error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error("[Firestore] Failed to attach org settings listener:", err);
    return () => {};
  }
};

export const updateOrgSettingsInFirestore = async (settings) => {
  if (!isConfigured || !db) return;
  try {
    const docRef = doc(db, COLLECTIONS.ORG_SETTINGS, "default");
    await setDoc(docRef, { ...settings, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.error("[Firestore] Error updating org settings:", err);
    throw err;
  }
};
