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
const now = Date.now();
const TENANT = "colegiosanjose";
const col = (name) => `${TENANT}_${name}`;

async function run() {
  console.log("Iniciando inyección de estudiantes y materias múltiples...");

  // Asignaturas y Programas (asumiendo que ya existen, o los recreamos parcialmente si faltan)
  const progIdSexto = "prog-sj-bach"; // Reutilizamos el de bachillerato
  const progIdDecimo = "prog-sj-bach";
  const sedeId = "sede-sj-principal";

  const subjects = [
    { id: "sub-sj-mat", nombre: "Matemáticas" },
    { id: "sub-sj-esp", nombre: "Español y Literatura" },
    { id: "sub-sj-cie", nombre: "Ciencias Naturales" },
    { id: "sub-sj-soc", nombre: "Ciencias Sociales" },
    { id: "sub-sj-ing", nombre: "Inglés" }
  ];

  // 1. Docentes para esas asignaturas
  // Traemos los docentes actuales (docente-sanjose-001, doc-sj-prim-01, doc-sj-sec-01)
  const teachersSnap = await getDocs(collection(db, col("teachers")));
  const teachers = teachersSnap.docs.map(d => ({id: d.id, ...d.data()}));
  const teacherMat = teachers.find(t => t.especialidad?.includes("Mat")) || teachers[0];
  const teacherCie = teachers.find(t => t.especialidad?.includes("Cie")) || teachers[1] || teachers[0];
  const teacherEsp = teachers[2] || teachers[0];

  // 2. Estudiantes (2 Sexto A, 1 Décimo)
  const studentsSexto = [
    { id: "stud-sj-sexto-01", nombres: "Carlos", apellidos: "Mendoza", identificacion: "1055234001", email: "cmendoza@gmail.com" },
    { id: "stud-sj-sexto-02", nombres: "Lucía", apellidos: "Fernández", identificacion: "1055234002", email: "lfernandez@gmail.com" }
  ];
  const studentDecimo = { id: "stud-sj-decimo-01", nombres: "Andrés Felipe", apellidos: "Castillo", identificacion: "1055234981", email: "acastillo@gmail.com" };

  for(const s of [...studentsSexto, studentDecimo]) {
    await setDoc(doc(db, col("students"), s.id), {
      ...s, name: `${s.nombres} ${s.apellidos}`, status: "active", createdAt: now
    });
  }

  // 3. Grupos (Salones)
  const grupoSextoId = "grupo-sj-6a-2026";
  const grupoDecimoId = "grupo-sj-10a-2026"; // Podemos reusar o crear
  
  await setDoc(doc(db, col("grupos"), grupoSextoId), {
    id: grupoSextoId, codigo: "GRP-6A", nombre: "Grupo 6° A", programaId: progIdSexto,
    cupoMaximo: "30", estado: "Activo", estudiantes: studentsSexto.map(s => s.id), periodo: "2026 - 01", createdAt: now
  });

  await setDoc(doc(db, col("grupos"), grupoDecimoId), {
    id: grupoDecimoId, codigo: "GRP-10A", nombre: "Grupo 10° A", programaId: progIdDecimo,
    cupoMaximo: "30", estado: "Activo", estudiantes: [studentDecimo.id, "stud-sanjose-001"], periodo: "2026 - 01", createdAt: now
  }); // Agregamos al estudiante existente "stud-sanjose-001" al Décimo también para no dejarlo sin grupo

  // Actualizar students con su grupo
  for(const s of studentsSexto) {
    await setDoc(doc(db, col("students"), s.id), { grupoId: grupoSextoId, nivel: "6", grupo: "A", sedeId, programaId: progIdSexto }, { merge: true });
  }
  await setDoc(doc(db, col("students"), studentDecimo.id), { grupoId: grupoDecimoId, nivel: "10", grupo: "A", sedeId, programaId: progIdDecimo }, { merge: true });

  // 4. Cursos (Clases, ej: 6A Matemáticas, 6A Ciencias, 10A Matemáticas) - Esto enlaza Estudiantes con Múltiples Materias
  const cursosNuevos = [
    { id: "curso-sj-6a-mat", codigo: "6A-MAT", nombre: "6° A - Matemáticas", programaId: progIdSexto, asignaturaId: "sub-sj-mat", docenteId: teacherMat?.id, docenteNombre: teacherMat?.name },
    { id: "curso-sj-6a-cie", codigo: "6A-CIE", nombre: "6° A - Ciencias Naturales", programaId: progIdSexto, asignaturaId: "sub-sj-cie", docenteId: teacherCie?.id, docenteNombre: teacherCie?.name },
    { id: "curso-sj-6a-esp", codigo: "6A-ESP", nombre: "6° A - Español", programaId: progIdSexto, asignaturaId: "sub-sj-esp", docenteId: teacherEsp?.id, docenteNombre: teacherEsp?.name },
    
    // Décimo ya tenía curso-sj-10a-2026, lo ampliamos con otras materias
    { id: "curso-sj-10a-mat", codigo: "10A-MAT", nombre: "10° A - Matemáticas", programaId: progIdDecimo, asignaturaId: "sub-sj-mat", docenteId: teacherMat?.id, docenteNombre: teacherMat?.name },
    { id: "curso-sj-10a-cie", codigo: "10A-CIE", nombre: "10° A - Ciencias Naturales", programaId: progIdDecimo, asignaturaId: "sub-sj-cie", docenteId: teacherCie?.id, docenteNombre: teacherCie?.name },
    { id: "curso-sj-10a-ing", codigo: "10A-ING", nombre: "10° A - Inglés", programaId: progIdDecimo, asignaturaId: "sub-sj-ing", docenteId: teacherEsp?.id, docenteNombre: teacherEsp?.name }
  ];

  for(const c of cursosNuevos) {
    await setDoc(doc(db, col("cursos"), c.id), {
      ...c, programaNombre: "Bachillerato Académico", sedeJornada: `${sedeId}::jor-sj-manana`, sedeJornadaLabel: "SEDE PRINCIPAL SAN JOSÉ - Mañana",
      cupoMaximo: "30", cuposOcupados: c.id.includes("6a") ? 2 : 2, periodo: "2026 - 01", estado: "Activo", createdAt: now
    }, { merge: true });
  }

  // Actualizamos métricas
  const stCount = (await getDocs(collection(db, col("students")))).size;
  await setDoc(doc(db, col("institution_metadata"), "stats"), { studentsCount: stCount }, { merge: true });

  console.log("✅ Estudiantes matriculados: 2 en Sexto A (con 3 materias), 1 en Décimo (con 3 materias).");
  console.log("✅ Puedes ir a 'Estudiantes' o 'Grupos' para ver el resultado.");
}

run().then(() => process.exit(0)).catch(console.error);
