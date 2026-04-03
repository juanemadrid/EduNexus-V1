import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3YF1D0ih9ftk2pnFw8u5D1lJqz6KJu_A",
  projectId: "edunexus-oficial"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const tSnap = await getDocs(collection(db, `colegiosanjose_teachers`));
  tSnap.forEach(d => console.log("TEACHER:", d.id, d.data().name, d.data().nombres, d.data().apellidos));

  const sSnap = await getDocs(collection(db, `colegiosanjose_students`));
  sSnap.forEach(d => console.log("STUDENT:", d.id, d.data().name, d.data().nombres, d.data().apellidos));

  process.exit(0);
}

run();
