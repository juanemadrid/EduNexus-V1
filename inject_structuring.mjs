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
  console.log("Starting DB injection for structuring modules...");

  // 1. Get an existing academic program ID (if any)
  const progs = await getDocs(collection(db, col("academic_programs")));
  let progId = "prog_demo_id";
  if (!progs.empty) {
    progId = progs.docs[0].id;
  }

  // 1) Inject a Custom Question for Programs
  const qDocId = `${Date.now()}_q1`;
  await setDoc(doc(db, col("custom_questions_programs"), qDocId), {
    id: qDocId,
    nombre: "¿Posee algún título técnico previo?",
    programaId: progId,
    gestionInterna: true,
    obligatoria: true,
    estado: "Activa",
    tipo: "Sí o No"
  });
  console.log(`✓ Pregunta Personalizada inyectada (ID: ${qDocId})`);

  // 2) Inject an Agrupación (Grouping)
  const gDocId = `${Date.now()}_g1`;
  await setDoc(doc(db, col("groupings"), gDocId), {
    id: gDocId,
    codigo: "AGR-CIE",
    nombre: "Ciencias Exactas",
    porcentaje: "100",
    estado: "Activo"
  });
  console.log(`✓ Agrupación inyectada (ID: ${gDocId})`);

  // 3) Inject an Evaluación Parameter (Escala)
  const eDocId = `${Date.now()}_e1`;
  await setDoc(doc(db, col("eval_parameters"), eDocId), {
    id: eDocId,
    nivelDesempeno: "Superior",
    notaMinima: "4.6",
    notaMaxima: "5.0",
    reglaConceptual: "El estudiante demuestra dominio excepcional y competencias avanzadas en todos los criterios evaluados correspondientes al periodo académico actual.",
    estado: "Activo"
  });
  console.log(`✓ Parámetro de Evaluación (Escala) inyectado (ID: ${eDocId})`);

  console.log("All done!");
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
