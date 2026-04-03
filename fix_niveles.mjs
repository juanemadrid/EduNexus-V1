import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, doc, updateDoc, deleteDoc } from "firebase/firestore";

const app = initializeApp({ apiKey: "AIzaSyC3YF1D0ih9ftk2pnFw8u5D1lJqz6KJu_A", projectId: "edunexus-oficial" });
const db = getFirestore(app);
const col = "colegiosanjose_levels";

// Map by code -> correct name
const correctNames = {
  "00": "Párvulos",
  "01": "Prejardín",
  "02": "Jardín",
  "03": "Transición",
  "04": "Primero (1°)",
  "05": "Segundo (2°)",
  "06": "Tercero (3°)",
  "07": "Cuarto (4°)",
  "08": "Quinto (5°)",
  "09": "Sexto (6°)",
  "10": "Séptimo (7°)",
  "11": "Octavo (8°)",
  "12": "Noveno (9°)",
  "13": "Décimo (10°)",
  "14": "Once (11°)"
};

async function fix() {
  const snap = await getDocs(collection(db, col));
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  // Find duplicates by code - keep first, delete rest
  const seenCodes = {};
  for (const d of docs) {
    const code = d.code || "";
    if (seenCodes[code]) {
      console.log("🗑  Deleting duplicate:", d.id, code, d.name);
      await deleteDoc(doc(db, col, d.id));
    } else {
      seenCodes[code] = d.id;
    }
  }
  
  // Now fix names
  const snap2 = await getDocs(collection(db, col));
  for (const d of snap2.docs) {
    const data = d.data();
    const correctName = correctNames[data.code];
    if (correctName && data.name !== correctName) {
      await updateDoc(doc(db, col, d.id), { name: correctName });
      console.log("✓ Fixed:", data.code, data.name, "->", correctName);
    }
  }
  
  console.log("\n✅ All done! Checking final state:");
  const snap3 = await getDocs(collection(db, col));
  snap3.docs.sort((a,b)=>(a.data().order||0)-(b.data().order||0))
    .forEach(d => console.log(` ${d.data().code} | ${d.data().name} | Order: ${d.data().order}`));
}

fix().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
