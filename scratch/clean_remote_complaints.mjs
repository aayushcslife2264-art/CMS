import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvE8sayQAIUbq4ti23Ajvahoy2FUUd684",
  authDomain: "cms-5afb6.firebaseapp.com",
  projectId: "cms-5afb6",
  storageBucket: "cms-5afb6.firebasestorage.app",
  messagingSenderId: "120783230556",
  appId: "1:120783230556:web:0014e1cb0c8a195b0ef899",
  measurementId: "G-D7LYTYW4QE",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function authenticate() {
  const email = "temp_cleaner_" + Date.now() + "@cms.org";
  const password = "TemporaryPassword123!";
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Authenticated as:", cred.user.email);
    return cred.user;
  } catch (err) {
    console.error("Auth error:", err.message);
    return null;
  }
}

async function cleanCollection(colName) {
  console.log(`Checking collection: ${colName}...`);
  try {
    const colRef = collection(db, colName);
    const snap = await getDocs(colRef);
    console.log(`Found ${snap.docs.length} documents in ${colName}`);
    for (const d of snap.docs) {
      console.log(`Deleting ${colName}/${d.id} (${d.data().title || d.data().name || "unnamed"})...`);
      await deleteDoc(doc(db, colName, d.id));
    }
    console.log(`Finished clearing ${colName}`);
  } catch (err) {
    console.error(`Error clearing ${colName}:`, err);
  }
}

async function run() {
  await authenticate();
  await cleanCollection("complaints");
  await cleanCollection("roleRequests");
  console.log("Cleanup complete!");
  process.exit(0);
}

run();
