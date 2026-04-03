import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import fs from "fs";

const app = initializeApp({
  apiKey: "AIzaSyC3YF1D0ih9ftk2pnFw8u5D1lJqz6KJu_A",
  authDomain: "edunexus-oficial.firebaseapp.com",
  projectId: "edunexus-oficial"
});
const db = getFirestore(app);

async function check() {
  const cSnap = await getDocs(collection(db, "colegiosanjose_cursos"));
  const cursos = cSnap.docs.map(d => ({id: d.id, ...d.data()}));

  const gSnap = await getDocs(collection(db, "colegiosanjose_grupos"));
  const grupos = gSnap.docs.map(d => ({id: d.id, ...d.data()}));

  const sSnap = await getDocs(collection(db, "colegiosanjose_students"));
  const students = sSnap.docs.map(d => ({id: d.id, grupoId: d.data().grupoId, programId: d.data().programaId}));
  
  fs.writeFileSync("e:/EduNexus/out.json", JSON.stringify({
    cursos: cursos.slice(0, 3),
    grupos: grupos.slice(0, 2),
    students: students.slice(0, 5)
  }, null, 2), "utf-8");
}

check().then(()=>process.exit(0)).catch(console.error);
