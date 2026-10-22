import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const STORAGE_KEY = "cms_custom_firebase_config";

// Read from Vite environment variables or localStorage custom configuration
export const getActiveFirebaseConfig = () => {
  // Check if user set a custom config in localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.apiKey && parsed?.projectId) {
        return { config: parsed, source: "localStorage" };
      }
    }
  } catch (err) {
    console.error("Failed to read custom firebase config from localStorage", err);
  }

  // Otherwise read Vite environment variables or project defaults
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBvE8sayQAIUBq4ti23Ajvahoy2FUUd684",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cms-5afb6.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cms-5afb6",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cms-5afb6.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "120783230556",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:120783230556:web:0014e1cb0c8a195b0ef899",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-D7LYTYW4QE",
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return { config: envConfig, source: "env" };
  }

  return { config: null, source: "none" };
};

// Check if Firebase is currently configured with valid keys
export const isConfigValid = (config) => {
  return Boolean(
    config &&
    typeof config.apiKey === "string" &&
    config.apiKey.trim().length > 10 &&
    typeof config.projectId === "string" &&
    config.projectId.trim().length > 3
  );
};

let app = null;
let auth = null;
let db = null;
let isConfigured = false;
let configSource = "none";

const active = getActiveFirebaseConfig();
if (isConfigValid(active.config)) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(active.config);
    auth = getAuth(app);
    db = getFirestore(app);
    isConfigured = true;
    configSource = active.source;
    console.log(`[Firebase] Initialized successfully using ${configSource} credentials (Project: ${active.config.projectId})`);
  } catch (err) {
    console.error("[Firebase] Initialization error:", err);
    isConfigured = false;
  }
} else {
  console.info("[Firebase] No active Firebase config found. Running in hybrid local demo mode with seamless Firebase upgrade ready.");
}

// Function to dynamically update and reload Firebase config from in-app setup modal
export const saveCustomFirebaseConfig = (newConfig) => {
  if (!isConfigValid(newConfig)) {
    throw new Error("Invalid Firebase configuration. Please provide at least apiKey and projectId.");
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  window.location.reload();
};

export const clearCustomFirebaseConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};

export { app, auth, db, isConfigured, configSource };
