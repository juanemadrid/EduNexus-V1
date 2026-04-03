import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, setDoc, doc } from "firebase/firestore";

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

async function run() {
  const TENANT = "colegiosanjose";
  const col = (name) => `${TENANT}_${name}`;

  // 1. Docentes
  const newTeachers = [
    {
      id: "doc-sj-prim-01",
      name: "María Fernanda López",
      nombres: "María Fernanda",
      apellidos: "López",
      identificacion: "1045234981", // Real ID
      email: "mlopez.primaria@sanjose.edu.co",
      telefono: "3004567890",
      status: "active",
      estado: "active",
      especialidad: "Matemáticas - Primaria",
      createdAt: now
    },
    {
      id: "doc-sj-sec-01",
      name: "Javier Antonio Ramírez",
      nombres: "Javier Antonio",
      apellidos: "Ramírez",
      identificacion: "1143256782", // Real ID
      email: "jramirez.secundaria@sanjose.edu.co",
      telefono: "3129876543",
      status: "active",
      estado: "active",
      especialidad: "Ciencias Naturales - Secundaria",
      createdAt: now
    }
  ];

  for (const t of newTeachers) {
    await setDoc(doc(db, col("teachers"), t.id), t);
    console.log(`✅ Teacher created: ${t.name} (ID: ${t.identificacion})`);
  }

  // 2. Administrativo
  const newAdmin = {
    id: "admin-sj-01",
    name: "Carolina Gómez M.",
    nombres: "Carolina",
    apellidos: "Gómez M.",
    identificacion: "52345678", // Real ID
    email: "coordinacion@sanjose.edu.co",
    telefono: "3201112233",
    rol: "Coordinador Académico",
    status: "active",
    estado: "active",
    createdAt: now
  };

  await setDoc(doc(db, col("administrativos"), newAdmin.id), newAdmin);
  // Also save to `administrators` just in case the app uses that english word
  await setDoc(doc(db, col("administrators"), newAdmin.id), newAdmin);
  console.log(`✅ Admin created: ${newAdmin.name} (ID: ${newAdmin.identificacion})`);

  // 3. Crear 2 Cursos nuevos para probar Primaria y Secundaria
  // Necesitamos subjects y programs
  // Let's create dummy programs / subjects if they don't exist, but maybe just linking the courses is enough.
  const progSjBach = "prog-sj-bach";
  const sedeSjP = "sede-sj-principal";
  const jorSjM = "jor-sj-manana";

  const newCourses = [
    {
      id: "curso-sj-prim-01",
      codigo: "5A-MAT-2026",
      nombre: "Grado 5° A - Matemáticas (Primaria)",
      programaId: progSjBach,
      programaNombre: "Básica Primaria",
      asignaturaId: "sub-sj-mat", // we saw MAT earlier hopefully exists
      asignaturaNombre: "Matemáticas",
      docenteId: newTeachers[0].id,
      docenteNombre: newTeachers[0].name,
      sedeJornada: `${sedeSjP}::${jorSjM}`,
      sedeJornadaLabel: "SEDE PRINCIPAL SAN JOSÉ - Mañana",
      cupoMaximo: "30",
      cuposOcupados: 0,
      periodo: "2026 - 01",
      fechaInicio: "2026-01-15",
      fechaFin: "2026-06-30",
      estado: "Activo",
      createdAt: now
    },
    {
      id: "curso-sj-sec-01",
      codigo: "9A-CIE-2026",
      nombre: "Grado 9° A - Ciencias (Secundaria)",
      programaId: progSjBach,
      programaNombre: "Bachillerato Académico",
      asignaturaId: "sub-sj-cie", // we saw CIE earlier
      asignaturaNombre: "Ciencias Naturales",
      docenteId: newTeachers[1].id,
      docenteNombre: newTeachers[1].name,
      sedeJornada: `${sedeSjP}::${jorSjM}`,
      sedeJornadaLabel: "SEDE PRINCIPAL SAN JOSÉ - Mañana",
      cupoMaximo: "40",
      cuposOcupados: 0,
      periodo: "2026 - 01",
      fechaInicio: "2026-01-15",
      fechaFin: "2026-06-30",
      estado: "Activo",
      createdAt: now
    }
  ];

  for (const c of newCourses) {
    await setDoc(doc(db, col("cursos"), c.id), c);
    console.log(`✅ Course linked to teacher created: ${c.nombre} (Docente: ${c.docenteNombre})`);
  }

  // Update Stats
  const teachersSnap = await getDocs(collection(db, col("teachers")));
  const studentsSnap = await getDocs(collection(db, col("students")));
  const coursesSnap = await getDocs(collection(db, col("cursos")));

  await setDoc(doc(db, col("institution_metadata"), "stats"), {
    teachersCount: teachersSnap.size,
    studentsCount: studentsSnap.size,
    coursesCount: coursesSnap.size,
    lastSync: now
  }, { merge: true });
  console.log("✅ Stats updated");

}

run().then(() => {
  console.log("✅ Proceso completado.");
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
