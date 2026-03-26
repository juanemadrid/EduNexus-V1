
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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

const instituciones = [
  {
    id: "santamaria",
    name: "Colegio Santa María",
    slug: "santamaria",
    status: "ACTIVE",
    type: "RENTAL",
    createdAt: Date.now()
  },
  {
    id: "comercialnorte",
    name: "Liceo Comercial del Norte",
    slug: "comercialnorte",
    status: "ACTIVE",
    type: "SALE",
    createdAt: Date.now() - 86400000 // hace 1 día
  }
];

async function seed() {
  for (const inst of instituciones) {
    const ref = doc(db, "tenants", inst.id);
    await setDoc(ref, inst);
    console.log(`✅ Institución registrada: ${inst.name} (ID: ${inst.id})`);
  }
  console.log("\n🎉 ¡Listo! Todas las instituciones han sido guardadas en Firestore.");
}

seed().then(() => setTimeout(() => process.exit(0), 2000)).catch(console.error);
