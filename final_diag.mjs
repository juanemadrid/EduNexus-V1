import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

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
  console.log("Runtime Database Check:");
  console.log("Config ProjectId:", firebaseConfig.projectId);
  
  // Try to query the 8 teachers names directly
  const colRef = collection(db, "nuevaesperanza_teachers");
  const snap = await getDocs(colRef);
  
  console.log(`\nCollection 'nuevaesperanza_teachers' has ${snap.size} documents.`);
  snap.forEach(d => {
      console.log(`- ID: ${d.id}, Name: ${d.data().name || d.data().nombre}`);
  });

  // Check the stats doc specifically
  const statsSnap = await getDoc(doc(db, "nuevaesperanza_institution_metadata", "stats"));
  console.log("\nStats Document:", statsSnap.exists() ? statsSnap.data() : "NOT FOUND");

  process.exit();
}

check();
