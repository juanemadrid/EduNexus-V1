import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3YF1D0ih9ftk2pnFw8u5D1lJqz6KJu_A",
  projectId: "edunexus-oficial"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const ts = await getDocs(collection(db, "tenants"));
  
  const email = 'sanjose@gmail.com';
  const domain = 'gmail';

  for (const d of ts.docs) {
      const t = d.data();
      const matchEmail = t.adminEmail === email;
      const matchSlug = t.slug === domain;
      const matchName = (t.name || '').toLowerCase().includes(domain);
      
      if (matchEmail || matchSlug || matchName) {
          console.log("MATCH INTERNALLY:", d.id, "Name:", t.name, "Email:", t.adminEmail);
      }
  }
  process.exit(0);
}
run();
