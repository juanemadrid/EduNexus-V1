import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, getDoc, doc } from "firebase/firestore";

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

async function search() {
  const collections = [
    "nuevaesperanza_teachers",
    "nuevaesperanza_students",
    "teachers",
    "students",
    "users",
    "institutions",
    "nuevaesperanza_institution_metadata"
  ];

  console.log("Searching for 'Donaldo' or 'Contreras' in project 'edunexus-oficial'...");

  for (const c of collections) {
    try {
      const snap = await getDocs(collection(db, c));
      snap.forEach(doc => {
        const text = JSON.stringify(doc.data()).toUpperCase();
        if (text.includes("DONALDO") || text.includes("CONTRERAS")) {
           console.log(`Found in collection '${c}', document '${doc.id}':`, doc.data().name || doc.data().nombre);
        }
      });
    } catch (e) {}
  }

  // Check stats document content too
  const statsSnap = await getDoc(doc(db, "nuevaesperanza_institution_metadata", "stats"));
  if (statsSnap.exists()) {
      console.log("\nREAL STATS DOCUMENT in 'edunexus-oficial':", statsSnap.data());
  }

  process.exit();
}

search();
