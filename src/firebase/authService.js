import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  sendPasswordResetEmail,
  verifyBeforeUpdateEmail,
  updatePassword
} from "firebase/auth";
import { auth, isConfigured } from "./config";
import { saveUserProfileToFirestore, getUserProfileFromFirestore } from "./firestoreService";
import { sanitizeAvatar, getDefaultAvatarForRole } from "../constants/avatars";

export const determineDefaultRole = (email = "", requestedRole = null) => {
  if (requestedRole && ["superadmin", "admin", "user"].includes(requestedRole.toLowerCase())) {
    return requestedRole.toLowerCase();
  }
  const lower = (email || "").toLowerCase();
  if (lower.includes("superadmin") || lower.includes("governance") || lower.includes("chief")) {
    return "superadmin";
  }
  if (lower.includes("admin")) {
    return "admin";
  }
  return "user";
};

// Helper to build a standard CMS user profile object (only real user inputs and system IDs)
export const buildUserProfile = ({
  uid,
  name,
  email,
  role = "user",
  department = "Information & Technology",
  phone = "",
  roleTitle,
  avatar,
}) => {
  const fallbackName = name || email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const finalRole = determineDefaultRole(email, role);

  return {
    id: uid,
    uid,
    name: fallbackName,
    email: email.trim(),
    phone: phone || "",
    department: department || "Information & Technology",
    role: finalRole,
    roleTitle:
      roleTitle ||
      (finalRole === "superadmin"
        ? "Super Administrator"
        : finalRole === "admin"
        ? `${department} Administrator`
        : "Staff Associate"),
    avatar: sanitizeAvatar(avatar, finalRole, email || fallbackName),
    joinedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };
};

// -------------------------------------------------------------
// REGISTER WITH FIREBASE
// -------------------------------------------------------------
export const registerUser = async ({
  name,
  email,
  password,
  phone,
  department,
  role = "user",
}) => {
  if (!isConfigured || !auth) {
    throw new Error("Firebase is not configured yet. Please configure your Firebase credentials.");
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = userCredential.user;

    // Set displayName on Firebase auth user
    if (name) {
      await updateFirebaseProfile(fbUser, { displayName: name });
    }

    // Build standard profile with clean schema
    const profile = buildUserProfile({
      uid: fbUser.uid,
      name: name || fbUser.displayName,
      email: fbUser.email,
      phone,
      department,
      role,
    });

    // Save profile to Firestore
    await saveUserProfileToFirestore(fbUser.uid, profile);

    return profile;
  } catch (error) {
    console.error("[FirebaseAuth] Registration error:", error);
    throw error;
  }
};

// -------------------------------------------------------------
// LOGIN WITH FIREBASE
// -------------------------------------------------------------
export const loginUser = async (email, password) => {
  if (!isConfigured || !auth) {
    throw new Error("Firebase is not configured yet. Please configure your Firebase credentials.");
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = userCredential.user;

    // Retrieve full profile from Firestore using both UID and email
    let profile = await getUserProfileFromFirestore(fbUser.uid, fbUser.email || email);

    // If profile document does not exist yet by UID, search specifically by email
    if (!profile && (fbUser.email || email)) {
      profile = await getUserProfileFromFirestore(fbUser.email || email, fbUser.email || email);
    }

    // Only initialize if user truly does not exist in any collection
    if (!profile) {
      const defaultRole = determineDefaultRole(fbUser.email || email);
      profile = buildUserProfile({
        uid: fbUser.uid,
        name: fbUser.displayName || email.split("@")[0],
        email: fbUser.email || email,
        role: defaultRole,
      });
      await saveUserProfileToFirestore(fbUser.uid, profile);
    }

    return profile;
  } catch (error) {
    console.error("[FirebaseAuth] Login error:", error);
    throw error;
  }
};

// -------------------------------------------------------------
// LOGOUT FROM FIREBASE
// -------------------------------------------------------------
export const logoutUser = async () => {
  if (!isConfigured || !auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("[FirebaseAuth] Sign out error:", error);
    throw error;
  }
};

// -------------------------------------------------------------
// SUBSCRIBE TO AUTH STATE CHANGES
// -------------------------------------------------------------
export const subscribeToAuthChanges = (onUserChanged) => {
  if (!isConfigured || !auth) return () => {};

  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      try {
        let profile = await getUserProfileFromFirestore(fbUser.uid, fbUser.email);
        if (!profile && fbUser.email) {
          profile = await getUserProfileFromFirestore(fbUser.email, fbUser.email);
        }
        if (!profile) {
          const defaultRole = determineDefaultRole(fbUser.email);
          profile = buildUserProfile({
            uid: fbUser.uid,
            name: fbUser.displayName,
            email: fbUser.email,
            role: defaultRole,
          });
          await saveUserProfileToFirestore(fbUser.uid, profile);
        } else {
          const cleanAvatar = sanitizeAvatar(profile.avatar, profile.role, profile.email || profile.name);
          if (profile.avatar !== cleanAvatar) {
            profile.avatar = cleanAvatar;
            saveUserProfileToFirestore(fbUser.uid, profile).catch(() => {});
          }
        }
        onUserChanged(profile);
      } catch (err) {
        console.error("[FirebaseAuth] Error syncing auth profile:", err);
        onUserChanged(null);
      }
    } else {
      onUserChanged(null);
    }
  });
};

// -------------------------------------------------------------
// PASSWORD RESET
// -------------------------------------------------------------
export const sendResetEmail = async (email) => {
  if (!isConfigured || !auth) {
    throw new Error("Firebase is not configured.");
  }
  return sendPasswordResetEmail(auth, email.trim());
};

// -------------------------------------------------------------
// EMAIL VERIFICATION & UPDATE
// -------------------------------------------------------------
export const sendUpdateEmailVerification = async (newEmail) => {
  if (!isConfigured || !auth?.currentUser) {
    throw new Error("Firebase is not configured or user not logged in.");
  }
  return verifyBeforeUpdateEmail(auth.currentUser, newEmail.trim());
};

export const updateUserPassword = async (newPassword) => {
  if (!isConfigured || !auth?.currentUser) {
    throw new Error("Firebase is not configured or user not logged in.");
  }
  return updatePassword(auth.currentUser, newPassword);
};
