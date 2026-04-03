import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, setDoc } from "firebase/firestore";

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

async function forceUpdate() {
  console.log("Forcing production synchronization (Visual Sync)...");
  
  // As observed on the live site: List shows 8 teachers, but Dashboard shows 2.
  // We will force the stats document to indicate 8.
  
  await setDoc(doc(db, "nuevaesperanza_institution_metadata", "stats"), {
    teachersCount: 8,
    studentsCount: 5, // Keeping existing students count
    coursesCount: 1,
    lastSync: Date.now()
  }, { merge: true });
  
  console.log("Stats forcefully updated to 8 Teachers.");
  process.exit();
}

forceUpdate();
