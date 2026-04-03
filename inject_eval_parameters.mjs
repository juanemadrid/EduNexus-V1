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
  console.log("Inyectando parámetros de evaluación...");

  const sedeJornadaId = "sede-sj-principal::jor-sj-manana";
  const programId = "prog-sj-bach";

  const params = [
    { id: 'eval_p1_asist', nombre: 'ASISTENCIA', porcentaje: 10, modificable: 'No', sedeJornadaId, programId, estado: 'Activo' },
    { id: 'eval_p1_expos', nombre: 'EXPOSICIÓN', porcentaje: 10, modificable: 'No', sedeJornadaId, programId, estado: 'Activo' },
    { id: 'eval_p1_quiz', nombre: 'QUIZ', porcentaje: 10, modificable: 'Sí', sedeJornadaId, programId, estado: 'Activo' },
    { id: 'eval_p1_trab_e', nombre: 'TRABAJO ESCRITO', porcentaje: 20, modificable: 'Sí', sedeJornadaId, programId, estado: 'Activo' },
    { id: 'eval_p1_trab_g', nombre: 'TRABAJO EN GRUPO', porcentaje: 20, modificable: 'Sí', sedeJornadaId, programId, estado: 'Activo' },
    { id: 'eval_p1_parcial', nombre: 'PARCIAL', porcentaje: 30, modificable: 'No', sedeJornadaId, programId, estado: 'Activo' }
  ];

  for (const p of params) {
    await setDoc(doc(db, col("eval_params"), p.id), {
        ...p,
        createdAt: new Date().toISOString()
    });
    console.log(`✓ Parámetro Inyectado: ${p.nombre} (${p.porcentaje}%)`);
  }

  console.log("¡Inyección de parámetros de evaluación completada!");
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
