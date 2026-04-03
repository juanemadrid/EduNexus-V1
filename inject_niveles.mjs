import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyC3YF1D0ih9ftk2pnFw8u5D1lJqz6KJu_A",
  authDomain: "edunexus-oficial.firebaseapp.com",
  projectId: "edunexus-oficial"
});
const db = getFirestore(app);
const TENANT = "colegiosanjose";
const col = (name) => `${TENANT}_${name}`;

const niveles = [
  // Preescolar
  { id: "nivel-parvulos",    code: "00", name: "Párvulos",          order: 1,  category: "Preescolar",    status: "Activo" },
  { id: "nivel-prejardin",   code: "01", name: "Prejardín",         order: 2,  category: "Preescolar",    status: "Activo" },
  { id: "nivel-jardin",      code: "02", name: "Jardín",            order: 3,  category: "Preescolar",    status: "Activo" },
  { id: "nivel-transicion",  code: "03", name: "Transición",        order: 4,  category: "Preescolar",    status: "Activo" },
  // Primaria
  { id: "nivel-primero",     code: "04", name: "Primero (1°)",      order: 5,  category: "Básica Primaria", status: "Activo" },
  { id: "nivel-segundo",     code: "05", name: "Segundo (2°)",      order: 6,  category: "Básica Primaria", status: "Activo" },
  { id: "nivel-tercero",     code: "06", name: "Tercero (3°)",      order: 7,  category: "Básica Primaria", status: "Activo" },
  { id: "nivel-cuarto",      code: "07", name: "Cuarto (4°)",       order: 8,  category: "Básica Primaria", status: "Activo" },
  { id: "nivel-quinto",      code: "08", name: "Quinto (5°)",       order: 9,  category: "Básica Primaria", status: "Activo" },
  // Secundaria
  { id: "nivel-sexto",       code: "09", name: "Sexto (6°)",        order: 10, category: "Básica Secundaria", status: "Activo" },
  { id: "nivel-septimo",     code: "10", name: "Séptimo (7°)",      order: 11, category: "Básica Secundaria", status: "Activo" },
  { id: "nivel-octavo",      code: "11", name: "Octavo (8°)",       order: 12, category: "Básica Secundaria", status: "Activo" },
  { id: "nivel-noveno",      code: "12", name: "Noveno (9°)",       order: 13, category: "Básica Secundaria", status: "Activo" },
  // Media
  { id: "nivel-decimo",      code: "13", name: "Décimo (10°)",      order: 14, category: "Media",           status: "Activo" },
  { id: "nivel-once",        code: "14", name: "Once (11°)",        order: 15, category: "Media",           status: "Activo" },
];

async function run() {
  console.log("🧹 Limpiando niveles anteriores...");
  const existing = await getDocs(collection(db, col("levels")));
  for (const d of existing.docs) {
    await deleteDoc(doc(db, col("levels"), d.id));
  }

  console.log("✅ Insertando", niveles.length, "niveles reales...");
  for (const nivel of niveles) {
    await setDoc(doc(db, col("levels"), nivel.id), {
      ...nivel,
      createdAt: Date.now()
    });
    console.log("  ✓", nivel.name);
  }

  console.log("\n🎉 Niveles académicos reales cargados correctamente.");
  console.log("   Preescolar: 4  |  Primaria: 5  |  Secundaria: 4  |  Media: 2");
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
