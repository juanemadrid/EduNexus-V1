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

async function dump() {
  const snap = await getDocs(collection(db, "nuevaesperanza_teachers"));
  console.log(`TOTAL en nuevaesperanza_teachers: ${snap.size}`);
  snap.forEach(d => console.log(d.id, " -> name:", d.data().name));
  
  const snap2 = await getDocs(collection(db, "teachers"));
  console.log(`TOTAL en teachers: ${snap2.size}`);
  snap2.forEach(d => console.log(d.id, " -> name:", d.data().name));
  process.exit();
}
dump();
