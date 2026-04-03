import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDocs, collection } from "firebase/firestore";

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

async function run() {
  const TENANT = "bd-colegio-san-jose";
  const col = (name) => `${TENANT}_${name}`;
  const now = Date.now();

  const extraSubjects = [
    { id: "sub-sj-edu", codigo: "EDU-10", nombre: "Educación Física", abreviacion: "EDU", estado: "Activa" },
    { id: "sub-sj-art", codigo: "ART-10", nombre: "Artística", abreviacion: "ART", estado: "Activa" },
    { id: "sub-sj-eti", codigo: "ETI-10", nombre: "Ética y Valores", abreviacion: "ETI", estado: "Activa" },
    { id: "sub-sj-rel", codigo: "REL-10", nombre: "Religión", abreviacion: "REL", estado: "Activa" },
    { id: "sub-sj-inf", codigo: "INF-10", nombre: "Informática", abreviacion: "INF", estado: "Activa" },
    { id: "sub-sj-fis", codigo: "FIS-10", nombre: "Física", abreviacion: "FIS", estado: "Activa" },
    { id: "sub-sj-qui", codigo: "QUI-10", nombre: "Química", abreviacion: "QUI", estado: "Activa" },
    { id: "sub-sj-fil", codigo: "FIL-10", nombre: "Filosofía", abreviacion: "FIL", estado: "Activa" },
    { id: "sub-sj-eco", codigo: "ECO-10", nombre: "Economía y Política", abreviacion: "ECO", estado: "Activa" }
  ];

  let added = 0;
  for (const s of extraSubjects) {
    await setDoc(doc(db, col("academic_subjects"), s.id), { ...s, createdAt: now });
    added++;
  }

  // Update stats
  const snap = await getDocs(collection(db, col("academic_subjects")));
  await setDoc(doc(db, col("institution_metadata"), "stats"), {
    subjectsCount: snap.size,
    lastSync: now
  }, { merge: true });

  console.log(`✅ Registradas ${added} asignaturas adicionales. Total en BD: ${snap.size}`);
  process.exit(0);
}

run().catch(e => { console.error("❌ Error:", e.message); process.exit(1); });
