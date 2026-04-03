import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function run() {
  const TENANT = "bd-colegio-san-jose";
  
  console.log("--- TEACHERS ---");
  const tSnap = await getDocs(collection(db, `${TENANT}_teachers`));
  tSnap.forEach(d => {
    const data = d.data();
    console.log(`Teacher: ${data.nombres || ''} ${data.apellidos || ''} ${data.nombre || ''} (ID: ${data.numeroDocumento || d.id})`);
  });

  console.log("\n--- STUDENTS ---");
  const sSnap = await getDocs(collection(db, `${TENANT}_students`));
  sSnap.forEach(d => {
    const data = d.data();
    console.log(`Student: ${data.nombres || ''} ${data.apellidos || ''} ${data.nombre || ''} (ID: ${data.numeroDocumento || d.id})`);
  });

  process.exit(0);
}

run();
