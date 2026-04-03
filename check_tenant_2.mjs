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

  const teachers = await getDocs(collection(db, col("teachers")));
  const students = await getDocs(collection(db, col("students")));
  const admins = await getDocs(collection(db, col("administrators"))); 
  
  console.log(`Teachers: ${teachers.size}`);
  teachers.docs.forEach(d => console.log(` - ${d.id}: ID=[${d.data().identificacion}] ${d.data().nombres} ${d.data().apellidos}`));
  
  console.log(`Students: ${students.size}`);
  students.docs.forEach(d => console.log(` - ${d.id}: ID=[${d.data().identificacion}] ${d.data().nombres} ${d.data().apellidos}`));

  console.log(`Admins: ${admins.size}`);
}
scan().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
