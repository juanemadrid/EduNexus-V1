import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

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
  const items = [];
  snap.forEach(d => {
    items.push({ id: d.id, ...d.data() });
  });
  
  const snap2 = await getDocs(collection(db, "teachers"));
  snap2.forEach(d => {
    items.push({ id: d.id, _collection: "teachers", ...d.data() });
  });

  fs.writeFileSync("E:/copia de seguridad/EduNexus/all_teachers_dump.json", JSON.stringify(items, null, 2));
  console.log("Done");
  process.exit(0);
}
dump();
