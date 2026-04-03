import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, doc, setDoc, deleteDoc } from "firebase/firestore";

const app = initializeApp({ apiKey: "AIzaSyC3YF1D0ih9ftk2pnFw8u5D1lJqz6KJu_A", projectId: "edunexus-oficial" });
const db = getFirestore(app);
const TENANT = "colegiosanjose";
const col = `${TENANT}_levels`;

const correctLevels = [
  { code: "00", name: "Párvulos", order: 1, category: "Preescolar", status: "Activo" },
  { code: "01", name: "Prejardín", order: 2, category: "Preescolar", status: "Activo" },
  { code: "02", name: "Jardín", order: 3, category: "Preescolar", status: "Activo" },
  { code: "03", name: "Transición", order: 4, category: "Preescolar", status: "Activo" },
  { code: "04", name: "Primero (1°)", order: 5, category: "Básica Primaria", status: "Activo" },
  { code: "05", name: "Segundo (2°)", order: 6, category: "Básica Primaria", status: "Activo" },
  { code: "06", name: "Tercero (3°)", order: 7, category: "Básica Primaria", status: "Activo" },
  { code: "07", name: "Cuarto (4°)", order: 8, category: "Básica Primaria", status: "Activo" },
  { code: "08", name: "Quinto (5°)", order: 9, category: "Básica Primaria", status: "Activo" },
  { code: "09", name: "Sexto (6°)", order: 10, category: "Básica Secundaria", status: "Activo" },
  { code: "10", name: "Séptimo (7°)", order: 11, category: "Básica Secundaria", status: "Activo" },
  { code: "11", name: "Octavo (8°)", order: 12, category: "Básica Secundaria", status: "Activo" },
  { code: "12", name: "Noveno (9°)", order: 13, category: "Básica Secundaria", status: "Activo" },
  { code: "13", name: "Décimo (10°)", order: 14, category: "Media", status: "Activo" },
  { code: "14", name: "Once (11°)", order: 15, category: "Media", status: "Activo" },
];

async function run() {
  console.log("🧹 Clearing previous levels in " + col);
  const snap = await getDocs(collection(db, col));
  for (const d of snap.docs) {
    await deleteDoc(doc(db, col, d.id));
  }

  console.log("🚀 Creating 15 correct levels...");
  for (const level of correctLevels) {
    const id = `nivel-${level.code}`;
    await setDoc(doc(db, col, id), {
      id,
      ...level,
      period: "2025-01",
      createdAt: Date.now()
    });
    console.log("  - " + level.name);
  }
}

run().then(() => {
  console.log("✅ Finished successfully.");
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
