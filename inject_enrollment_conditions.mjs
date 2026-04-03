import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, doc, setDoc } from "firebase/firestore";

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

const TENANT = "colegiosanjose";
const col = (name) => `${TENANT}_${name}`;

const collectionName = col("enrollment_conditions");

const CONDICIONES = [
  'ANTIGUO', 'CICLO PROPEDÉUTICO', 'CO-TITULACIÓN O TITULACIÓN CONJUNTA',
  'DOBLE PROGRAMA', 'ESTUDIANTE DE ARTICULACIÓN', 'ESTUDIANTES SPP', 'NUEVO',
  'OPCIÓN DE GRADO', 'REINGRESANTE', 'SEMESTRE DE INTERCAMBIO ACADÉMICO',
  'TRANSFERENCIA ENTRE SECCIONALES', 'TRANSFERENCIA EXTERNA', 'TRANSFERENCIA INTERNA'
];

async function seed() {
  console.log(`Buscando colección: ${collectionName}...`);
  
  const snapshot = await getDocs(collection(db, collectionName));
  
  if (!snapshot.empty) {
    console.log(`Ya existen ${snapshot.size} condiciones en la DB. Abortando para no duplicar.`);
    process.exit(0);
  }

  console.log('Inyectando condiciones de matrícula base...');
  
  for (const condName of CONDICIONES) {
    const docId = `cond_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await setDoc(doc(db, collectionName, docId), {
      id: docId,
      name: condName,
      isActive: true,
      createdAt: new Date().toISOString()
    });
  }

  console.log('✅ 13 condiciones de matrícula inyectadas exitosamente (formato Q10).');
}

seed().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
