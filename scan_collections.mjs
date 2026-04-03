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

const collectionsToCheck = [
  "nuevaesperanza_teachers",
  "teachers",
  "docentes",
  "nuevaesperanza_docentes",
  "users",
  "nuevaesperanza_users",
  "institution_teachers",
  "staff",
  "personnel",
  "nuevaesperanza_staff",
  "nueva_esperanza_teachers",
];

async function explore() {
  const results = {};
  
  for (const colName of collectionsToCheck) {
    try {
      const snap = await getDocs(collection(db, colName));
      results[colName] = {
        count: snap.size,
        docs: snap.docs.map(d => ({
          id: d.id,
          name: d.data().name || d.data().nombre || d.data().fullName || null,
          email: d.data().email || null,
          cedula: d.data().cedula || d.data().identification || d.data().documento || null,
          keys: Object.keys(d.data())
        }))
      };
    } catch(e) {
      results[colName] = { error: e.message };
    }
  }
  
  fs.writeFileSync("E:/copia de seguridad/EduNexus/collection_scan.json", JSON.stringify(results, null, 2), "utf8");
  console.log("DONE - see collection_scan.json");
  process.exit(0);
}

explore().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
