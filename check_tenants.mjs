
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3YF1D0ih9ftk2pnFw8u5D1lJqz6KJu_A",
  authDomain: "edunexus-oficial.firebaseapp.com",
  projectId: "edunexus-oficial",
  storageBucket: "edunexus-oficial.firebasestorage.app",
  messagingSenderId: "462948258278",
  appId: "1:462948258278:web:cf75816eb7c3d4351d8627",
  measurementId: "G-BFGNB6DLPE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkTenants() {
  const querySnapshot = await getDocs(collection(db, "tenants"));
  console.log("Total tenants in Firestore:", querySnapshot.size);
  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
  });
}

checkTenants().catch(console.error);
