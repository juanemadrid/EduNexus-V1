import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyC3YF1D0ih9ftk2pnFw8u5D1lJqz6KJu_A",
  authDomain: "edunexus-oficial.firebaseapp.com",
  projectId: "edunexus-oficial"
});
const db = getFirestore(app);

async function check() {
  const cSnap = await getDocs(collection(db, "colegiosanjose_cursos"));
  console.log("Cursos:");
  cSnap.docs.slice(0, 3).forEach(d => console.log(d.id, d.data()));

  const gSnap = await getDocs(collection(db, "colegiosanjose_grupos"));
  console.log("\nGrupos:");
  gSnap.docs.slice(0, 2).forEach(d => console.log(d.id, d.data()));

  const sSnap = await getDocs(collection(db, "colegiosanjose_students"));
  console.log("\nStudents:");
  sSnap.docs.slice(0, 3).forEach(d => console.log(d.id, d.data().name, d.data().cursoId, d.data().grupoId, d.data().cursos));
}

check().then(()=>process.exit(0)).catch(console.error);
