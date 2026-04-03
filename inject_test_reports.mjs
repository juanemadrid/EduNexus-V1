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
const now = Date.now();

async function run() {
  console.log("🔍 Leyendo estudiantes y cursos existentes...");

  // 1. Leer estudiantes REALES de Firestore
  const studentsSnap = await getDocs(collection(db, col("students")));
  const students = studentsSnap.docs.map(d => ({id: d.id, ...d.data()}));
  console.log(`✅ ${students.length} estudiantes encontrados:`);
  students.forEach(s => console.log(`  - ID: ${s.id} | Nombre: ${s.name || s.nombres} ${s.apellidos || ''}`));

  if (students.length === 0) {
    console.log("❌ No hay estudiantes en la base de datos. Inyección abortada.");
    return;
  }

  // 2. Leer cursos REALES
  const cursosSnap = await getDocs(collection(db, col("cursos")));
  const cursos = cursosSnap.docs.map(d => ({id: d.id, ...d.data()}));
  console.log(`\n✅ ${cursos.length} cursos encontrados:`);
  cursos.forEach(c => console.log(`  - ID: ${c.id} | Nombre: ${c.nombre || c.asignaturaNombre}`));

  // 3. Inyectar notas bajas (<3.0) usando IDs REALES de estudiantes y cursos
  const s1 = students[0];
  const s2 = students.length > 1 ? students[1] : students[0];
  const c1 = cursos[0] || { id: "curso-default", asignaturaNombre: "Matemáticas" };
  const c2 = cursos[1] || c1;

  console.log(`\n📝 Inyectando nota baja para: ${s1.name || s1.nombres} en ${c1.nombre || c1.asignaturaNombre}`);
  await setDoc(doc(db, col("academic_grades"), `grade-dif-${s1.id}-1`), {
    id: `grade-dif-${s1.id}-1`,
    studentId: s1.id,
    cursoId: c1.id,
    courseName: c1.nombre || c1.asignaturaNombre || "Matemáticas",
    grade: 1.8,
    period: "2026 - 01",
    createdAt: now
  });

  if (s2.id !== s1.id) {
    console.log(`📝 Inyectando nota baja para: ${s2.name || s2.nombres} en ${c2.nombre || c2.asignaturaNombre}`);
    await setDoc(doc(db, col("academic_grades"), `grade-dif-${s2.id}-1`), {
      id: `grade-dif-${s2.id}-1`,
      studentId: s2.id,
      cursoId: c2.id,
      courseName: c2.nombre || c2.asignaturaNombre || "Ciencias",
      grade: 2.3,
      period: "2026 - 01",
      createdAt: now
    });
  }

  console.log("\n✅ ¡Notas inyectadas correctamente!");
  console.log("👉 Ahora recarga el reporte con filtro en 'Todos' y período '2026 - 01'");
}

run().then(() => process.exit(0)).catch(e => { console.error("Error:", e); process.exit(1); });
