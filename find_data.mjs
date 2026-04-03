import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, listCollections } from "firebase/firestore";

// The listCollections function is not available in the Web SDK directly for security reasons.
// But we can try to guess or use a Node.js admin-like approach if we had the key.
// Since we are using the Web SDK, we can't 'listCollections'.
// However, we can check common names.

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

async function check() {
  const collections = [
    "nuevaesperanza_teachers",
    "nuevaesperanza_docentes",
    "teachers",
    "docentes",
    "users",
    "nuevaesperanza_users",
    "institutional_data",
    "n_esperanza_docentes",
    "n_esperanza_teachers"
  ];

  for (const c of collections) {
    try {
      const snap = await getDocs(collection(db, c));
      console.log(`Collection '${c}': ${snap.size} documents`);
      if (snap.size > 0 && snap.size < 20) {
          snap.forEach(doc => console.log(`  - ${doc.id}: ${JSON.stringify(doc.data().name || doc.data().nombre || doc.id)}`));
      }
    } catch (e) {
      console.log(`Collection '${c}': Error or No Access`);
    }
  }
  process.exit();
}

check();
