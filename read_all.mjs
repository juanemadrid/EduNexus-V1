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

async function checkCollections() {
  const c1 = await getDocs(collection(db, "nuevaesperanza_teachers"));
  const c2 = await getDocs(collection(db, "teachers"));
  const c3 = await getDocs(collection(db, "docentes"));
  const c4 = await getDocs(collection(db, "nuevaesperanza_docentes"));
  
  const snapUsers = await getDocs(query(collection(db, "users"), where("role", "==", "Docente")));

  console.log("nuevaesperanza_teachers:", c1.size);
  console.log("teachers:", c2.size);
  console.log("docentes:", c3.size);
  console.log("nuevaesperanza_docentes:", c4.size);
  console.log("users (role=Docente):", snapUsers.size);

  // Auto-Fix if "teachers" has the 8 logic ones:
  if (c2.size > c1.size) {
      console.log("Updating stats based on 'teachers' collection.");
      await setDoc(doc(db, "nuevaesperanza_institution_metadata", "stats"), { teachersCount: c2.size }, { merge: true });
  }

  process.exit();
}

checkCollections();
