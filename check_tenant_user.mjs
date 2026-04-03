import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, query, where } from "firebase/firestore";

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

async function scan() {
  const users = await getDocs(query(collection(db, "users"), where("email", "==", "sanjose@gmail.com")));
  if(users.empty) {
    console.log("User sanjose@gmail.com not found!");
  } else {
    users.docs.forEach(doc => {
      console.log(`User: ${doc.id}`);
      console.log(doc.data());
    });
  }

  // Also let's print all collections that end with "teachers" or "students"
  // Since we can't list collections directly in web SDK, let's scan possible tenants
  const t = await getDocs(collection(db, "tenants"));
  t.docs.forEach(doc => console.log(`Tenant: ${doc.id}`));
}
scan().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
