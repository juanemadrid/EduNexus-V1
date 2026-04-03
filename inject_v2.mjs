/**
 * INYECCIÓN DIRECTA - NUEVA ESPERANZA
 * Estructura exacta extraída del código fuente de la app.
 * Colecciones con prefijo: nuevaesperanza_
 */
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, addDoc, writeBatch, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3YF1D0ih9ftk2pnFw8u5D1lJqz6KJu_A",
  authDomain: "edunexus-oficial.firebaseapp.com",
  projectId: "edunexus-oficial",
  storageBucket: "edunexus-oficial.firebasestorage.app",
  messagingSenderId: "462948258278",
  appId: "1:462948258278:web:cf75816eb7c3d4351d8627"
};

const TENANT = "nuevaesperanza";
const col = (name) => `${TENANT}_${name}`;
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const now = Date.now();

// ─── ESTRUCTURA REAL ────────────────────────────────────────────────────────
// sedes: { id, nombre, direccion, ciudad, telefono, estado, jornadas: [{id, nombre, estado, sedeId, programas:[]}] }
// academic_programs: { id, nombre, codigo, categoria, estado }
// courses: (colección "cursos") { id, nombre, codigo, sedeId, jornadaId, programaId, capacidad, estado }
// teachers: { id, nombre, apellido, email, telefono, estado, ... }
// students: { id, name, email, level, status, gpa, courseId, ... }

async function clearCollection(name) {
  const snap = await getDocs(collection(db, col(name)));
  for (const d of snap.docs) {
    await deleteDoc(doc(db, col(name), d.id));
  }
  console.log(`  Limpiada: ${col(name)} (${snap.size} docs)`);
}

async function run() {
  console.log("=====================================================");
  console.log(" INYECCIÓN DIRECTA CON ESTRUCTURA EXACTA");
  console.log(" Tenant: nuevaesperanza");
  console.log("=====================================================\n");

  // Limpiar datos anteriores mal estructurados
  console.log("Limpiando colecciones anteriores...");
  await clearCollection("sedes");
  await clearCollection("academic_programs");
  await clearCollection("cursos");
  await clearCollection("teachers");
  await clearCollection("students");

  console.log("\n--- Creando datos nuevos ---\n");

  const sedeId = `sede-${now}`;
  const jornadaId = `jor-${now}`;
  const programaId = `prog-${now}`;
  const cursoId = `curso-${now}`;
  const teacherId = `teacher-${now}`;
  const studentId = `student-${now}`;

  // 1. SEDE con jornada embebida (estructura EXACTA del código fuente)
  console.log("1. Creando SEDE PRINCIPAL con Jornada Mañana...");
  await setDoc(doc(db, col("sedes"), sedeId), {
    id: sedeId,
    nombre: "SEDE PRINCIPAL",
    direccion: "Calle 1 # 2-3",
    ciudad: "Bogotá",
    telefono: "3001234567",
    estado: "Activa",
    jornadas: [
      {
        id: jornadaId,
        nombre: "Mañana",
        estado: "Activa",
        sedeId: sedeId,
        programas: []
      }
    ],
    createdAt: now
  });
  console.log(`   ✓ ${col("sedes")} / ${sedeId}`);

  // 2. PROGRAMA ACADÉMICO
  console.log("2. Creando Programa: Bachillerato...");
  await setDoc(doc(db, col("academic_programs"), programaId), {
    id: programaId,
    nombre: "Bachillerato",
    codigo: "BACH",
    categoria: "Básica Secundaria",
    estado: "Activo",
    createdAt: now
  });
  console.log(`   ✓ ${col("academic_programs")} / ${programaId}`);

  // 3. CURSO (colección "cursos")
  console.log("3. Creando Curso: 10A - Décimo...");
  await setDoc(doc(db, col("cursos"), cursoId), {
    id: cursoId,
    nombre: "10A",
    descripcion: "Décimo Grado A",
    sedeId: sedeId,
    sedeNombre: "SEDE PRINCIPAL",
    jornadaId: jornadaId,
    jornadaNombre: "Mañana",
    programaId: programaId,
    programaNombre: "Bachillerato",
    capacidad: 40,
    estado: "Activo",
    nivel: "10",
    grupo: "A",
    createdAt: now
  });
  console.log(`   ✓ ${col("cursos")} / ${cursoId}`);

  // 4. DOCENTE (campos del formulario: nombre, apellido, email, telefono)
  console.log("4. Registrando Docente: Carlos Pérez...");
  await setDoc(doc(db, col("teachers"), teacherId), {
    id: teacherId,
    nombre: "Carlos",
    apellido: "Pérez",
    name: "Carlos Pérez",
    email: "carlos.perez@nuevaesperanza.edu",
    telefono: "3009876543",
    cursoId: cursoId,
    cursoNombre: "10A",
    estado: "active",
    status: "active",
    createdAt: now
  });
  console.log(`   ✓ ${col("teachers")} / ${teacherId}`);

  // 5. ESTUDIANTE (campo "name" es lo que muestra la tabla)
  console.log("5. Matriculando Estudiante: Juan Eduardo Madrid...");
  await setDoc(doc(db, col("students"), studentId), {
    id: studentId,
    name: "Juan Eduardo Madrid",
    email: "juan.madrid@estudiante.nuevaesperanza.edu",
    level: "10A",
    gpa: 4.2,
    status: "active",
    courseId: cursoId,
    courseName: "10A",
    sedeId: sedeId,
    sedeName: "SEDE PRINCIPAL",
    documentNumber: "1122334455",
    createdAt: now
  });
  console.log(`   ✓ ${col("students")} / ${studentId}`);

  console.log("\n=====================================================");
  console.log(" ✅ DATOS INYECTADOS CORRECTAMENTE EN FIRESTORE");
  console.log("=====================================================");
  console.log("\nAhora recarga las siguientes páginas en el navegador:");
  console.log("  • Dashboard:   https://edu-nexus-v1.vercel.app/dashboard");
  console.log("  • Sedes:       https://edu-nexus-v1.vercel.app/dashboard/academic/structuring/sede-jornada");
  console.log("  • Estudiantes: https://edu-nexus-v1.vercel.app/dashboard/students");
  console.log("  • Docentes:    https://edu-nexus-v1.vercel.app/dashboard/teachers");

  process.exit(0);
}

run().catch(e => {
  console.error("❌ ERROR:", e.message);
  process.exit(1);
});
