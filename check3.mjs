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
  console.log("Global teachers count:", ts.size);
  ts.forEach(t => console.log(t.data().name, t.data().nombres));
  process.exit(0);
}
run();
