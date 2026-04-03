import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, doc, setDoc } from "firebase/firestore";

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
  console.log("Creando pensum e vinculando agrupaciones...");

  // 1. Get real program ID
  const progs = await getDocs(collection(db, col("academic_programs")));
  let bachId = progs.docs.find(d => d.data().nombre?.includes("BACHILLERATO"))?.id || "bach-demo";

  // 2. Create a Pensum
  const pensId = "pens-sj-2026-bach";
  await setDoc(doc(db, col("pensums"), pensId), {
    id: pensId,
    nombre: "PENSUM BACHILLERATO 2026",
    programaId: bachId,
    estado: "Activo"
  });
  console.log(`✓ Pensum creado: PENSUM BACHILLERATO 2026`);

  // 3. Update the existing grouping to match this filter
  // From inject_structuring.mjs we know we made one with prefix or custom ID.
  // Actually, let's just use a fixed ID for the demo grouping.
  const gId = "grouping_cie_demo";
  await setDoc(doc(db, col("groupings"), gId), {
    id: gId,
    codigo: "AGR-CIE",
    nombre: "CIENCIAS EXACTAS",
    programaId: bachId,
    pensumId: pensId,
    porcentaje: "40",
    estado: "Activo"
  });
  console.log(`✓ Agrupación 'CIENCIAS EXACTAS' enlazada a Fenix y Pensum 2026.`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
