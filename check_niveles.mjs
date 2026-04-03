import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import fs from "fs";

const app = initializeApp({ apiKey: "AIzaSyC3YF1D0ih9ftk2pnFw8u5D1lJqz6KJu_A", projectId: "edunexus-oficial" });
const db = getFirestore(app);

async function check() {
  const snap = await getDocs(collection(db, "colegiosanjose_levels"));
  const data = snap.docs.map(d => d.data());
  fs.writeFileSync("e:/EduNexus/niveles_check.json", JSON.stringify(data, null, 2), "utf-8");
  console.log("Count:", snap.size);
  snap.docs.forEach(d => console.log(d.id, d.data().name));
}
check().then(() => process.exit(0)).catch(console.error);
