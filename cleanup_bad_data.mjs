import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3YF1D0ih9ftk2pnFw8u5D1lJqz6KJu_A",
  authDomain: "edunexus-oficial.firebaseapp.com",
  projectId: "edunexus-oficial",
  storageBucket: "edunexus-oficial.firebasestorage.app",
  messagingSenderId: "462948258278",
  appId: "1:462948258278:web:cf75816eb7c3d4351d8627"
};

const TENANT = "nuevaesperanza";
const col = (name) => `${TENANT}_${name}`;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteAll(colName) {
  const snap = await getDocs(collection(db, col(colName)));
  for (const d of snap.docs) {
    await deleteDoc(doc(db, col(colName), d.id));
    console.log(`  Deleted: ${col(colName)} / ${d.id}`);
  }
}

async function run() {
  console.log("Eliminando datos mal estructurados que rompieron la app...");
  await deleteAll("branches");
  await deleteAll("schedules");
  await deleteAll("programs");
  await deleteAll("courses");
  await deleteAll("subjects");
  await deleteAll("teachers");
  await deleteAll("students");
  console.log("✅ Limpieza completa. La app está restaurada.");
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
