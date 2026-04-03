import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, doc, updateDoc, setDoc } from "firebase/firestore";

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
  console.log("Actualizando grupos para enlazarlos con los filtros (Periodo, Sede, Programa)...");

  // 1. Get the real 'Bachillerato' and 'Primaria' program IDs
  const progs = await getDocs(collection(db, col("academic_programs")));
  let bachId = ""; let primId = "";
  progs.docs.forEach(p => {
    const data = p.data();
    if (data.nombre && data.nombre.toLowerCase().includes("bachillerato")) { bachId = p.id; }
    if (data.nombre && data.nombre.toLowerCase().includes("primaria")) { primId = p.id; }
  });

  // Default to something if not found
  if(!bachId) bachId = "prog_bach_fallback";
  if(!primId) primId = "prog_prim_fallback";

  // 2. Get sede ID
  const sedes = await getDocs(collection(db, col("sedes")));
  let sedeId = "";
  if (!sedes.empty) { sedeId = sedes.docs[0].id; }
  else { sedeId = "sede-sj-principal"; }

  // 3. The period we injected
  const periodoId = "period_2026_01";

  // 4. Update the existing group (Sexto A) to link to Bachillerato
  await updateDoc(doc(db, col("grupos"), "grupo-sj-6a-2026"), {
    periodoId: periodoId,
    sedeId: sedeId,
    programaId: bachId
  });
  console.log("✓ Grupo 'Sexto A' enlazado a Bachillerato, Sede Principal, y Periodo 2026-01.");

  // 5. Create a new dummy group for Primaria just so they see switching filters works
  await setDoc(doc(db, col("grupos"), "grupo-sj-5a-2026"), {
    id: "grupo-sj-5a-2026",
    codigo: "5A-PRIM",
    nombre: "Quinto A (Primaria)",
    cursoId: "curso-sj-prim-01",
    cupoMaximo: "25",
    estado: "Activo",
    estudiantes: ["stud-sj-prim-1"],
    periodoId: periodoId,
    sedeId: sedeId,
    programaId: primId
  });
  console.log("✓ Grupo 'Quinto A' creado y enlazado a Básica Primaria.");

}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
