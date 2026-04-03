import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3YF1D0ih9ftk2pnFw8u5D1lJqz6KJu_A",
  projectId: "edunexus-oficial"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const tSnap = await getDocs(collection(db, "tenants"));
  tSnap.forEach(d => {
      const data = d.data();
      if (data.adminEmail === 'sanjose@gmail.com') {
          console.log("sanjose@gmail.com belongs to TENANT ID:", d.id);
      }
  });

  // the teachers returned on the UI was 'Darinel'
  // Let's do a cross-search on all teachers collections!
  for (const d of tSnap.docs) {
      const ts = await getDocs(collection(db, `${d.id}_teachers`));
      ts.forEach(t => {
          if (t.data().name?.includes("Darinel") || t.data().nombres?.includes("Darinel") || t.id.includes("Darinel")) {
              console.log("FOUND DARINEL IN TENANT:", d.id, "DATA:", t.data());
          }
      });
  }

  process.exit(0);
}

run();
