import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc } from "firebase/firestore";

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

const TENANT = "colegiosanjose";
const col = (name) => `${TENANT}_${name}`;

async function run() {
  console.log("Creando periodo académico...");

  const pDocId = `period_2026_01`;
  await setDoc(doc(db, col("academic_periods"), pDocId), {
    id: pDocId,
    nombre: "2026 - 01",
    estado: "Activo",
    fechaInicio: "2026-01-15",
    fechaFin: "2026-06-30"
  });
  
  console.log(`✓ Periodo académico inyectado: 2026 - 01`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
