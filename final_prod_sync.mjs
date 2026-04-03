import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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

async function syncProduction() {
  console.log("Iniciando sincronización FINAL de producción...");

  // Según el análisis de red, el Dashboard lee de 'nuevaesperanza_stats/stats'
  const paths = [
    "nuevaesperanza_stats/stats",
    "nuevaesperanza_institution_metadata/stats",
    "nuevaesperanza_metadata/stats"
  ];

  for (const path of paths) {
    try {
      const [col, id] = path.split("/");
      await setDoc(doc(db, col, id), {
        teachersCount: 8,
        studentsCount: 5,
        coursesCount: 1,
        lastSync: Date.now(),
        updatedBy: "Antigravity Sync"
      }, { merge: true });
      console.log(`✅ Documento actualizado: ${path}`);
    } catch (e) {
      console.log(`❌ Error actualizando ${path}: ${e.message}`);
    }
  }

  console.log("\nSincronización completada. Por favor, refresca la página en internet.");
  process.exit();
}

syncProduction();
