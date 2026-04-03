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
const col = (name) => `colegiosanjose_${name}`;

async function run() {
  const c = collection(db, col("students"));
  const snap = await getDocs(c);
  snap.docs.forEach(d => {
    const data = d.data();
    console.log(`- ID: ${d.id} | Name: ${data.name} | isEnrolled: ${data.isEnrolled} | isActive: ${data.isActive} | prog: ${data.programaId || data.programa} | sede: ${data.sedeId || data.sede}`);
  });
}
run().then(()=>process.exit(0));
