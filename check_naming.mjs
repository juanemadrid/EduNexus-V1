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
  console.log("Checking nuevaesperanza_teachers...");
  const snapTeachers = await getDocs(collection(db, "nuevaesperanza_teachers"));
  console.log(`Found ${snapTeachers.size} docs:`);
  snapTeachers.forEach(doc => {
    const data = doc.data();
    console.log(`  - ${doc.id}: ${data.name || data.nombre || "No name"} (details: ${data.details ? 'present' : 'absent'})`);
  });

  console.log("\nChecking nuevaesperanza_students...");
  const snapStudents = await getDocs(collection(db, "nuevaesperanza_students"));
  console.log(`Found ${snapStudents.size} docs:`);
  snapStudents.forEach(doc => {
    const data = doc.data();
    console.log(`  - ${doc.id}: ${data.name || data.nombre || "No name"}`);
  });

  process.exit();
}

check();
