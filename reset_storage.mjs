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

const defaultStats = {
  maxLimitBytes: 100 * 1024 * 1024 * 1024, // 100 GB Default for tenant
  usedBytes: 0,
  categories: {
    aulas_virtuales: 0,
    documentos_digitales: 0,
    documentos_solicitudes: 0,
    educacion_virtual: 0,
    educacion_virtual_v2: 0,
    imagenes_cursos: 0,
    respuestas_documentos: 0,
    respuestas_foros: 0,
    respuestas_tareas: 0
  }
};

async function resetStorage() {
  const statsRef = doc(db, "sanjose_settings", "storage_stats");
  await setDoc(statsRef, defaultStats);
  console.log("Ressetted sanjose_settings/storage_stats to 0.");
  
  const statsRefN = doc(db, "nuevaesperanza_settings", "storage_stats");
  await setDoc(statsRefN, defaultStats);
  console.log("Ressetted nuevaesperanza_settings/storage_stats to 0.");
  
  process.exit();
}

resetStorage();
