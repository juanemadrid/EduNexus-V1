import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3YF1D0ih9ftk2pnFw8u5D1lJqz6KJu_A",
  authDomain: "edunexus-oficial.firebaseapp.com",
  projectId: "edunexus-oficial",
  storageBucket: "edunexus-oficial.firebasestorage.app",
  messagingSenderId: "462948258278",
  appId: "1:462948258278:web:cf75816eb7c3d4351d8627"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  console.log("Reading ALL documents in 'nuevaesperanza_teachers'...");
  const snap = await getDocs(collection(db, "nuevaesperanza_teachers"));
  console.log(`TOTAL DOCUMENTS FOUND: ${snap.size}`);
  snap.forEach(doc => {
    const d = doc.data();
    console.log(`- ID: ${doc.id}, Name: ${d.name || d.nombre || "N/A"}`);
  });
  process.exit();
}

check();
