import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3YF1D0ih9ftk2pnFw8u5D1lJqz6KJu_A",
  projectId: "edunexus-oficial"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const ts = await getDocs(collection(db, "teachers"));
  ts.forEach(t => {
      const n = t.data().name || t.data().nombres;
      if (n && n.includes("Darinel")) console.log("FOUND DARINEL IN GLOBAL TEACHERS:", n);
  });
  process.exit(0);
}
run();
