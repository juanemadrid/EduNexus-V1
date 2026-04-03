import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

// Find ALL storage_stats documents across all collections
async function scan() {
  const rootCollections = [
    'settings', 
    'sanjose_settings',
    'nuevaesperanza_settings',
    'institution_settings',
    'san_jose_settings'
  ];
  
  for (const col of rootCollections) {
    try {
      const snap = await getDocs(collection(db, col));
      snap.forEach(d => {
        if (d.id === 'storage_stats' || JSON.stringify(d.data()).includes('storage') || JSON.stringify(d.data()).includes('683')) {
          console.log(`FOUND in ${col}/${d.id}:`, JSON.stringify(d.data(), null, 2));
        }
      });
    } catch(e) {
      // collection doesn't exist
    }
  }
  console.log("Scan complete");
  process.exit();
}

scan();
