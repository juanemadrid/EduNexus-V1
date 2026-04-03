import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, setDoc } from "firebase/firestore";

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

async function fixStats() {
  console.log("Calculando el número real de docentes...");
  const snapTeachers = await getDocs(collection(db, "nuevaesperanza_teachers"));
  const teachersCount = snapTeachers.size;
  console.log(`Docentes reales en la base de datos: ${teachersCount}`);
  
  console.log("Calculando el número real de estudiantes...");
  const snapEstudiantes = await getDocs(collection(db, "nuevaesperanza_students"));
  const studentsCount = snapEstudiantes.size;
  console.log(`Estudiantes reales en la base de datos: ${studentsCount}`);

  const statsRef = doc(db, "nuevaesperanza_institution_metadata", "stats");
  
  try {
     await updateDoc(statsRef, {
        teachersCount: teachersCount,
        studentsCount: studentsCount,
        lastSync: Date.now()
     });
     console.log("Estadísticas actualizadas con éxito.");
  } catch(e) {
     console.log("Error al hacer updateDoc, intentando setDoc...");
     await setDoc(statsRef, {
        teachersCount: teachersCount,
        studentsCount: studentsCount,
        lastSync: Date.now()
     }, { merge: true });
     console.log("Estadísticas actualizadas con éxito mediante setDoc.");
  }

  process.exit();
}

fixStats();
