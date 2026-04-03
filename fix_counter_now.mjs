import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, doc, getDoc } from "firebase/firestore";

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

async function fixNow() {
  console.log("=== DIAGNÓSTICO COMPLETO ===\n");

  // 1. Contar docentes reales
  const snapT = await getDocs(collection(db, "nuevaesperanza_teachers"));
  console.log(`✅ nuevaesperanza_teachers: ${snapT.size} documentos`);
  snapT.forEach(d => console.log(`   - ${d.id}: ${d.data().name || d.data().fullName || JSON.stringify(d.data()).substring(0,60)}`));

  // 2. Contar estudiantes reales
  const snapS = await getDocs(collection(db, "nuevaesperanza_students"));
  console.log(`\n✅ nuevaesperanza_students: ${snapS.size} documentos`);

  // 3. Leer el stats actual
  const statsRef = doc(db, "nuevaesperanza_institution_metadata", "stats");
  const statsDoc = await getDoc(statsRef);
  console.log(`\n📊 Stats actual en Firestore:`);
  console.log(JSON.stringify(statsDoc.exists() ? statsDoc.data() : "NO EXISTE", null, 2));

  // 4. Forzar actualización con setDoc (merge)
  const newTeachersCount = snapT.size;
  const newStudentsCount = snapS.size;
  
  await setDoc(statsRef, {
    teachersCount: newTeachersCount,
    studentsCount: newStudentsCount,
    lastSync: Date.now()
  }, { merge: true });

  console.log(`\n🔧 Forzando actualización: teachersCount=${newTeachersCount}, studentsCount=${newStudentsCount}`);

  // 5. Leer de vuelta para confirmar
  const statsDocAfter = await getDoc(statsRef);
  console.log(`\n✅ Stats DESPUÉS de actualizar:`);
  console.log(JSON.stringify(statsDocAfter.data(), null, 2));

  process.exit(0);
}

fixNow().catch(e => { console.error("ERROR:", e); process.exit(1); });
