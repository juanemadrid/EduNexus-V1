import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection } from "firebase/firestore";

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

async function findSanJoseTenant(db) {
  const snap = await getDocs(collection(db, "tenants"));
  for (const d of snap.docs) {
    const data = d.data();
    const name = (data.name || data.nombre || d.id || '').toLowerCase();
    if (name.includes('san') || name.includes('jose') || name.includes('sanjose')) {
      if (d.id === "bd-colegio-san-jose") return d.id;
    }
  }
  return "bd-colegio-san-jose";
}

async function scan() {
  const TENANT = await findSanJoseTenant(db);
  const col = (name) => `${TENANT}_${name}`;

  const teachers = await getDocs(collection(db, col("teachers")));
  const students = await getDocs(collection(db, col("students")));
  const subjects = await getDocs(collection(db, col("academic_subjects")));
  const cursos = await getDocs(collection(db, col("cursos")));
  const admins = await getDocs(collection(db, col("administrativos"))); // not sure collection name, maybe `users` or `administrators`?
  const users = await getDocs(collection(db, "users")); 
  
  console.log(`Teachers: ${teachers.size}`);
  teachers.docs.forEach(d => console.log(` - ${d.id}: ${JSON.stringify(d.data())}`));
  
  console.log(`Students: ${students.size}`);
  students.docs.forEach(d => console.log(` - ${d.id}: ${d.data().nombres} ${d.data().apellidos}`));

  console.log(`Subjects: ${subjects.size}`);
  console.log(`Courses: ${cursos.size}`);

  console.log(`Admins (col=administrativos): ${admins.size}`);
}
scan().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
