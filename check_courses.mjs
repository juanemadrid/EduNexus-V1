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

async function scan() {
  const TENANT = "colegiosanjose";
  const col = (name) => `${TENANT}_${name}`;

  const subs = await getDocs(collection(db, col("academic_subjects")));
  const curs = await getDocs(collection(db, col("cursos")));
  const sedes = await getDocs(collection(db, col("sedes")));
  
  console.log("Subjects:");
  subs.docs.forEach(d => console.log(`- ${d.id}: ${d.data().nombre}`));
  console.log("\nCourses:");
  curs.docs.forEach(d => console.log(`- ${d.id}: ${d.data().nombre} (${d.data().programaNombre})`));
  console.log("\nSedes:");
  sedes.docs.forEach(d => console.log(`- ${d.id}: ${d.data().nombre}`));
}
scan().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
