import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

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

async function searchID() {
  const targetID = "1102833236";
  const commonCols = [
     "nuevaesperanza_teachers", "teachers", "docentes", "nuevaesperanza_docentes",
     "users", "nuevaesperanza_users", "academic_info", "n_esperanza_teachers"
  ];

  console.log(`Searching for document with ID '${targetID}' in project 'edunexus-oficial'...`);

  for (const cName of commonCols) {
    try {
      const docRef = doc(db, cName, targetID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
          console.log(`FOUND in collection '${cName}':`, snap.data());
      } else {
          // Check if it's inside as a field?
          const all = await getDocs(collection(db, cName));
          all.forEach(d => {
              if (d.data().id === targetID || d.data().identificacion === targetID) {
                  console.log(`FOUND as a FIELD in collection '${cName}', doc '${d.id}':`, d.data());
              }
          });
      }
    } catch (e) {}
  }
  process.exit();
}

searchID();
