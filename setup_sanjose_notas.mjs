/**
 * SCRIPT: setup_sanjose_notas.mjs
 * Crea el flujo completo para Colegio San José:
 *  1. Asignatura (Matemáticas, Español, Ciencias)
 *  2. Sede / Jornada
 *  3. Programa Académico (Bachillerato)
 *  4. Curso/Grado (10° A)
 *  5. Enrolla a Juan Eduardo Madrid en el curso
 *  6. El docente registra notas para el estudiante
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3YF1D0ih9ftk2pnFw8u5D1lJqz6KJu_A",
  authDomain: "edunexus-oficial.firebaseapp.com",
  projectId: "edunexus-oficial",
  storageBucket: "edunexus-oficial.firebasestorage.app",
  messagingSenderId: "462948258278",
  appId: "1:462948258278:web:cf75816eb7c3d4351d8627"
};

// Buscar el tenant de San José
async function findSanJoseTenant(db) {
  const snap = await getDocs(collection(db, "tenants"));
  for (const d of snap.docs) {
    const data = d.data();
    const name = (data.name || data.nombre || d.id || '').toLowerCase();
    if (name.includes('san') || name.includes('jose') || name.includes('sanjose')) {
      return d.id;
    }
  }
  // fallback: buscar en collections con prefijo bd-colegio
  return "bd-colegio-san-jose";
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const now = Date.now();

async function run() {
  console.log("🔍 Buscando tenant de San José...");
  const TENANT = await findSanJoseTenant(db);
  const col = (name) => `${TENANT}_${name}`;
  console.log(`✅ Tenant: ${TENANT}`);

  // ── 1. BUSCAR DOCENTE Y ESTUDIANTE EXISTENTES ──────────────────────────────
  const teachersSnap = await getDocs(collection(db, col("teachers")));
  const studentsSnap = await getDocs(collection(db, col("students")));
  
  let teacherId, teacherName, studentId, studentName;

  if (teachersSnap.size > 0) {
    const t = teachersSnap.docs[0];
    teacherId = t.id;
    const td = t.data();
    teacherName = td.name || `${td.nombres || ''} ${td.apellidos || ''}`.trim() || "Docente Ejemplo";
    console.log(`👨‍🏫 Docente encontrado: ${teacherName} (${teacherId})`);
  } else {
    // Crear docente si no existe
    teacherId = "docente-sanjose-001";
    teacherName = "Carlos Pérez García";
    await setDoc(doc(db, col("teachers"), teacherId), {
      id: teacherId, name: teacherName, nombres: "Carlos", apellidos: "Pérez García",
      email: "cperez@sanjose.edu.co", telefono: "3001234567",
      status: "active", estado: "active", createdAt: now
    });
    console.log(`✅ Docente creado: ${teacherName}`);
  }

  if (studentsSnap.size > 0) {
    const s = studentsSnap.docs[0];
    studentId = s.id;
    const sd = s.data();
    studentName = sd.name || `${sd.nombres || ''} ${sd.apellidos || ''}`.trim() || "Estudiante Ejemplo";
    console.log(`🎓 Estudiante encontrado: ${studentName} (${studentId})`);
  } else {
    studentId = "stud-sanjose-001";
    studentName = "Juan Eduardo Madrid";
    await setDoc(doc(db, col("students"), studentId), {
      id: studentId, name: studentName, nombres: "Juan Eduardo", apellidos: "Madrid",
      email: "jemadrid@sanjose.edu.co", status: "active", createdAt: now
    });
    console.log(`✅ Estudiante creado: ${studentName}`);
  }

  // ── 2. ASIGNATURAS ─────────────────────────────────────────────────────────
  const subjects = [
    { id: "sub-sj-mat", codigo: "MAT-10", nombre: "Matemáticas", abreviacion: "MAT", estado: "Activa" },
    { id: "sub-sj-esp", codigo: "ESP-10", nombre: "Español y Literatura", abreviacion: "ESP", estado: "Activa" },
    { id: "sub-sj-cie", codigo: "CIE-10", nombre: "Ciencias Naturales", abreviacion: "CIE", estado: "Activa" },
    { id: "sub-sj-soc", codigo: "SOC-10", nombre: "Ciencias Sociales", abreviacion: "SOC", estado: "Activa" },
    { id: "sub-sj-ing", codigo: "ING-10", nombre: "Inglés", abreviacion: "ING", estado: "Activa" },
  ];
  for (const s of subjects) {
    await setDoc(doc(db, col("academic_subjects"), s.id), { ...s, createdAt: now });
  }
  console.log(`✅ ${subjects.length} asignaturas creadas`);

  // ── 3. SEDE Y JORNADA ──────────────────────────────────────────────────────
  const sedeId = "sede-sj-principal";
  const jornadaId = "jor-sj-manana";
  const progId = "prog-sj-bach";

  await setDoc(doc(db, col("sedes"), sedeId), {
    id: sedeId, nombre: "SEDE PRINCIPAL SAN JOSÉ", direccion: "Cra 45 # 12-34",
    ciudad: "Barranquilla", telefono: "6054321234", estado: "Activa",
    jornadas: [{
      id: jornadaId, nombre: "Mañana", estado: "Activa", sedeId: sedeId,
      programas: [{ id: progId, nombre: "Bachillerato Académico", codigo: "BACH", categoria: "Bachillerato", estado: "Activo" }]
    }],
    createdAt: now
  });
  console.log("✅ Sede y jornada creadas");

  // ── 4. PROGRAMA ACADÉMICO ─────────────────────────────────────────────────
  const pensumSubjects = subjects.map(s => ({
    id: s.id, subjectId: s.id, nombre: s.nombre, codigo: s.codigo,
    horasSemanales: 4, creditos: 3
  }));

  await setDoc(doc(db, col("academic_programs"), progId), {
    id: progId, nombre: "Bachillerato Académico", codigo: "BACH",
    categoria: "Bachillerato", tipoEvaluacion: "Cuantitativo",
    estado: "Activo", pensumSubjects, createdAt: now
  });
  console.log("✅ Programa académico creado con pénsum");

  // ── 5. CURSO / GRADO 10° A ────────────────────────────────────────────────
  const cursoId = "curso-sj-10a-2026";
  await setDoc(doc(db, col("cursos"), cursoId), {
    id: cursoId,
    codigo: "10A-MAT-2026",
    nombre: "Grado 10° A - Matemáticas",
    programaId: progId,
    programaNombre: "Bachillerato Académico",
    asignaturaId: "sub-sj-mat",
    asignaturaNombre: "Matemáticas",
    docenteId: teacherId,
    docenteNombre: teacherName,
    sedeJornada: `${sedeId}::${jornadaId}`,
    sedeJornadaLabel: "SEDE PRINCIPAL SAN JOSÉ - Mañana",
    cupoMaximo: "35",
    cuposOcupados: 1,
    periodo: "2026 - 01",
    fechaInicio: "2026-01-15",
    fechaFin: "2026-06-30",
    estado: "Activo",
    createdAt: now
  });
  console.log("✅ Curso Grado 10° A creado");

  // ── 6. GRUPO (matrícula del estudiante) ────────────────────────────────────
  const grupoId = "grupo-sj-10a-2026";
  await setDoc(doc(db, col("grupos"), grupoId), {
    id: grupoId,
    codigo: "GRP-10A-M",
    nombre: "Grupo 10° A - Mañana",
    cursoId: cursoId,
    programaId: progId,
    cupoMaximo: "35",
    estado: "Activo",
    estudiantes: [studentId],
    docenteId: teacherId,
    periodo: "2026 - 01",
    createdAt: now
  });
  console.log("✅ Grupo creado con estudiante matriculado");

  // Actualizar el estudiante con su curso asignado
  await setDoc(doc(db, col("students"), studentId), {
    courseId: cursoId, grupoId, nivel: "10", grupo: "A",
    programaId: progId, sedeId
  }, { merge: true });

  // ── 7. NOTAS DEL DOCENTE ──────────────────────────────────────────────────
  const periodos = ["Periodo 1", "Periodo 2", "Periodo 3", "Periodo 4"];
  const notasData = {
    id: `notas-${studentId}-${cursoId}`,
    studentId, studentName,
    cursoId, grupoId,
    teacherId, teacherName,
    programaId: progId,
    periodo: "2026 - 01",
    asignaturas: subjects.map(subj => ({
      subjectId: subj.id,
      subjectName: subj.nombre,
      codigo: subj.codigo,
      notas: periodos.map((p, idx) => ({
        periodo: p,
        nota: parseFloat((3.5 + Math.random() * 1.4).toFixed(1)), // entre 3.5 y 4.9
        observacion: "Buen desempeño",
        fechaRegistro: now,
        docenteId: teacherId
      })),
      notaFinal: 0,
      estado: "Activo"
    })),
    createdAt: now,
    updatedAt: now
  };
  // Calcular nota final de cada asignatura
  notasData.asignaturas.forEach(a => {
    a.notaFinal = parseFloat((a.notas.reduce((s,n) => s + n.nota, 0) / a.notas.length).toFixed(2));
  });

  await setDoc(doc(db, col("notas"), notasData.id), notasData);
  console.log(`✅ Notas registradas para ${studentName}`);

  // ── 8. ACTUALIZAR STATS ───────────────────────────────────────────────────
  await setDoc(doc(db, col("institution_metadata"), "stats"), {
    studentsCount: studentsSnap.size || 1,
    teachersCount: teachersSnap.size || 1,
    coursesCount: 1,
    subjectsCount: subjects.length,
    lastSync: now
  }, { merge: true });

  console.log("\n🎉 ===== FLUJO COMPLETO CREADO =====");
  console.log(`   👨‍🏫 Docente: ${teacherName}`);
  console.log(`   🎓 Estudiante: ${studentName}`);
  console.log(`   📚 Asignaturas: ${subjects.map(s=>s.nombre).join(", ")}`);
  console.log(`   🏫 Curso: Grado 10° A - Matemáticas`);
  console.log(`   📝 Notas: Registradas para ${periodos.length} períodos`);
  console.log("=====================================\n");
  console.log("Ahora puedes ir a:");
  console.log("  - /dashboard/academic/structuring/subjects → ver las asignaturas");
  console.log("  - /dashboard/academic/structuring/cursos → ver el grado 10° A");
  console.log("  - /dashboard/students → ver el estudiante matriculado");
  console.log("  - /dashboard/reports/consolidado-de-notas → ver las notas\n");

  process.exit(0);
}

run().catch(e => { console.error("❌ Error:", e.message); process.exit(1); });
