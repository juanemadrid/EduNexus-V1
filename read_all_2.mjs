import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, doc, setDoc } from "firebase/firestore";

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

async function checkRealCount() {
  const c1 = await getDocs(collection(db, "users"));
  const c2 = await getDocs(collection(db, "nuevaesperanza_users"));
  const c3 = await getDocs(collection(db, "edunexus_users"));

  let count = 0;

  for (const c of [c1, c2, c3]) {
    c.forEach(doc => {
        const data = doc.data();
        if (data.role === "Docente" || data.role === "docente" || data.role === "teacher" || data.tipo === "Docente") {
            count++;
        }
    });
  }

  console.log("Total real docentes found across user collections:", count);

  // Update stats directly to this REAL count
  if (count > 0) {
      await setDoc(doc(db, "nuevaesperanza_institution_metadata", "stats"), { teachersCount: count }, { merge: true });
      console.log("Stats forcefully updated to:", count);
  }

  process.exit();
}

checkRealCount();
