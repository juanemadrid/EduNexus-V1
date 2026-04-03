import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, writeBatch } from "firebase/firestore";

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

async function run() {
  console.log("====================================================");
  console.log(" INYECCIÓN DIRECTA EN FIRESTORE - NUEVA ESPERANZA");
  console.log("====================================================\n");

  const now = Date.now();
  const batch = writeBatch(db);

  // 1. SEDE
  console.log("1. Creando Sede Principal...");
  const sedeId = "sede-principal-001";
  batch.set(doc(db, col("branches"), sedeId), {
    id: sedeId,
    name: "SEDE PRINCIPAL",
    address: "Calle 1 #2-3",
    city: "Bogotá",
    isActive: true,
    createdAt: now
  });

  // 2. JORNADA
  console.log("2. Creando Jornada Única...");
  const jornadaId = "jornada-unica-001";
  batch.set(doc(db, col("schedules"), jornadaId), {
    id: jornadaId,
    name: "Jornada Única",
    branchId: sedeId,
    branchName: "SEDE PRINCIPAL",
    startTime: "06:00",
    endTime: "14:00",
    isActive: true,
    createdAt: now
  });

  // 3. PROGRAMA / NIVEL
  console.log("3. Creando Nivel de Bachillerato...");
  const programId = "bachillerato-001";
  batch.set(doc(db, col("programs"), programId), {
    id: programId,
    name: "Bachillerato",
    code: "BACH",
    isActive: true,
    createdAt: now
  });

  // 4. CURSO 10A
  console.log("4. Creando Curso 10A...");
  const cursoId = "curso-10a-001";
  batch.set(doc(db, col("courses"), cursoId), {
    id: cursoId,
    name: "10A",
    fullName: "DÉCIMO GRADO A",
    level: "10",
    group: "A",
    branchId: sedeId,
    branchName: "SEDE PRINCIPAL",
    scheduleId: jornadaId,
    scheduleName: "Jornada Única",
    programId: programId,
    capacity: 40,
    isActive: true,
    createdAt: now
  });

  // 5. MATERIAS
  console.log("5. Creando Materias (Matemáticas y Español)...");
  const matId1 = "materia-matematicas-001";
  const matId2 = "materia-espanol-001";
  batch.set(doc(db, col("subjects"), matId1), {
    id: matId1,
    name: "Matemáticas",
    code: "MAT",
    courseId: cursoId,
    courseName: "10A",
    isActive: true,
    createdAt: now
  });
  batch.set(doc(db, col("subjects"), matId2), {
    id: matId2,
    name: "Español",
    code: "ESP",
    courseId: cursoId,
    courseName: "10A",
    isActive: true,
    createdAt: now
  });

  // 6. DOCENTE
  console.log("6. Creando Docente: Profesor Guía Pérez...");
  const docenteId = "docente-001";
  batch.set(doc(db, col("teachers"), docenteId), {
    id: docenteId,
    firstName: "Profesor Guía",
    lastName: "Pérez",
    email: "profesor.guia@nuevaesperanza.edu",
    phone: "3001234567",
    courseId: cursoId,
    courseName: "10A",
    subjects: [matId1, matId2],
    isActive: true,
    createdAt: now
  });

  // 7. ESTUDIANTE
  console.log("7. Matriculando Estudiante: Juan Eduardo Madrid...");
  const estudianteId = "estudiante-001";
  batch.set(doc(db, col("students"), estudianteId), {
    id: estudianteId,
    firstName: "Juan Eduardo",
    lastName: "Madrid",
    documentNumber: "1122334455",
    courseId: cursoId,
    courseName: "10A",
    branchId: sedeId,
    branchName: "SEDE PRINCIPAL",
    enrollmentStatus: "ACTIVO",
    isActive: true,
    createdAt: now
  });

  // 8. METADATA / STATS
  console.log("8. Actualizando contadores del Dashboard...");
  batch.set(doc(db, col("institution_metadata"), "stats"), {
    studentsCount: 1,
    teachersCount: 1,
    coursesCount: 1,
    lastSync: now,
    updatedAt: now
  }, { merge: true });

  // COMMIT
  console.log("\nEjecutando batch commit en Firestore...");
  await batch.commit();

  console.log("\n====================================================");
  console.log(" ✅ TODOS LOS DATOS ESCRITOS EXITOSAMENTE EN FIRESTORE");
  console.log("====================================================");
  console.log("\nColecciones creadas:");
  console.log(`  - ${col("branches")}        → 1 sede`);
  console.log(`  - ${col("schedules")}       → 1 jornada`);
  console.log(`  - ${col("programs")}        → 1 programa`);
  console.log(`  - ${col("courses")}         → 1 curso (10A)`);
  console.log(`  - ${col("subjects")}        → 2 materias`);
  console.log(`  - ${col("teachers")}        → 1 docente`);
  console.log(`  - ${col("students")}        → 1 estudiante`);
  console.log(`  - ${col("institution_metadata")} → stats actualizados`);
  console.log("\nRecarga el dashboard en https://edu-nexus-v1.vercel.app/dashboard");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ ERROR:", err);
  process.exit(1);
});
