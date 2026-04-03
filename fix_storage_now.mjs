import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

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

async function fixStorage() {
  const ref = doc(db, "sanjose_settings", "storage_stats");
  const snap = await getDoc(ref);
  
  console.log("CURRENT DATA:");
  console.log(JSON.stringify(snap.data(), null, 2));
  
  const zeroed = {
    id: 'storage_stats',
    maxLimitBytes: 107374182400,
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
  
  await setDoc(ref, zeroed);
  console.log("\nRESET DONE. Verifying...");
  
  const verify = await getDoc(ref);
  console.log("NEW DATA:", JSON.stringify(verify.data(), null, 2));
  
  process.exit(0);
}

fixStorage().catch(e => { console.error(e); process.exit(1); });
