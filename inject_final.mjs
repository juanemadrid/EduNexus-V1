import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

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

async function clearCollection(name) {
  const snap = await getDocs(collection(db, col(name)));
  for (const d of snap.docs) {
    await deleteDoc(doc(db, col(name), d.id));
  }
}

async function run() {
  console.log("🚀 Iniciando inyección masiva de datos REALES para Nueva Esperanza...");

  const cols = ["sedes", "academic_programs", "cursos", "academic_subjects", "teachers", "students", "grupos", "institution_metadata"];
  for (const c of cols) await clearCollection(c);

  const sedeId = "sede-principal-hq";
  const jornadaId = "jor-manana-001";
  const progId = "prog-bach-001";
  const cursoId = "curso-10a-2026";
  const grupoId = "grupo-10a-manana";

  // 1. SEDE Y JORNADA
  await setDoc(doc(db, col("sedes"), sedeId), {
    id: sedeId, nombre: "SEDE PRINCIPAL NUEVA ESPERANZA", direccion: "Calle 12 # 45-67", ciudad: "Barranquilla", telefono: "6053456789", estado: "Activa",
    jornadas: [{ id: jornadaId, nombre: "Mañana", estado: "Activa", sedeId: sedeId, programas: [] }], createdAt: now
  });

  // 2. PROGRAMA
  await setDoc(doc(db, col("academic_programs"), progId), {
    id: progId, nombre: "Bachillerato Académico", codigo: "BACH-ACAD", categoria: "Educación Media", estado: "Activo", createdAt: now
  });

  // 3. CURSO
  await setDoc(doc(db, col("cursos"), cursoId), {
    id: cursoId, nombre: "10A", descripcion: "DÉCIMO GRADO A", nivel: "10", grupo: "A", sedeId: sedeId, jornadaId: jornadaId, programaId: progId, capacidad: 35, estado: "Activo", createdAt: now
  });

  // 4. MATERIAS
  const subjects = [
    { id: "sub-mat", nombre: "Matemáticas Superior", codigo: "MAT-10", abreviacion: "MAT" },
    { id: "sub-esp", nombre: "Lengua Castellana", codigo: "ESP-10", abreviacion: "ESP" },
    { id: "sub-ing", nombre: "Inglés B2", codigo: "ING-10", abreviacion: "ING" },
    { id: "sub-fis", nombre: "Física Cuántica Básica", codigo: "FIS-10", abreviacion: "FIS" }
  ];
  for (const s of subjects) {
    await setDoc(doc(db, col("academic_subjects"), s.id), { ...s, estado: "Activa", createdAt: now });
  }

  // 5. DOCENTES
  const teachers = [
    { id: "teach-01", nombre: "Ricardo", apellido: "Arjona", name: "Ricardo Arjona", email: "rarjona@nuevaesperanza.edu", telefono: "3104567890" },
    { id: "teach-02", nombre: "Beatriz", apellido: "Pinzón", name: "Beatriz Pinzón", email: "bpinzon@nuevaesperanza.edu", telefono: "3115678901" }
  ];
  for (const t of teachers) {
    await setDoc(doc(db, col("teachers"), t.id), { ...t, estado: "active", status: "active", createdAt: now });
  }

  // 6. ESTUDIANTE (JUAN EDUARDO MADRID + OTROS 4)
  const students = [
    { id: "stud-01", name: "Juan Eduardo Madrid", email: "jmadrid@estudiante.co", gpa: 4.8 },
    { id: "stud-02", name: "Mariana Restrepo", email: "mrestrepo@estudiante.co", gpa: 4.2 },
    { id: "stud-03", name: "Carlos Mario Cano", email: "ccano@estudiante.co", gpa: 3.5 },
    { id: "stud-04", name: "Elena de Troya", email: "etroya@estudiante.co", gpa: 4.9 },
    { id: "stud-05", name: "Pedro Infante", email: "pinfante@estudiante.co", gpa: 3.9 }
  ];
  const studentIds = students.map(s => s.id);
  for (const s of students) {
    await setDoc(doc(db, col("students"), s.id), { ...s, level: "10A", status: "active", courseId: cursoId, sedeId: sedeId, createdAt: now });
  }

  // 7. GRUPO
  await setDoc(doc(db, col("grupos"), grupoId), {
    id: grupoId, codigo: "GRP-10A-M", nombre: "Grupo A - 10° Mañana", cursoId: cursoId, cupoMaximo: "35", estado: "Activo", estudiantes: studentIds, createdAt: now
  });

  // 8. STATS
  await setDoc(doc(db, col("institution_metadata"), "stats"), {
    studentsCount: students.length, teachersCount: teachers.length, coursesCount: 1, lastSync: now
  });

  console.log("✅ Inyección COMPLETA. 5 Estudiantes, 2 Docentes, 4 Materias y 1 Grupo creados.");
  process.exit(0);
}
run();
