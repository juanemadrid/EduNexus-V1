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
  
  const tenantsArray = [];
  ts.forEach(d => tenantsArray.push({ id: d.id, ...d.data() }));

  const institutionalMatch = tenantsArray.find(t => 
    t.adminEmail === email ||
    t.slug === domain || 
    (t.name || '').toLowerCase().includes(domain || '')
  );

  if (institutionalMatch) {
      console.log("EXACT MATCH RETURNED BY FIND:", institutionalMatch.id, "Name:", institutionalMatch.name || institutionalMatch.nombre);
  } else {
      console.log("NO MATCH");
  }

  process.exit(0);
}
run();
