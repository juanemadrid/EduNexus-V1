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

const TENANT = "colegiosanjose";
const col = (name) => `${TENANT}_${name}`;

async function run() {
  console.log("Inyectando periodos académicos...");

  const periods = [
    { id: 'per-2026-1', nombre: 'PRIMER PERIODO', anio: '2026', estado: 'Activo' },
    { id: 'per-2026-2', nombre: 'SEGUNDO PERIODO', anio: '2026', estado: 'Inactivo' },
    { id: 'per-2026-3', nombre: 'TERCER PERIODO', anio: '2026', estado: 'Inactivo' },
    { id: 'per-2026-4', nombre: 'CUARTO PERIODO', anio: '2026', estado: 'Inactivo' }
  ];

  for (const p of periods) {
    await setDoc(doc(db, col("periods"), p.id), {
        ...p,
        createdAt: new Date().toISOString()
    });
    console.log(`✓ Periodo Inyectado: ${p.nombre}`);
  }

  console.log("¡Inyección de periodos completada!");
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
