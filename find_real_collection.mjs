import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, collectionGroup } from "firebase/firestore";

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

// Colecciones posibles donde pueden estar los 7 docentes reales
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
];

async function explore() {
  console.log("=== BUSCANDO COLECCIÓN CON LOS 7 DOCENTES ===\n");
  
  for (const colName of collectionsToCheck) {
    try {
      const snap = await getDocs(collection(db, colName));
      if (snap.size > 0) {
        console.log(`\n📁 "${colName}": ${snap.size} documentos`);
        snap.forEach(d => {
          const data = d.data();
          const name = data.name || data.nombre || data.fullName || data.nombreCompleto || "(sin nombre)";
          const id = d.data().cedula || d.data().identification || d.data().documento || d.id;
          console.log(`   ▶ [${d.id}] ${name} | ID: ${id}`);
        });
      } else {
        console.log(`📁 "${colName}": vacía o no existe`);
      }
    } catch(e) {
      console.log(`📁 "${colName}": error - ${e.message}`);
    }
  }
  
  process.exit(0);
}

explore().catch(e => { console.error("FATAL:", e); process.exit(1); });
